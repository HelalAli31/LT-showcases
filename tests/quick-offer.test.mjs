import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, post, publish, signing } from "./helpers/fixture.mjs";

test("quick offer uses configured catalog, no invented email, all approved choices and frozen publication", async () => {
  const f = await setup();
  try {
    const initial = await f.admin.get("/api/admin/offers/quick-defaults");
    assert.equal(initial.body.tax, null);
    await publish(f);
    const defaults = await f.admin.get("/api/admin/offers/quick-defaults");
    assert.deepEqual(defaults.body.tax, { mode: "inclusive", bps: 1800 });
    await f.db
      .collection("catalog")
      .updateOne({ _id: "ecommerce" }, { $set: { "tiers.0.monthly": 15900 } });
    const quick = await post(f.admin, "admin/offers/quick", {
      clientLabel: "Quick client",
      tax: defaults.body.tax,
    });
    assert.equal(quick.status, 201, JSON.stringify(quick.body));
    const doc = await f.db
      .collection("offers")
      .findOne({ _id: quick.body._id });
    assert.equal(doc.input.recipientEmail, "");
    assert.deepEqual(
      doc.input.tiers.map((t) => t.name),
      ["STARTER", "PRO"],
    );
    assert.equal(doc.input.tiers[0].monthly, 15900);
    assert.ok(doc.input.pages.some((p) => p.path === "/admin/orders"));
    assert.deepEqual(
      doc.input.pages.find((p) => p.path === "/admin/coupons").tiers,
      ["PRO", "CUSTOM"],
    );
    const published = await post(f.admin, `admin/offers/${doc._id}/publish`, {
      previewDigest: quick.body.previewDigest,
    });
    assert.equal(published.status, 200, JSON.stringify(published.body));
    const token = published.body.url.split("/").pop();
    const opened = await f.customer.get(`/api/offers/${token}`);
    assert.equal(opened.status, 200);
    assert.equal(opened.body.snapshot.clientName, "Quick client");
    assert.equal(
      await f.db.collection("clients").countDocuments({ email: "" }),
      0,
    );
    const agreement = await f.customer.get(
      `/api/offers/${token}/agreement?tier=PRO&months=24`,
    );
    assert.equal(agreement.status, 200, JSON.stringify(agreement.body));
    const signed = await post(
      f.customer,
      `offers/${token}/sign`,
      await signing(f.customer, { token }),
    );
    assert.equal(signed.status, 201, JSON.stringify(signed.body));
    assert.equal(
      await f.db.collection("contracts").countDocuments({ offerId: doc._id }),
      1,
    );
    const customerJob = await f.db
      .collection("jobs")
      .findOne({ contractId: signed.body.contractId, kind: "customer" });
    if (customerJob) assert.equal(customerJob.status, "not_configured");
    const tamper = await post(f.admin, "admin/offers/quick", {
      clientLabel: "No override",
      tax: defaults.body.tax,
      tiers: [],
    });
    assert.equal(tamper.status, 400);
  } finally {
    await f.close();
  }
});
