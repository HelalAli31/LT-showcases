import { test } from "node:test";
import assert from "node:assert/strict";
import { ending9, freezeOffer, defaults } from "../server/pricing.mjs";
import { input } from "./helpers/fixture.mjs";
import { discountPercent } from "../shared/price-display.mjs";

test("ending-9 prices use integer arithmetic and always round upward", () => {
  for (const [before, after] of [
    [0, 0],
    [1, 900],
    [14900, 14900],
    [14901, 15900],
    [15600, 15900],
    [31410, 31900],
    [35910, 36900],
  ])
    assert.equal(ending9(before), after);
  for (let n = 1; n < 100000; n += 37) {
    const result = ending9(n);
    assert.ok(result >= n);
    assert.equal(result % 1000, 900);
  }
});
test("rounded offers charge the shown price and disclose actual savings without changing legacy arithmetic", () => {
  const exact = freezeOffer(input(), defaults);
  const old = exact.quotes.find((q) => q.months === 24);
  assert.equal(old.monthly, 31410);
  assert.equal(old.total, 1002840);
  const rounded = freezeOffer(
    { ...input(), priceRounding: "ending9" },
    defaults,
  );
  const q = rounded.quotes.find((q) => q.months === 24);
  assert.equal(q.monthly, 31900);
  assert.equal(q.setup, 249900);
  assert.equal(q.total, 1015500);
  assert.equal(q.savings, 72000);
  assert.equal(q.authorizedDiscountBps, 1000);
  assert.equal(q.discountBps, 860);
  assert.equal(q.roundingAdjustment, 490);
  assert.equal(discountPercent(q), "כ־8.6%");
  assert.equal(rounded.quotes[0].discountBps, 0);
  assert.equal(old.monthly, 31410);
  for (const quote of rounded.quotes) {
    assert.equal(quote.monthly % 1000, 900);
    assert.ok(quote.monthly >= quote.discountedMonthly);
    assert.ok(quote.monthly <= quote.originalMonthly);
    assert.equal(
      quote.savings,
      quote.originalMonthly * quote.months +
        quote.originalSetup -
        quote.subtotal,
    );
  }
});
