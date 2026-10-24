import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, publish, signing, post, put } from "./helpers/fixture.mjs";
import { unseal } from "../server/lib/security.mjs";
import { exactLegalApproval } from "../server/lib/signing-mode.mjs";

test("admin activates production and English WhatsApp notifications without changing a frozen offer", async (t) => {
  const sent = [];
  const f = await setup({
    config: { BINDING_SIGNATURES_ENABLED: "false", META_SEND_ENABLED: "false" },
    providers: {
      whatsapp: async (message) => {
        sent.push(message);
        return "test-meta-provider-id";
      },
    },
  });
  t.after(() => f.close());
  const o = await publish(f);
  const settings = await f.db.collection("settings").findOne({ _id: "main" });
  const configured = await put(f.admin, "admin/settings", {
    businessName: settings.businessName,
    businessId: "TEST-ID",
    businessAddress: "Test address",
    adminEmail: "admin@example.test",
    adminPhone: "+972543596761",
    whatsappConsent: true,
    privacyNotice: settings.privacyNotice,
    retentionPolicy: settings.retentionPolicy,
    productionApproved: true,
    signingMode: "production",
    whatsappEnabled: true,
    whatsappTemplateName: "lt_proposal",
    whatsappTemplateLanguage: "en_US",
  });
  assert.equal(configured.status, 200, JSON.stringify(configured.body));
  assert.equal(
    (await f.customer.get(`/api/offers/${o.token}`)).body.mode,
    "production",
  );
  const body = await signing(f.customer, o);
  assert.equal(
    (
      await post(f.customer, `offers/${o.token}/sign`, {
        ...body,
        mode: "test",
      })
    ).status,
    409,
  );
  assert.equal(await f.db.collection("contracts").countDocuments(), 0);
  assert.equal(
    (await post(f.customer, `offers/${o.token}/sign`, body)).status,
    403,
  );
  const approved = await post(
    f.admin,
    "admin/templates/ecommerce-PRO-v1/approve",
    {
      reviewer: "TEST BUSINESS OWNER",
      approvalKind: "owner",
      confirm: true,
    },
  );
  assert.equal(approved.status, 200);
  const signed = await post(f.customer, `offers/${o.token}/sign`, body);
  assert.equal(signed.status, 201, JSON.stringify(signed.body));
  await Promise.allSettled(f.deferred);
  const c = await f.db
    .collection("contracts")
    .findOne({ _id: signed.body.contractId });
  assert.equal(c.mode, "production");
  assert.equal(c.evidence.legalApproval.approvalKind, "owner");
  const payload = unseal(c.payload, f.config);
  assert.ok(!payload.html.includes("מסמך לבדיקה בלבד"));
  assert.equal(payload.snapshot.digest, o.snapshot.digest);
  assert.equal(payload.snapshot.tiers[0].legal.approved, false);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].settings.whatsappTemplateName, "lt_proposal");
  assert.equal(sent[0].settings.whatsappTemplateLanguage, "en_US");
  assert.equal(
    (
      await f.db
        .collection("jobs")
        .findOne({ contractId: c._id, channel: "whatsapp" })
    ).status,
    "accepted",
  );
  // A different body cannot borrow the approval of an earlier exact version.
  assert.equal(
    await exactLegalApproval(f.db, {
      ...o.snapshot.tiers[0].legal,
      body: "altered terms",
    }),
    null,
  );
});
