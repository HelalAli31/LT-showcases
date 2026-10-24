import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog, templates, initialSettings } from "../server/lib/catalog.mjs";
import { composeOffer } from "../server/lib/composer.mjs";
import { offerSchema, snapshotFrom, selected } from "../server/lib/domain.mjs";
import { renderAgreement } from "../server/lib/documents.mjs";
import {
  setup,
  input,
  publish,
  signing,
  post,
  put,
} from "./helpers/fixture.mjs";
import { unseal } from "../server/lib/security.mjs";
const pages = () => [
  {
    name: "עמוד בית",
    path: "/",
    description: "אזור פתיחה, קטגוריות ומוצרים נבחרים",
    tiers: [],
  },
  {
    name: "דוחות ייחודיים PRO",
    path: "/reports",
    description: "דוחות מכירה לפי טווח תאריכים",
    tiers: ["PRO"],
  },
];
const details = {
  design: "מיתוג וצבעי העסק",
  content: "הלקוח מספק תמונות ותוכן",
  integrations: "חיבור למלאי שאושר",
  acceptance: "בדיקות הזמנה ומסירה",
};
test("page scope survives generation and renders only the selected tier's deliverables", async () => {
  const b = input();
  const composed = composeOffer(
    {
      product: b.product,
      clientLabel: b.clientLabel,
      recipientEmail: b.recipientEmail,
      description: b.description,
      expires: b.expires,
      deliveryDays: 30,
      revisionRounds: 3,
      depositPercent: 55,
      tiers: [...b.tiers, catalog[0].tiers[0]],
      tax: b.tax,
      pages: pages(),
      projectDetails: details,
    },
    initialSettings,
    catalog,
  );
  assert.deepEqual(composed.pages, pages());
  const legal = Object.fromEntries(
    templates.filter((t) => t.product === "ecommerce").map((t) => [t.tier, t]),
  );
  const s = snapshotFrom(composed, initialSettings, legal);
  composed.pages[0].description = "changed later";
  assert.notEqual(s.pages[0].description, "changed later");
  assert.equal(selected(s, "PRO", 24).total, 1002840);
  const pro = await renderAgreement(s, selected(s, "PRO", 24));
  const starter = await renderAgreement(s, selected(s, "STARTER", 24));
  assert.ok(pro.includes("דוחות ייחודיים PRO"));
  assert.ok(!starter.includes("דוחות ייחודיים PRO"));
  assert.ok(starter.includes("עמוד בית"));
  assert.ok(pro.includes(details.acceptance));
  assert.throws(() =>
    offerSchema.parse({
      ...input(),
      pages: [{ ...pages()[0], path: "//other.example" }],
    }),
  );
  assert.throws(() =>
    offerSchema.parse({ ...input(), pages: [{ ...pages()[0], name: "" }] }),
  );
});
test("published and signed contracts freeze exact page descriptions and project details", async (t) => {
  const f = await setup();
  t.after(() => f.close());
  const i = { ...input(), pages: pages(), projectDetails: details };
  const offer = await publish(f, i);
  const saved = await f.admin.get(`/api/admin/offers/${offer.id}`);
  assert.deepEqual(saved.body.input.pages, pages());
  assert.equal(
    (await put(f.admin, `admin/offers/${offer.id}`, { ...i, pages: [] }))
      .status,
    409,
  );
  const signed = await post(
    f.customer,
    `offers/${offer.token}/sign`,
    await signing(f.customer, offer),
  );
  assert.equal(signed.status, 201, JSON.stringify(signed.body));
  const c = await f.db
    .collection("contracts")
    .findOne({ _id: signed.body.contractId });
  const payload = unseal(c.payload, f.config);
  assert.deepEqual(payload.snapshot.pages, pages());
  assert.deepEqual(payload.snapshot.projectDetails, details);
  assert.ok(payload.html.includes("דוחות ייחודיים PRO"));
});
