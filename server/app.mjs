import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { transaction } from "./lib/db.mjs";
import {
  id,
  token,
  hash,
  digest,
  seal,
  unseal,
  checkPassword,
  HttpError,
  requireValue,
  email,
  validEmail,
  text,
  otpHash,
  cookieOptions,
} from "./lib/security.mjs";
import {
  offerSchema,
  signerSchema,
  snapshotFrom,
  selected,
  agreementDigest,
  state,
  assertOpen,
} from "./lib/domain.mjs";
import { rules } from "./pricing.mjs";
import { renderAgreement, pdfFromHtml } from "./lib/documents.mjs";
import { providers as providerFactory } from "./lib/providers.mjs";
import { storage as storageFactory } from "./lib/storage.mjs";
import { audit, enqueue, processJobs } from "./lib/jobs.mjs";
import {
  verificationResponse,
  whatsappConfigured,
  whatsappConfig,
  whatsappToken,
} from "./lib/meta.mjs";
import { composeOffer } from "./lib/composer.mjs";
import { bindingEnabled, exactLegalApproval } from "./lib/signing-mode.mjs";
const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const cleanOffer = (o) => ({
  ...o,
  state: state(o),
  tokenSecret: undefined,
  tokenHash: undefined,
});
export function createApi({
  db,
  client,
  config = process.env,
  providers = providerFactory(config),
  storage = storageFactory(config),
  makePdf = (html) => pdfFromHtml(html, config),
  defer = (promise) => promise.catch(() => {}),
}) {
  const app = express();
  app.disable("x-powered-by");
  if (config.VERCEL) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      strictTransportSecurity:
        config.NODE_ENV === "production" ? undefined : false,
    }),
  );
  app.use(cookieParser());
  app.use(
    express.json({
      limit: "4mb",
      verify: (req, res, buffer) => {
        if (req.url.split("?")[0] === "/api/webhooks/whatsapp")
          req.rawBody = buffer;
      },
    }),
  );
  app.use("/api", (req, res, next) => {
    res.set({
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    });
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.path !== "/webhooks/whatsapp" &&
      req.headers.origin !== config.APP_ORIGIN
    )
      return res.status(403).json({ error: "מקור בקשה אינו מורשה" });
    next();
  });
  async function limit(req, key, max = 60, ms = 60000) {
    const slot = Math.floor(Date.now() / ms),
      _id = hash(key + ":" + slot);
    const doc = await db.collection("limits").findOneAndUpdate(
      { _id },
      {
        $inc: { count: 1 },
        $setOnInsert: { expires: new Date((slot + 2) * ms) },
      },
      { upsert: true, returnDocument: "after" },
    );
    requireValue(doc.count <= max, "יותר מדי בקשות. נסו שוב מאוחר יותר.", 429);
  }
  app.use(
    "/api",
    asyncRoute(async (req, res, next) => {
      await limit(req, "ip:" + req.ip, 150);
      next();
    }),
  );
  const settings = () => db.collection("settings").findOne({ _id: "main" });
  const verifyEvidence = (contract) => {
    const actual = digest(contract.evidence);
    const mac = createHmac(
      "sha256",
      Buffer.from(config.DATA_ENCRYPTION_KEY, "hex"),
    )
      .update(actual)
      .digest("hex");
    requireValue(
      actual === contract.evidenceDigest && mac === contract.evidenceMac,
      "בדיקת שלמות ראיות החתימה נכשלה",
      500,
    );
  };
  const admin = asyncRoute(async (req, res, next) => {
    const s = await db.collection("sessions").findOne({
      _id: hash(req.cookies.lt_admin || ""),
      kind: "admin",
      expires: { $gt: new Date() },
    });
    requireValue(s, "יש להתחבר כמנהל", 401);
    req.admin = s;
    next();
  });
  const customer = asyncRoute(async (req, res, next) => {
    const s = await db.collection("sessions").findOne({
      _id: hash(req.cookies.lt_customer || ""),
      kind: "customer",
      expires: { $gt: new Date() },
    });
    requireValue(s, "נדרש אימות דוא״ל", 401);
    req.customer = s;
    next();
  });
  const byToken = async (value) => {
    requireValue(/^[a-f0-9]{64}$/.test(value), "ההצעה אינה זמינה", 404);
    const o = await db.collection("offers").findOne({ tokenHash: hash(value) });
    requireValue(o, "ההצעה אינה זמינה", 404);
    if (o.snapshot) {
      const expected = createHmac(
        "sha256",
        Buffer.from(config.DATA_ENCRYPTION_KEY, "hex"),
      )
        .update(digest(o.snapshot))
        .digest("hex");
      requireValue(o.snapshotMac === expected, "בדיקת שלמות ההצעה נכשלה", 500);
    }
    return o;
  };
  const owned = (req, o) =>
    requireValue(
      req.customer.offerId === o._id &&
        req.customer.email === o.input.recipientEmail,
      "אין הרשאה להצעה",
      403,
    );
  // The unguessable private link is the customer's access credential.
  // It does not prove ownership of the recipient's email address.
  const offerAccess = asyncRoute(async (req, res, next) => {
    const o = await byToken(req.params.token);
    if (!o.contractId) assertOpen(o);
    const prior = req.cookies.lt_customer
      ? await db.collection("sessions").findOne({
          _id: hash(req.cookies.lt_customer),
          kind: "customer",
          offerId: o._id,
          email: o.input.recipientEmail,
          expires: { $gt: new Date() },
        })
      : null;
    req.customer = prior || {
      offerId: o._id,
      email: o.input.recipientEmail,
      accessMethod: "offer_link",
    };
    next();
  });
  app.get(
    "/api/health",
    asyncRoute(async (req, res) => {
      await db.command({ ping: 1 });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/login",
    asyncRoute(async (req, res) => {
      await limit(req, "login:" + req.ip, 8, 15 * 60000);
      requireValue(
        await checkPassword(req.body.password, config.ADMIN_PASSWORD_HASH),
        "פרטי כניסה שגויים",
        401,
      );
      const t = token();
      await db.collection("sessions").insertOne({
        _id: hash(t),
        kind: "admin",
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.cookie("lt_admin", t, cookieOptions(config));
      await audit(db, "admin", "login", "session");
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/logout",
    asyncRoute(async (req, res) => {
      await db.collection("sessions").deleteMany({
        _id: {
          $in: [
            hash(req.cookies.lt_admin || ""),
            hash(req.cookies.lt_customer || ""),
          ],
        },
      });
      res.clearCookie("lt_admin", cookieOptions(config));
      res.clearCookie("lt_customer", cookieOptions(config));
      res.json({ ok: true });
    }),
  );
  app.use("/api/admin", admin);
  app.post(
    "/api/admin/attachments",
    asyncRoute(async (req, res) => {
      const label = text(req.body.label, 200),
        encoded = z.string().max(2800000).parse(req.body.data);
      const pdf = Buffer.from(encoded, "base64");
      requireValue(
        pdf.length <= 2 * 1024 * 1024 &&
          pdf.subarray(0, 5).toString() === "%PDF-",
        "נדרש PDF תקין עד 2MB",
      );
      const parsed = await PDFDocument.load(pdf);
      requireValue(parsed.getPageCount() <= 30, "נספח מוגבל ל־30 עמודים");
      const attachmentId = id(),
        artifact = await storage.put(
          pdf,
          "attachments/" + attachmentId + ".enc",
        );
      await db.collection("attachments").insertOne({
        _id: attachmentId,
        label,
        artifact,
        createdAt: new Date(),
      });
      await audit(db, "admin", "attachment_added", attachmentId, {
        digest: artifact.digest,
      });
      res.status(201).json({ id: attachmentId, label });
    }),
  );
  app.get(
    "/api/admin/settings",
    asyncRoute(async (req, res) => {
      const settingsDoc = await settings();
      res.json({
        ...settingsDoc,
        capabilities: {
          mail: providers.mailReady,
          whatsapp: whatsappConfigured(whatsappConfig(config, settingsDoc)),
          whatsappCredentials: !!(
            whatsappToken(config) && config.META_PHONE_NUMBER_ID
          ),
          pdf: true,
          binding: bindingEnabled(config, settingsDoc),
          publishing: /^[a-f0-9]{64}$/i.test(config.DATA_ENCRYPTION_KEY || ""),
          storage: config.S3_BUCKET ? "private_s3" : "encrypted_mongodb",
        },
      });
    }),
  );
  app.put(
    "/api/admin/settings",
    asyncRoute(async (req, res) => {
      const data = z
        .object({
          businessName: z.string().trim().min(1).max(200),
          businessId: z.string().max(50),
          businessAddress: z.string().max(500),
          adminEmail: z.string().email(),
          adminPhone: z.string().regex(/^\+\d{9,15}$/),
          whatsappConsent: z.boolean(),
          privacyNotice: z.string().min(50).max(16000),
          retentionPolicy: z.string().min(20).max(8000),
          productionApproved: z.boolean(),
          signingMode: z.enum(["production", "test"]).optional(),
          whatsappEnabled: z.boolean().optional(),
          whatsappTemplateName: z
            .string()
            .regex(/^[a-z0-9_]{1,512}$/)
            .optional(),
          whatsappTemplateLanguage: z
            .string()
            .regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/)
            .optional(),
        })
        .strict()
        .parse(req.body);
      if (data.signingMode === "production")
        requireValue(
          data.productionApproved &&
            data.businessId.trim() &&
            data.businessAddress.trim(),
          "יש להשלים את פרטי העסק ולאשר הפעלה בפועל",
        );
      await transaction(client, async (session) => {
        await db
          .collection("settings")
          .updateOne({ _id: "main" }, { $set: data }, { session });
        await audit(
          db,
          "admin",
          "settings_updated",
          "main",
          {
            productionApproved: data.productionApproved,
            signingMode: data.signingMode,
          },
          session,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/admin/diagnostics/pdf",
    asyncRoute(async (req, res) => {
      await limit(req, "pdf-diagnostic", 3, 300000);
      req.operationStage = "pdf_diagnostic";
      const started = Date.now();
      try {
        const pdf = await makePdf(
          "<!doctype html><html><body><h1>Luxury Tech PDF readiness</h1></body></html>",
        );
        res.json({
          ready: true,
          bytes: pdf.length,
          elapsedMs: Date.now() - started,
        });
      } catch (error) {
        // Fixed synthetic HTML only; this admin-only endpoint never renders customer input.
        res
          .status(503)
          .json({
            ready: false,
            code: error.code,
            runtimeError: String(error.cause?.message || error.message).slice(
              0,
              2500,
            ),
          });
      }
    }),
  );
  app.get(
    "/api/admin/rules",
    asyncRoute(async (req, res) => res.json((await settings()).rules)),
  );
  app.put(
    "/api/admin/rules",
    asyncRoute(async (req, res) => {
      const value = rules(req.body.rules);
      await transaction(client, async (session) => {
        await db
          .collection("settings")
          .updateOne({ _id: "main" }, { $set: { rules: value } }, { session });
        await audit(
          db,
          "admin",
          "discounts_updated",
          "main",
          { rules: value },
          session,
        );
      });
      res.json(value);
    }),
  );
  app.get(
    "/api/admin/catalog",
    asyncRoute(async (req, res) =>
      res.json(await db.collection("catalog").find().toArray()),
    ),
  );
  app.put(
    "/api/admin/catalog/:product",
    asyncRoute(async (req, res) => {
      requireValue(["ecommerce", "management"].includes(req.params.product));
      const current = await db
        .collection("catalog")
        .findOne({ _id: req.params.product });
      const tiers = z
        .array(
          z.object({
            name: z.enum(["STARTER", "PRO", "CUSTOM"]),
            setup: z.number().int().min(1).max(100000000),
            monthly: z.number().int().min(1).max(100000000),
            features: z.array(z.string().max(1000)).max(100),
            approved: z.boolean().optional(),
          }),
        )
        .length(3)
        .parse(req.body.tiers);
      requireValue(new Set(tiers.map((t) => t.name)).size === 3);
      await transaction(client, async (session) => {
        await db
          .collection("catalog")
          .updateOne({ _id: current._id }, { $set: { tiers } }, { session });
        await audit(db, "admin", "catalog_updated", current._id, {}, session);
      });
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/admin/templates",
    asyncRoute(async (req, res) =>
      res.json(
        await db
          .collection("templates")
          .find()
          .sort({ createdAt: -1 })
          .toArray(),
      ),
    ),
  );
  app.post(
    "/api/admin/templates",
    asyncRoute(async (req, res) => {
      const data = z
        .object({
          product: z.enum(["ecommerce", "management"]),
          tier: z.enum(["STARTER", "PRO", "CUSTOM"]),
          title: z.string().min(1).max(200),
          body: z.string().min(100).max(50000),
        })
        .strict()
        .parse(req.body);
      const latest = await db
        .collection("templates")
        .findOne(
          { product: data.product, tier: data.tier },
          { sort: { version: -1 } },
        );
      const doc = {
        _id: id(),
        ...data,
        version: (latest?.version || 0) + 1,
        approved: false,
        createdAt: new Date(),
      };
      await transaction(client, async (session) => {
        await db.collection("templates").insertOne(doc, { session });
        await audit(db, "admin", "template_created", doc._id, {}, session);
      });
      res.status(201).json(doc);
    }),
  );
  app.post(
    "/api/admin/templates/:id/approve",
    asyncRoute(async (req, res) => {
      const reviewer = text(req.body.reviewer, 200);
      const approvalKind =
        req.body.approvalKind === "owner" ? "owner" : "legal_review";
      requireValue(
        reviewer.length > 2 && req.body.confirm === true,
        "יש לאשר את גרסת התבנית ולציין את הגורם המאשר",
      );
      await transaction(client, async (session) => {
        const t = await db
          .collection("templates")
          .findOne({ _id: req.params.id }, { session });
        requireValue(t, "תבנית לא נמצאה", 404);
        await db.collection("templates").updateOne(
          { _id: t._id, approved: false },
          {
            $set: {
              approved: true,
              approvalKind,
              reviewer,
              approvedAt: new Date(),
              approvalDigest: digest({
                title: t.title,
                body: t.body,
                version: t.version,
              }),
            },
          },
          { session },
        );
        await audit(
          db,
          "admin",
          approvalKind === "owner"
            ? "template_owner_approved"
            : "legal_template_approved",
          t._id,
          { reviewer },
          session,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/admin/dashboard",
    asyncRoute(async (req, res) => {
      const offers = await db
        .collection("offers")
        .find(
          {},
          {
            projection: { input: 0, snapshot: 0, tokenSecret: 0, tokenHash: 0 },
          },
        )
        .toArray();
      const counts = {
        total: offers.length,
        draft: 0,
        sent: 0,
        viewed: 0,
        signed: 0,
        expired: 0,
        revoked: 0,
      };
      for (const o of offers) counts[state(o)]++;
      res.json({
        counts,
        awaitingPayment: await db
          .collection("contractStates")
          .countDocuments({ payment: "awaiting_payment" }),
        activity: await db
          .collection("audit")
          .find()
          .sort({ at: -1 })
          .limit(30)
          .toArray(),
      });
    }),
  );
  app.get(
    "/api/admin/offers",
    asyncRoute(async (req, res) => {
      const query = String(req.query.q || "").toLowerCase(),
        status = String(req.query.status || "");
      const docs = await db
        .collection("offers")
        .find({}, { projection: { tokenHash: 0, tokenSecret: 0, snapshot: 0 } })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();
      res.json(
        docs
          .map(cleanOffer)
          .filter(
            (o) =>
              (!status || o.state === status) &&
              (!query ||
                (
                  o.input.title +
                  " " +
                  o.input.clientLabel +
                  " " +
                  o.input.recipientEmail
                )
                  .toLowerCase()
                  .includes(query)),
          ),
      );
    }),
  );
  app.post(
    "/api/admin/offers/compose",
    asyncRoute(async (req, res) => {
      res.json(
        composeOffer(
          req.body,
          await settings(),
          await db.collection("catalog").find().toArray(),
        ),
      );
    }),
  );
  app.post(
    "/api/admin/offers",
    asyncRoute(async (req, res) => {
      const input = offerSchema.parse(req.body);
      const doc = {
        _id: id(),
        input,
        status: "draft",
        version: 1,
        createdAt: new Date(),
      };
      await transaction(client, async (session) => {
        await db.collection("offers").insertOne(doc, { session });
        await audit(db, "admin", "offer_drafted", doc._id, {}, session);
      });
      res.status(201).json(cleanOffer(doc));
    }),
  );
  app.get(
    "/api/admin/offers/:id",
    asyncRoute(async (req, res) => {
      const doc = await db.collection("offers").findOne({ _id: req.params.id });
      requireValue(doc, "ההצעה לא נמצאה", 404);
      res.json({
        ...cleanOffer(doc),
        url: doc.tokenSecret
          ? "/offer/" + unseal(doc.tokenSecret, config)
          : null,
      });
    }),
  );
  app.put(
    "/api/admin/offers/:id",
    asyncRoute(async (req, res) => {
      const input = offerSchema.parse(req.body);
      await transaction(client, async (session) => {
        const r = await db.collection("offers").updateOne(
          {
            _id: req.params.id,
            status: "draft",
            revokedAt: { $exists: false },
          },
          { $set: { input }, $inc: { version: 1 } },
          { session },
        );
        requireValue(r.modifiedCount, "אפשר לערוך טיוטות בלבד", 409);
        await audit(db, "admin", "draft_updated", req.params.id, {}, session);
      });
      res.json({ ok: true });
    }),
  );
  async function build(o) {
    const settingsDoc = await settings(),
      legal = {};
    for (const t of o.input.tiers) {
      const template = await db
        .collection("templates")
        .findOne(
          { product: o.input.product, tier: t.name },
          { sort: { version: -1 } },
        );
      requireValue(template, "חסרה תבנית הסכם");
      legal[t.name] = template;
    }
    const s = snapshotFrom(o.input, settingsDoc, legal);
    s.version = o.version;
    s.createdAt = o.createdAt.toISOString();
    s.attachments = [];
    for (const attachmentId of o.input.attachments || []) {
      const a = await db
        .collection("attachments")
        .findOne({ _id: attachmentId });
      requireValue(a, "נספח לא נמצא");
      s.attachments.push({
        id: a._id,
        label: a.label,
        digest: a.artifact.digest,
      });
    }
    delete s.digest;
    s.digest = digest(s);
    return s;
  }
  app.get(
    "/api/admin/offers/:id/preview",
    asyncRoute(async (req, res) => {
      const o = await db.collection("offers").findOne({ _id: req.params.id });
      requireValue(o, "לא נמצא", 404);
      const s = o.snapshot || (await build(o));
      if (req.query.tier) {
        const q = selected(s, req.query.tier, req.query.months);
        res
          .type("html")
          .set(
            "Content-Security-Policy",
            "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:",
          )
          .send(await renderAgreement(s, q));
      } else res.json(s);
    }),
  );
  app.post(
    "/api/admin/offers/:id/publish",
    asyncRoute(async (req, res) => {
      req.operationStage = "publish_validation";
      requireValue(
        /^[a-f0-9]{64}$/i.test(config.DATA_ENCRYPTION_KEY || ""),
        "לא ניתן לפרסם: יש להגדיר ב-Vercel את DATA_ENCRYPTION_KEY כמפתח הצפנה בן 64 תווי hex ולפרוס מחדש. אין לשנות מפתח קיים של הסכמים שמורים.",
        503,
      );
      const o = await db.collection("offers").findOne({
        _id: req.params.id,
        status: "draft",
        revokedAt: { $exists: false },
      });
      requireValue(o, "ההצעה אינה טיוטה", 409);
      req.operationStage = "publish_snapshot";
      const snapshot = await build(o),
        t = token();
      requireValue(
        req.body.previewDigest === snapshot.digest,
        "הטיוטה או ברירות המחדל השתנו. יש לבדוק תצוגה מקדימה שוב.",
        409,
      );
      req.operationStage = "publish_transaction";
      await transaction(client, async (session) => {
        const r = await db.collection("offers").updateOne(
          { _id: o._id, status: "draft", version: o.version },
          {
            $set: {
              snapshot,
              snapshotMac: createHmac(
                "sha256",
                Buffer.from(config.DATA_ENCRYPTION_KEY, "hex"),
              )
                .update(digest(snapshot))
                .digest("hex"),
              status: "published",
              expires: new Date(o.input.expires),
              tokenHash: hash(t),
              tokenSecret: seal(t, config),
              publishedAt: new Date(),
            },
          },
          { session },
        );
        requireValue(r.modifiedCount, "הטיוטה השתנתה. נסו שוב.", 409);
        await db.collection("clients").updateOne(
          { _id: hash(o.input.recipientEmail) },
          {
            $set: {
              email: o.input.recipientEmail,
              label: o.input.clientLabel,
              updatedAt: new Date(),
            },
          },
          { upsert: true, session },
        );
        await audit(
          db,
          "admin",
          "offer_published",
          o._id,
          { snapshotDigest: snapshot.digest },
          session,
        );
      });
      res.json({ url: "/offer/" + t });
    }),
  );
  app.post(
    "/api/admin/offers/:id/revoke",
    asyncRoute(async (req, res) => {
      await transaction(client, async (session) => {
        const r = await db.collection("offers").updateOne(
          {
            _id: req.params.id,
            contractId: { $exists: false },
            revokedAt: { $exists: false },
          },
          { $set: { revokedAt: new Date() } },
          { session },
        );
        requireValue(r.modifiedCount, "לא ניתן לבטל הצעה חתומה או מבוטלת", 409);
        await audit(db, "admin", "offer_revoked", req.params.id, {}, session);
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/admin/offers/:id/duplicate",
    asyncRoute(async (req, res) => {
      const o = await db.collection("offers").findOne({ _id: req.params.id });
      requireValue(o, "לא נמצא", 404);
      const copy = {
        _id: id(),
        input: {
          ...o.input,
          expires: new Date(Date.now() + 14 * 86400000).toISOString(),
        },
        status: "draft",
        version: 1,
        revisionOf: o._id,
        createdAt: new Date(),
      };
      await transaction(client, async (session) => {
        await db.collection("offers").insertOne(copy, { session });
        await audit(
          db,
          "admin",
          "offer_revised",
          copy._id,
          { previous: o._id },
          session,
        );
      });
      res.status(201).json(copy);
    }),
  );
  app.get(
    "/api/offers/:token/access",
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      if (!o.contractId) assertOpen(o);
      res.json({ requiresVerification: false });
    }),
  );
  async function challenge(req, res, o) {
    await limit(req, "otp-ip:" + req.ip, 8, 15 * 60000);
    await limit(req, "otp-offer:" + o._id, 5, 15 * 60000);
    requireValue(providers.mailReady, "שירות אימות דוא״ל אינו מוגדר", 503);
    const entered = email(req.body.email);
    if (entered !== o.input.recipientEmail) return res.json({ ok: true });
    const challengeId = id(),
      code = String(randomInt(100000, 1000000));
    await db.collection("challenges").updateOne(
      { _id: o._id },
      {
        $set: {
          challengeId,
          codeHash: otpHash(code, challengeId, config),
          email: entered,
          expires: new Date(Date.now() + 5 * 60000),
          attempts: 0,
          consumed: false,
        },
      },
      { upsert: true },
    );
    try {
      await providers.email({
        to: entered,
        subject: "Luxury Tech — קוד אימות",
        text: `קוד האימות שלך: ${code}\nהקוד בתוקף ל־5 דקות. אין להעבירו לאחרים.`,
      });
    } catch (e) {
      await db.collection("challenges").deleteOne({ _id: o._id, challengeId });
      throw e;
    }
    res.json({ ok: true });
  }
  async function verify(req, res, o) {
    await limit(req, "verify:" + req.ip + ":" + o._id, 12, 15 * 60000);
    const c = await db.collection("challenges").findOneAndUpdate(
      {
        _id: o._id,
        email: email(req.body.email),
        expires: { $gt: new Date() },
        attempts: { $lt: 5 },
        consumed: false,
      },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" },
    );
    requireValue(
      c &&
        typeof req.body.code === "string" &&
        c.codeHash === otpHash(req.body.code, c.challengeId, config),
      "קוד האימות אינו תקין או פג",
      401,
    );
    const used = await db
      .collection("challenges")
      .updateOne(
        { _id: o._id, challengeId: c.challengeId, consumed: false },
        { $set: { consumed: true } },
      );
    requireValue(used.modifiedCount, "קוד האימות כבר נוצל", 401);
    const t = token();
    await db.collection("sessions").insertOne({
      _id: hash(t),
      kind: "customer",
      offerId: o._id,
      email: c.email,
      verifiedAt: new Date(),
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.cookie("lt_customer", t, cookieOptions(config));
    await audit(db, "customer", "email_verified", o._id);
    res.json({ ok: true });
  }
  app.post(
    "/api/offers/:token/otp",
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      if (!o.contractId) assertOpen(o);
      await challenge(req, res, o);
    }),
  );
  app.post(
    "/api/offers/:token/verify",
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      if (!o.contractId) assertOpen(o);
      await verify(req, res, o);
    }),
  );
  app.post(
    "/api/contract-access/:id/otp",
    asyncRoute(async (req, res) => {
      const c = await db
        .collection("contracts")
        .findOne({ _id: req.params.id }, { projection: { offerId: 1 } });
      requireValue(c, "המסמך אינו זמין", 404);
      await challenge(
        req,
        res,
        await db.collection("offers").findOne({ _id: c.offerId }),
      );
    }),
  );
  app.post(
    "/api/contract-access/:id/verify",
    asyncRoute(async (req, res) => {
      const c = await db
        .collection("contracts")
        .findOne({ _id: req.params.id }, { projection: { offerId: 1 } });
      requireValue(c, "המסמך אינו זמין", 404);
      await verify(
        req,
        res,
        await db.collection("offers").findOne({ _id: c.offerId }),
      );
    }),
  );
  app.get(
    "/api/offers/:token/contract",
    offerAccess,
    asyncRoute(async (req, res) => {
      const c = await db
        .collection("contracts")
        .findOne(
          { offerId: req.customer.offerId },
          { projection: { payload: 0, artifact: 0, idempotencyKey: 0 } },
        );
      requireValue(c, "המסמך אינו זמין", 404);
      verifyEvidence(c);
      res.json({ ...c, evidenceMac: undefined });
    }),
  );
  app.get(
    "/api/offers/:token/contract/pdf",
    offerAccess,
    asyncRoute(async (req, res) =>
      download(req, res, { offerId: req.customer.offerId }),
    ),
  );
  app.get(
    "/api/offers/:token",
    offerAccess,
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      owned(req, o);
      if (o.contractId) return res.json({ contractId: o.contractId });
      assertOpen(o);
      if (!o.viewedAt)
        await transaction(client, async (session) => {
          const r = await db
            .collection("offers")
            .updateOne(
              { _id: o._id, viewedAt: { $exists: false } },
              { $set: { viewedAt: new Date() } },
              { session },
            );
          if (r.modifiedCount)
            await audit(db, "customer", "offer_viewed", o._id, {}, session);
        });
      res.json({
        snapshot: o.snapshot,
        email: req.customer.email,
        mode: bindingEnabled(config, await settings()) ? "production" : "test",
      });
    }),
  );
  app.get(
    "/api/offers/:token/agreement",
    offerAccess,
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      owned(req, o);
      assertOpen(o);
      const q = selected(o.snapshot, req.query.tier, req.query.months);
      res.json({
        html: await renderAgreement(o.snapshot, q),
        digest: agreementDigest(o.snapshot, q),
      });
    }),
  );
  app.get(
    "/api/offers/:token/attachments/:id",
    offerAccess,
    asyncRoute(async (req, res) => {
      const o = await byToken(req.params.token);
      owned(req, o);
      assertOpen(o);
      requireValue(
        o.snapshot.attachments?.some((a) => a.id === req.params.id),
        "אין הרשאה לנספח",
        404,
      );
      const a = await db
        .collection("attachments")
        .findOne({ _id: req.params.id });
      requireValue(a, "לא נמצא", 404);
      const pdf = await storage.get(a.artifact);
      res
        .type("pdf")
        .set("Content-Disposition", 'attachment; filename="scope.pdf"')
        .send(pdf);
    }),
  );
  app.post(
    "/api/offers/:token/sign",
    offerAccess,
    asyncRoute(async (req, res) => {
      req.operationStage = "sign_validation";
      await limit(req, "sign:" + req.customer.offerId, 5, 10 * 60000);
      const o = await byToken(req.params.token);
      owned(req, o);
      const data = signerSchema.parse(req.body);
      const existing = await db
        .collection("contracts")
        .findOne({ offerId: o._id }, { projection: { idempotencyKey: 1 } });
      if (existing) {
        requireValue(
          existing.idempotencyKey === data.idempotencyKey,
          "להצעה כבר קיים הסכם חתום",
          409,
        );
        return res.json({ contractId: existing._id });
      }
      assertOpen(o);
      const s = o.snapshot,
        q = selected(s, data.tier, data.months);
      requireValue(
        data.agreementDigest === agreementDigest(s, q),
        "ההסכם השתנה. יש לעיין שוב.",
        409,
      );
      const png = Buffer.from(data.signature.split(",")[1], "base64");
      requireValue(
        png.length > 100 &&
          png.length < 180000 &&
          png
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
        "חתימה אינה תקינה",
      );
      const metadata = await sharp(png, {
        limitInputPixels: 2000000,
      }).metadata();
      requireValue(
        metadata.format === "png" &&
          metadata.width >= 100 &&
          metadata.width <= 2000 &&
          metadata.height >= 50 &&
          metadata.height <= 1000,
        "ממדי החתימה אינם תקינים",
      );
      const settingsDoc = await settings(),
        production = bindingEnabled(config, settingsDoc);
      let legalApproval;
      if (production) {
        requireValue(
          settingsDoc.productionApproved &&
            settingsDoc.businessId &&
            settingsDoc.businessAddress &&
            settingsDoc.adminEmail,
          "הפעלה מחייבת טרם אושרה",
          403,
        );
        legalApproval = await exactLegalApproval(
          db,
          s.tiers.find((t) => t.name === q.tier).legal,
        );
        requireValue(legalApproval, "הנוסח המשפטי בהצעה טרם אושר", 403);
      }
      const contractId = id(),
        at = new Date().toISOString();
      const evidence = {
        contractId,
        offerId: o._id,
        snapshotDigest: s.digest,
        agreementDigest: data.agreementDigest,
        at,
        accessMethod: req.customer.verifiedAt ? "email_otp" : "offer_link",
        emailVerified: !!req.customer.verifiedAt,
        recipientEmail: req.customer.email,
        verifiedAt: req.customer.verifiedAt?.toISOString() || null,
        verifiedEmail: req.customer.verifiedAt ? req.customer.email : null,
        ipHash: hash(req.ip),
        userAgentHash: hash(req.headers["user-agent"] || ""),
        consents: {
          agreement: true,
          privacy: true,
          deliberateSignature: true,
          authority: data.authority,
        },
        signatureDigest: hash(png),
        mode: production ? "production" : "test",
        ...(legalApproval
          ? {
              legalApproval: {
                templateId: legalApproval._id,
                version: legalApproval.version,
                reviewer: legalApproval.reviewer,
                approvedAt: legalApproval.approvedAt,
                approvalDigest: legalApproval.approvalDigest,
                approvalKind: legalApproval.approvalKind || "legal_review",
              },
            }
          : {}),
      };
      const evidenceDigest = digest(evidence),
        evidenceMac = createHmac(
          "sha256",
          Buffer.from(config.DATA_ENCRYPTION_KEY, "hex"),
        )
          .update(evidenceDigest)
          .digest("hex");
      req.operationStage = "agreement_render";
      const html = await renderAgreement(s, q, {
        id: contractId,
        at,
        verifiedAt: evidence.verifiedAt,
        accessMethod: evidence.accessMethod,
        email: req.customer.email,
        signer: data,
        evidenceDigest,
        mode: evidence.mode,
      });
      req.operationStage = "pdf_generation";
      let pdf = await makePdf(html);
      if (s.attachments?.length) {
        const combined = await PDFDocument.load(pdf);
        for (const ref of s.attachments) {
          const a = await db.collection("attachments").findOne({ _id: ref.id });
          requireValue(
            a && a.artifact.digest === ref.digest,
            "נספח השתנה או אינו זמין",
            409,
          );
          const appendix = await PDFDocument.load(
            await storage.get(a.artifact),
          );
          for (const page of await combined.copyPages(
            appendix,
            appendix.getPageIndices(),
          ))
            combined.addPage(page);
        }
        pdf = Buffer.from(await combined.save());
      }
      req.operationStage = "encrypted_storage";
      const artifact = await storage.put(
        pdf,
        "contracts/" + contractId + ".enc",
      );
      const contract = {
        _id: contractId,
        offerId: o._id,
        idempotencyKey: data.idempotencyKey,
        email: req.customer.email,
        clientLabel: o.input.clientLabel,
        product: s.product,
        tier: q.tier,
        months: q.months,
        monthly: q.monthly,
        total: q.total,
        mode: evidence.mode,
        createdAt: new Date(at),
        evidence,
        evidenceDigest,
        evidenceMac,
        artifact,
        payload: seal({ snapshot: s, quote: q, signer: data, html }, config),
      };
      req.operationStage = "sign_transaction";
      try {
        await transaction(client, async (session) => {
          if (production) {
            const current = await db
              .collection("settings")
              .findOne({ _id: "main" }, { session });
            requireValue(
              current.productionApproved && bindingEnabled(config, current),
              "הפעלה מחייבת בוטלה",
              403,
            );
          }
          const r = await db.collection("offers").updateOne(
            {
              _id: o._id,
              status: "published",
              contractId: { $exists: false },
              revokedAt: { $exists: false },
              expires: { $gt: new Date() },
            },
            { $set: { contractId, signedAt: new Date(at) } },
            { session },
          );
          requireValue(r.modifiedCount, "ההצעה אינה זמינה לחתימה", 409);
          await db.collection("contracts").insertOne(contract, { session });
          await db.collection("contractStates").insertOne(
            {
              _id: contractId,
              payment: "awaiting_payment",
              service: "pending",
            },
            { session },
          );
          await enqueue(db, contract, settingsDoc, config, session);
          await audit(
            db,
            "customer",
            "contract_signed",
            contractId,
            { evidenceDigest, mode: evidence.mode },
            session,
          );
        });
      } catch (e) {
        const duplicate = await db
          .collection("contracts")
          .findOne({ offerId: o._id }, { projection: { idempotencyKey: 1 } });
        if (duplicate?.idempotencyKey === data.idempotencyKey)
          return res.json({ contractId: duplicate._id });
        throw e;
      }
      res.status(201).json({ contractId });
      defer(processJobs(db, providers, config, 3));
    }),
  );
  app.get(
    "/api/customer/contracts/:id",
    customer,
    asyncRoute(async (req, res) => {
      const c = await db.collection("contracts").findOne(
        {
          _id: req.params.id,
          offerId: req.customer.offerId,
          email: req.customer.email,
        },
        {
          projection: {
            payload: 0,
            artifact: 0,
            idempotencyKey: 0,
          },
        },
      );
      requireValue(c, "אין הרשאה למסמך", 404);
      verifyEvidence(c);
      res.json({ ...c, evidenceMac: undefined });
    }),
  );
  async function download(req, res, filter) {
    const c = await db.collection("contracts").findOne(filter);
    requireValue(c, "המסמך אינו זמין", 404);
    verifyEvidence(c);
    const pdf = await storage.get(c.artifact);
    res
      .type("pdf")
      .set(
        "Content-Disposition",
        `attachment; filename="Luxury-Tech-${c._id}.pdf"`,
      )
      .send(pdf);
  }
  app.get(
    "/api/customer/contracts/:id/pdf",
    customer,
    asyncRoute(async (req, res) =>
      download(req, res, {
        _id: req.params.id,
        offerId: req.customer.offerId,
        email: req.customer.email,
      }),
    ),
  );
  app.get(
    "/api/admin/contracts",
    asyncRoute(async (req, res) => {
      const cs = await db
        .collection("contracts")
        .find(
          {},
          {
            projection: {
              payload: 0,
              artifact: 0,
              evidenceMac: 0,
              idempotencyKey: 0,
              email: 0,
            },
          },
        )
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();
      const states = await db.collection("contractStates").find().toArray();
      res.json(
        cs.map((c) => ({ ...c, state: states.find((s) => s._id === c._id) })),
      );
    }),
  );
  app.get(
    "/api/admin/contracts/export",
    asyncRoute(async (req, res) => {
      const cs = await db
        .collection("contracts")
        .find(
          {},
          {
            projection: {
              _id: 1,
              product: 1,
              tier: 1,
              months: 1,
              monthly: 1,
              total: 1,
              mode: 1,
              createdAt: 1,
            },
          },
        )
        .toArray();
      res
        .type("text/csv")
        .set("Content-Disposition", 'attachment; filename="contracts.csv"')
        .send(
          "id,product,tier,months,monthly_agorot,total_agorot,mode,created_utc\n" +
            cs
              .map((c) =>
                [
                  c._id,
                  c.product,
                  c.tier,
                  c.months,
                  c.monthly,
                  c.total,
                  c.mode,
                  c.createdAt.toISOString(),
                ].join(","),
              )
              .join("\n"),
        );
    }),
  );
  app.get(
    "/api/admin/contracts/:id",
    asyncRoute(async (req, res) => {
      const c = await db
        .collection("contracts")
        .findOne({ _id: req.params.id });
      requireValue(c, "לא נמצא", 404);
      const payload = unseal(c.payload, config);
      verifyEvidence(c);
      res.json({
        ...c,
        artifact: undefined,
        payload,
        state: await db.collection("contractStates").findOne({ _id: c._id }),
        notifications: await db
          .collection("jobs")
          .find({ contractId: c._id })
          .toArray(),
        audit: await db
          .collection("audit")
          .find({ subject: c._id })
          .sort({ at: 1 })
          .toArray(),
      });
    }),
  );
  app.get(
    "/api/admin/contracts/:id/pdf",
    asyncRoute(async (req, res) => download(req, res, { _id: req.params.id })),
  );
  app.post(
    "/api/admin/contracts/:id/payment",
    asyncRoute(async (req, res) => {
      const payment = z
          .enum(["awaiting_payment", "paid"])
          .parse(req.body.payment),
        service = z
          .enum(["pending", "active", "expired", "revoked", "cancelled"])
          .parse(req.body.service);
      await transaction(client, async (session) => {
        const r = await db
          .collection("contractStates")
          .updateOne(
            { _id: req.params.id },
            { $set: { payment, service, updatedAt: new Date() } },
            { session },
          );
        requireValue(r.matchedCount, "לא נמצא", 404);
        await audit(
          db,
          "admin",
          "payment_state_changed",
          req.params.id,
          { payment, service },
          session,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/admin/contracts/:id/retry-notifications",
    asyncRoute(async (req, res) => {
      await db.collection("jobs").updateMany(
        {
          contractId: req.params.id,
          status: { $in: ["failed", "not_configured", "retry"] },
        },
        {
          $set: { status: "pending", nextAt: new Date() },
          $unset: { lastError: "" },
        },
      );
      await audit(db, "admin", "notifications_requeued", req.params.id);
      res.json({ processed: await processJobs(db, providers, config) });
    }),
  );
  app.post(
    "/api/admin/jobs/run",
    asyncRoute(async (req, res) =>
      res.json({ processed: await processJobs(db, providers, config) }),
    ),
  );
  app.get(
    "/api/cron/notifications",
    asyncRoute(async (req, res) => {
      requireValue(
        config.CRON_SECRET &&
          req.headers.authorization === "Bearer " + config.CRON_SECRET,
        "Unauthorized",
        401,
      );
      res.json({ processed: await processJobs(db, providers, config) });
    }),
  );
  app.get("/api/webhooks/whatsapp", (req, res) => {
    const result = verificationResponse(req.query, config);
    res.status(result.status).type("text").send(result.body);
  });
  app.post(
    "/api/webhooks/whatsapp",
    asyncRoute(async (req, res) => {
      requireValue(
        config.META_APP_SECRET && req.rawBody,
        "Webhook not configured",
        401,
      );
      const actual = Buffer.from(
          String(req.headers["x-hub-signature-256"] || ""),
        ),
        expected = Buffer.from(
          "sha256=" +
            createHmac("sha256", config.META_APP_SECRET)
              .update(req.rawBody)
              .digest("hex"),
        );
      requireValue(
        actual.length === expected.length && timingSafeEqual(actual, expected),
        "Invalid webhook signature",
        401,
      );
      for (const entry of req.body.entry || [])
        for (const change of entry.changes || [])
          for (const event of change.value?.statuses || []) {
            if (!["sent", "delivered", "read", "failed"].includes(event.status))
              continue;
            const allowed =
              event.status === "read"
                ? ["accepted", "sent", "delivered"]
                : event.status === "delivered"
                  ? ["accepted", "sent"]
                  : ["accepted", "sent"];
            await db.collection("jobs").updateOne(
              {
                providerId: event.id,
                channel: "whatsapp",
                status: { $in: allowed },
              },
              {
                $set: {
                  status: event.status,
                  deliveryAt: new Date(Number(event.timestamp) * 1000),
                  ...(event.status === "failed"
                    ? { lastError: "provider_delivery_failed" }
                    : {}),
                },
              },
            );
          }
      res.json({ ok: true });
    }),
  );
  app.use((req, res) => res.status(404).json({ error: "הנתיב אינו קיים" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 11000)
      return res
        .status(409)
        .json({ error: "הנתונים השתנו במקביל. רעננו ונסו שוב." });
    const status =
      error.status ||
      (error instanceof z.ZodError || error.message?.startsWith("Invalid")
        ? 400
        : 500);
    const requestId = id();
    if (status >= 500)
      console.error(
        JSON.stringify({
          event: "api_error",
          requestId,
          method: req.method,
          // Log diagnostic identifiers only; never request bodies or provider secrets.
          path: req.route?.path || "unknown",
          name: error.name,
          code: error.code,
          stage: req.operationStage,
          causeName: error.cause?.name,
          causeCode: error.cause?.code,
          frames: error.stack
            ?.split("\n")
            .slice(1, 4)
            .map((v) => v.trim()),
        }),
      );
    res.status(status).json({
      ...(status >= 500 ? { requestId } : {}),
      error:
        status < 500 || error instanceof HttpError
          ? error instanceof z.ZodError
            ? "בדקו את השדות הנדרשים ואת הערכים שהוזנו"
            : error.message
          : "הפעולה נכשלה. נסו שוב או פנו למנהל.",
    });
  });
  return app;
}
