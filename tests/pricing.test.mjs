import { test } from "node:test";
import assert from "node:assert/strict";
import { defaults, freezeOffer, quote, rules } from "../server/pricing.mjs";
const input = () => ({
  title: "לקוח",
  renewal: "מחיר חדש דורש הסכמה חדשה",
  tax: { mode: "inclusive", bps: 1800 },
  tiers: [{ name: "PRO", monthly: 34900, setup: 249000 }],
});
test("required PRO example", () => {
  const s = freezeOffer(input(), defaults),
    q = quote(s, "PRO", 24);
  assert.equal(q.monthly, 31410);
  assert.equal(q.total, 1002840);
  assert.equal(q.savings, 83760);
  assert.equal(q.setup, 249000);
});
test("all durations, zero discount and setup opt-in", () => {
  const s = freezeOffer(input(), defaults);
  assert.equal(quote(s, "PRO", 12).savings, 0);
  assert.equal(quote(s, "PRO", 36).monthly, 29665);
  assert.equal(
    quote(freezeOffer({ ...input(), discountSetup: true }, defaults), "PRO", 24)
      .setup,
    224100,
  );
});
test("offer and tier overrides, disabled duration", () => {
  const i = input();
  i.rules = [{ months: 12, bps: 0 }];
  i.tiers[0].rules = [{ months: 24, bps: 2500 }];
  const s = freezeOffer(i, defaults);
  assert.equal(quote(s, "PRO", 24).monthly, 26175);
  assert.throws(() => quote(s, "PRO", 12));
  assert.throws(() => quote(s, "CUSTOM", 24));
});
test("snapshot independent of later mutations", () => {
  const i = input(),
    r = structuredClone(defaults),
    s = freezeOffer(i, r);
  i.tiers[0].monthly = 1;
  r[1].bps = 9000;
  assert.equal(s.quotes[1].monthly, 31410);
  assert.equal(s.tiers[0].monthly, 34900);
});
test("tax and rounding", () => {
  const i = input();
  i.tax.mode = "exclusive";
  const q = quote(freezeOffer(i, defaults), "PRO", 24);
  assert.equal(q.tax, 180511);
  assert.equal(q.total, 1183351);
  i.tiers[0].monthly = 1;
  assert.equal(quote(freezeOffer(i, defaults), "PRO", 24).monthly, 1);
});
test("reject invalid rules, amounts and unapproved custom", () => {
  for (const bad of [
    [{ months: 0, bps: 0 }],
    [{ months: 12, bps: -1 }],
    [{ months: 12, bps: 1.1 }],
    [],
    [
      { months: 12, bps: 0 },
      { months: 12, bps: 10 },
    ],
  ])
    assert.throws(() => rules(bad));
  const i = input();
  i.tiers[0].monthly = 1.2;
  assert.throws(() => freezeOffer(i, defaults));
  i.tiers[0] = { name: "CUSTOM", monthly: 100, setup: 100 };
  assert.throws(() => freezeOffer(i, defaults));
  i.tiers[0].approved = true;
  assert.equal(freezeOffer(i, defaults).tiers[0].name, "CUSTOM");
});
