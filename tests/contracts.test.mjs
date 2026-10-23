import { test } from "node:test";
import assert from "node:assert/strict";
import {
  setup,
  input,
  publish,
  verify,
  signing,
  post,
  put,
} from "./helpers/fixture.mjs";
import { PDFDocument } from "pdf-lib";
import { unseal, seal } from "../server/lib/security.mjs";
test("production legal approvals, attachment freezing, payment state and failed WhatsApp retry", async (t) => {
  const f = await setup({ config: { BINDING_SIGNATURES_ENABLED: "true" } });
  t.after(() => f.close());
  const settings = await f.db.collection("settings").findOne({ _id: "main" });
  await put(f.admin, "admin/settings", {
    businessName: settings.businessName,
    businessId: "TEST-ONLY",
    businessAddress: "כתובת בדיקה",
    adminEmail: "admin@example.test",
    adminPhone: "+972543596761",
    whatsappConsent: true,
    privacyNotice: settings.privacyNotice,
    retentionPolicy: settings.retentionPolicy,
    productionApproved: true,
  });
  assert.equal(
    (
      await post(f.admin, "admin/templates/ecommerce-PRO-v1/approve", {
        reviewer: "TEST REVIEWER — NOT REAL LEGAL APPROVAL",
        confirm: true,
      })
    ).status,
    200,
  );
  const appendix = await PDFDocument.create();
  appendix.addPage();
  const attachment = await post(f.admin, "admin/attachments", {
    label: "נספח בדיקה.pdf",
    data: Buffer.from(await appendix.save()).toString("base64"),
  });
  assert.equal(attachment.status, 201);
  const draft = input();
  draft.attachments = [attachment.body.id];
  draft.addons = [{ label: "הדרכה חד־פעמית", amount: 10000 }];
  const o = await publish(f, draft);
  assert.equal(o.snapshot.attachments.length, 1);
  assert.equal(o.snapshot.quotes.find((q) => q.months === 24).total, 1012840);
  await verify(f, o);
  const data = await signing(f.customer, o);
  const result = await post(f.customer, `offers/${o.token}/sign`, data);
  assert.equal(result.status, 201, JSON.stringify(result.body));
  await Promise.allSettled(f.deferred);
  const contract = await f.db.collection("contracts").findOne();
  assert.equal(contract.mode, "production");
  const job = await f.db.collection("jobs").findOne({ channel: "whatsapp" });
  assert.equal(job.status, "retry");
  assert.equal(job.lastError, "provider_error");
  assert.equal(await f.db.collection("contracts").countDocuments(), 1);
  const detail = await f.admin.get("/api/admin/contracts/" + contract._id);
  assert.equal(detail.body.state.payment, "awaiting_payment");
  assert.equal(
    unseal(contract.payload, f.config).snapshot.attachments[0].id,
    attachment.body.id,
  );
  const artifact = unseal(contract.artifact.encrypted, f.config, true);
  assert.equal((await PDFDocument.load(artifact)).getPageCount(), 2);
  await f.db
    .collection("offers")
    .updateOne({ _id: o.id }, { $set: { expires: new Date(0) } });
  assert.equal(
    (await f.customer.get("/api/customer/contracts/" + contract._id + "/pdf"))
      .status,
    200,
  );
  await f.db
    .collection("contracts")
    .updateOne({ _id: contract._id }, { $set: { "evidence.at": "tampered" } });
  assert.equal(
    (await f.customer.get("/api/customer/contracts/" + contract._id + "/pdf"))
      .status,
    500,
  );
});
test("stale previews, revoked drafts, signature validation and snapshot MAC", async (t) => {
  const f = await setup();
  t.after(() => f.close());
  const d = await post(f.admin, "admin/offers", input()),
    draftId = d.body._id;
  const preview = await f.admin.get(
    "/api/admin/offers/" + draftId + "/preview",
  );
  await put(f.admin, "admin/rules", { rules: [{ months: 24, bps: 0 }] });
  assert.equal(
    (
      await post(f.admin, `admin/offers/${draftId}/publish`, {
        previewDigest: preview.body.digest,
      })
    ).status,
    409,
  );
  await post(f.admin, `admin/offers/${draftId}/revoke`);
  assert.equal(
    (await put(f.admin, "admin/offers/" + draftId, input())).status,
    409,
  );
  assert.equal(
    (
      await post(f.admin, `admin/offers/${draftId}/publish`, {
        previewDigest: preview.body.digest,
      })
    ).status,
    409,
  );
  const o = await publish(f);
  await verify(f, o);
  const data = await signing(f.customer, o);
  assert.equal(
    (
      await post(f.customer, `offers/${o.token}/sign`, {
        ...data,
        signature: "data:image/png;base64,AAAA",
      })
    ).status,
    400,
  );
  await f.db
    .collection("offers")
    .updateOne({ _id: o.id }, { $set: { "snapshot.quotes.0.monthly": 1 } });
  assert.equal((await f.customer.get("/api/offers/" + o.token)).status, 500);
});
