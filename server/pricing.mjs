export const defaults = [
  { months: 12, bps: 0 },
  { months: 24, bps: 1000 },
  { months: 36, bps: 1500 },
];
const integer = (n, max) => Number.isSafeInteger(n) && n >= 0 && n <= max;
export function rules(value) {
  if (!Array.isArray(value) || !value.length || value.length > 24)
    throw Error("Invalid durations");
  const seen = new Set();
  return value.map(({ months, bps }) => {
    if (
      !integer(months, 120) ||
      !months ||
      !integer(bps, 10000) ||
      seen.has(months)
    )
      throw Error("Invalid rule");
    seen.add(months);
    return { months, bps };
  });
}
const reduce = (amount, bps) =>
  Number((BigInt(amount) * BigInt(10000 - bps) + 5000n) / 10000n);
export function quote(s, tier, months) {
  const p = s.tiers.find((p) => p.name === tier),
    r = p?.rules.find((r) => r.months === months);
  if (!r) throw Error("Unauthorized selection");
  const monthly = reduce(p.monthly, r.bps),
    setup = s.discountSetup ? reduce(p.setup, r.bps) : p.setup;
  const subtotal = monthly * months + setup,
    tax =
      s.tax.mode === "exclusive"
        ? Number((BigInt(subtotal) * BigInt(s.tax.bps) + 5000n) / 10000n)
        : 0;
  return {
    tier,
    months,
    originalMonthly: p.monthly,
    discountBps: r.bps,
    monthly,
    originalSetup: p.setup,
    setup,
    subtotal,
    tax,
    total: subtotal + tax,
    savings: p.monthly * months + p.setup - subtotal,
  };
}
export function freezeOffer(input, globalRules) {
  if (
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.length > 200
  )
    throw Error("Title required");
  if (
    !["inclusive", "exclusive", "exempt"].includes(input.tax?.mode) ||
    !integer(input.tax.bps, 10000)
  )
    throw Error("Tax treatment required");
  if (
    typeof input.renewal !== "string" ||
    !input.renewal.trim() ||
    input.renewal.length > 2000
  )
    throw Error("Renewal required");
  if (
    !Array.isArray(input.tiers) ||
    !input.tiers.length ||
    input.tiers.length > 3
  )
    throw Error("Tiers required");
  const seen = new Set(),
    base = rules(input.rules ?? globalRules);
  const tiers = input.tiers.map((p) => {
    if (
      !["STARTER", "PRO", "CUSTOM"].includes(p.name) ||
      seen.has(p.name) ||
      !integer(p.monthly, 100000000) ||
      !p.monthly ||
      !integer(p.setup, 100000000) ||
      (p.name === "CUSTOM" && p.approved !== true)
    )
      throw Error("Invalid tier");
    seen.add(p.name);
    return {
      name: p.name,
      monthly: p.monthly,
      setup: p.setup,
      rules: rules(p.rules ?? base),
    };
  });
  const s = {
    version: 1,
    title: input.title.trim(),
    tiers,
    tax: {
      mode: input.tax.mode,
      bps: input.tax.mode === "exempt" ? 0 : input.tax.bps,
    },
    renewal: input.renewal.trim(),
    discountSetup: input.discountSetup === true,
    createdAt: new Date().toISOString(),
  };
  return {
    ...s,
    quotes: tiers.flatMap((p) =>
      p.rules.map((r) => quote(s, p.name, r.months)),
    ),
  };
}
