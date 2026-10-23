import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { scryptSync } from "node:crypto";
import { initialize } from "../../server/lib/db.mjs";
import { createApi } from "../../server/app.mjs";
import supertest from "supertest";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
export const origin = "http://localhost:8080";
export const input = () => ({
  title: "הצעה אישית — בדיקה",
  product: "ecommerce",
  recipientEmail: "client@example.test",
  clientLabel: "לקוח בדיקה",
  description: "חנות מקוונת",
  scope: "חנות עד 200 מוצרים בהתאם לאפיון המאושר.",
  milestones: "אפיון, הקמה ומסירה",
  delivery: "30 ימי עבודה לאחר קבלת התכנים",
  paymentTerms: "הקמה לפני תחילת עבודה; שירות חודשי בתחילת כל חודש",
  cancellation: "בקשת סיום בכתב בהתאם להתחייבות ולדין החל",
  thirdPartyCosts: "דומיין וסליקה אינם כלולים",
  ipTerms: "רישיון שימוש במערכת בתקופת השירות; קוד קודם נשאר בבעלות הספק",
  dataExit: "יצוא נתוני הלקוח בפורמט CSV בתוך 30 ימים מסיום",
  liability: "אחריות בהתאם לנוסח הסכם מאושר ולדין",
  jurisdiction: "דין ישראלי והוראות דין מחייבות",
  renewal: "מחיר ותנאי חידוש מחייבים הסכמה חדשה בכתב",
  expires: new Date(Date.now() + 86400000).toISOString(),
  tax: { mode: "inclusive", bps: 1800 },
  tiers: [
    {
      name: "PRO",
      monthly: 34900,
      setup: 249000,
      features: ["עד 200 מוצרים", "קופונים ודוחות"],
      support: "תמיכה בימי עסקים",
      exclusions: "פיתוח חדש אינו כלול",
      limits: "עד 200 מוצרים",
    },
  ],
  internalNotes: "INTERNAL-NEVER-PUBLIC",
  addons: [],
  attachments: [],
});
export async function setup(options = {}) {
  const repl = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.24" },
  });
  const client = new MongoClient(repl.getUri());
  await client.connect();
  const db = client.db("LT_tests");
  await initialize(db);
  const messages = [],
    deferred = [];
  const config = {
    APP_ORIGIN: origin,
    DATA_ENCRYPTION_KEY: "ab".repeat(32),
    ADMIN_PASSWORD_HASH:
      "testsalt:" +
      scryptSync("test-password-long", "testsalt", 64).toString("hex"),
    MAIL_USER: "sender@example.test",
    MAIL_PASS: "test-only",
    META_TOKEN: "test-only",
    META_PHONE_NUMBER_ID: "123456789",
    META_TEMPLATE_NAME: "contract_signed",
    META_TEMPLATE_LANGUAGE: "he",
    META_SEND_ENABLED: "true",
    META_APP_SECRET: "webhook-test",
    CRON_SECRET: "cron-test",
    ...options.config,
  };
  const providers = {
    mailReady: true,
    whatsappReady: true,
    email: async (m) => {
      messages.push(m);
      return "mail-test-id";
    },
    whatsapp: async () => {
      throw Error("simulated provider failure");
    },
    ...options.providers,
  };
  const makePdf =
    options.makePdf ||
    (async () => {
      const pdf = await PDFDocument.create();
      pdf.addPage();
      return Buffer.from(await pdf.save());
    });
  const app = createApi({
      client,
      db,
      config,
      providers,
      makePdf,
      defer: (p) => deferred.push(p),
    }),
    admin = supertest.agent(app),
    customer = supertest.agent(app);
  const login = await admin
    .post("/api/login")
    .set("Origin", origin)
    .send({ password: "test-password-long" });
  if (login.status !== 200)
    throw Error("Login setup failed " + JSON.stringify(login.body));
  return {
    uri:repl.getUri(),
    app,
    admin,
    customer,
    client,
    db,
    config,
    messages,
    deferred,
    async close() {
      await Promise.allSettled(deferred);
      await client.close();
      await repl.stop();
    },
  };
}
export const post = (agent, path, body = {}) =>
  agent
    .post("/api/" + path)
    .set("Origin", origin)
    .send(body);
export const put = (agent, path, body) =>
  agent
    .put("/api/" + path)
    .set("Origin", origin)
    .send(body);
export async function publish(f, offer = input()) {
  const draft = await post(f.admin, "admin/offers", offer);
  if (draft.status !== 201)
    throw Error("Draft failed " + JSON.stringify(draft.body));
  const preview = await f.admin.get(
    "/api/admin/offers/" + draft.body._id + "/preview",
  );
  if (preview.status !== 200)
    throw Error("Preview failed " + JSON.stringify(preview.body));
  const pub = await post(
    f.admin,
    "admin/offers/" + draft.body._id + "/publish",
    { previewDigest: preview.body.digest },
  );
  if (pub.status !== 200)
    throw Error("Publish failed " + JSON.stringify(pub.body));
  return {
    id: draft.body._id,
    token: pub.body.url.split("/").pop(),
    snapshot: preview.body,
  };
}
export async function verify(
  f,
  o,
  customer = f.customer,
  recipient = "client@example.test",
) {
  const sent = await post(customer, `offers/${o.token}/otp`, {
    email: recipient,
  });
  if (sent.status !== 200)
    throw Error("OTP failed " + JSON.stringify(sent.body));
  const code = f.messages.at(-1).text.match(/\b\d{6}\b/)[0];
  const verified = await post(customer, `offers/${o.token}/verify`, {
    email: recipient,
    code,
  });
  if (verified.status !== 200)
    throw Error("Verify failed " + JSON.stringify(verified.body));
  return code;
}
export async function signing(customer, o, signature) {
  const agreement = await customer.get(
    `/api/offers/${o.token}/agreement?tier=PRO&months=24`,
  );
  const png = await sharp({
    create: { width: 800, height: 240, channels: 4, background: "white" },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="800" height="240"><path d="M50 170 Q250 10 350 170 T650 70" stroke="black" stroke-width="4" fill="none"/></svg>',
        ),
      },
    ])
    .png()
    .toBuffer();
  return {
    fullName: "לקוח בדיקה",
    businessName: "",
    phone: "0501234567",
    registrationId: "",
    company: false,
    role: "",
    authority: false,
    acceptAgreement: true,
    acceptPrivacy: true,
    confirmSignature: true,
    signature: signature || "data:image/png;base64," + png.toString("base64"),
    tier: "PRO",
    months: 24,
    agreementDigest: agreement.body.digest,
    idempotencyKey: "test-idempotency-key-12345",
  };
}
