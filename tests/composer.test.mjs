import { test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { composeOffer } from "../server/lib/composer.mjs";
import { catalog, initialSettings } from "../server/lib/catalog.mjs";
import { setup, post, publish, verify, signing } from "./helpers/fixture.mjs";
import { renderAgreement } from "../server/lib/documents.mjs";
const brief = () => ({
  priceRounding: "exact",
  product: "ecommerce",
  clientLabel: "עסק בדיקה",
  recipientEmail: "client@example.test",
  description: "חנות למותג בגדים עם ניהול הזמנות",
  specialRequirements: "חיבור למלאי קיים לאחר קבלת גישת API",
  deliveryDays: 25,
  revisionRounds: 3,
  depositPercent: 55,
  expires: new Date(Date.now() + 86400000).toISOString(),
  tiers: [catalog[0].tiers.find((t) => t.name === "PRO")],
  tax: { mode: "inclusive", bps: 1800 },
});
test("brief generates complete clauses, exact requirements and configured prices without legal approval", () => {
  const b = brief(),
    result = composeOffer(b, initialSettings, catalog);
  assert.ok(result.scope.includes(b.specialRequirements));
  assert.ok(result.delivery.includes("25"));
  assert.ok(result.paymentTerms.includes("55%"));
  assert.ok(result.paymentTerms.includes("45%"));
  assert.equal(result.tiers[0].monthly, 34900);
  assert.equal(result.tiers[0].setup, 249000);
  assert.deepEqual(result.rules, initialSettings.rules);
  assert.equal(result.composition.specialRequirements, b.specialRequirements);
  assert.ok(result.renewal.includes("אין חידוש אוטומטי"));
  const changed = structuredClone(catalog);
  changed[0].tiers[1].monthly = 12345;
  const other = composeOffer(
    { ...b, tiers: [{ ...b.tiers[0], monthly: 45678 }] },
    initialSettings,
    changed,
  );
  assert.equal(other.tiers[0].monthly, 45678);
});
test("composer rejects unapproved CUSTOM, invalid money, missing tax and duplicate durations", () => {
  const b = brief();
  for (const invalid of [
    { ...b, tiers: [{ ...b.tiers[0], name: "CUSTOM", approved: false }] },
    { ...b, tiers: [{ ...b.tiers[0], monthly: 1.5 }] },
    { ...b, tax: { mode: "", bps: 0 } },
    {
      ...b,
      rules: [
        { months: 12, bps: 0 },
        { months: 12, bps: 100 },
      ],
    },
  ])
    assert.throws(() => composeOffer(invalid, initialSettings, catalog));
});
test("generated offer can publish, show designed preview and sign with frozen authorized prices", async (t) => {
  const f = await setup();
  t.after(() => f.close());
  assert.equal(
    (await post(supertest(f.app), "admin/offers/compose", brief())).status,
    401,
  );
  const composed = await post(f.admin, "admin/offers/compose", brief());
  assert.equal(composed.status, 200, JSON.stringify(composed.body));
  const offer = await publish(f, composed.body);
  const html = await f.admin.get(
    `/api/admin/offers/${offer.id}/preview?format=agreement&tier=PRO&months=24`,
  );
  assert.equal(html.status, 200);
  const interactive = await f.admin.get(
    `/api/admin/offers/${offer.id}/preview?tier=PRO&months=24`,
  );
  assert.equal(interactive.status, 302);
  assert.equal(
    interactive.headers.location,
    `/admin/offers/${offer.id}/preview?tier=PRO&months=24`,
  );
  assert.ok(html.text.includes("10,028.40"));
  assert.ok(html.text.includes("ההשקעה בפרויקט"));
  assert.ok(html.text.includes(brief().specialRequirements));
  assert.ok(!html.text.includes("אינו הסכם מחייב"));
  const malicious = structuredClone(offer.snapshot);
  malicious.title = '<script>alert("x")</script>';
  const escaped = await renderAgreement(malicious, malicious.quotes[0]);
  assert.ok(!escaped.includes("<script>"));
  await verify(f, offer);
  const signed = await post(
    f.customer,
    `offers/${offer.token}/sign`,
    await signing(f.customer, offer),
  );
  assert.equal(signed.status, 201, JSON.stringify(signed.body));
  const pdf = await f.customer.get(
    `/api/customer/contracts/${signed.body.contractId}/pdf`,
  );
  assert.equal(pdf.status, 200);
});
test("publishing with missing encryption configuration returns actionable error and leaves draft intact", async (t) => {
  const f = await setup({ config: { DATA_ENCRYPTION_KEY: "" } });
  t.after(() => f.close());
  const composed = await post(f.admin, "admin/offers/compose", brief());
  const draft = await post(f.admin, "admin/offers", composed.body);
  const id = draft.body._id;
  const preview = await f.admin.get(`/api/admin/offers/${id}/preview`);
  const failed = await post(f.admin, `admin/offers/${id}/publish`, {
    previewDigest: preview.body.digest,
  });
  assert.equal(failed.status, 503);
  assert.ok(failed.body.error.includes("DATA_ENCRYPTION_KEY"));
  assert.ok(failed.body.requestId);
  assert.equal(
    (await f.db.collection("offers").findOne({ _id: id })).status,
    "draft",
  );
});
