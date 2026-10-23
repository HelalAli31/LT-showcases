import { z } from "zod";
import { freezeOffer } from "../pricing.mjs";
import { digest, requireValue } from "./security.mjs";
const paragraph = z.string().trim().max(16000);
const amount = z.number().int().min(0).max(100000000);
const rule = z.object({
  months: z.number().int().min(1).max(120),
  bps: z.number().int().min(0).max(10000),
});
const tier = z.object({
  name: z.enum(["STARTER", "PRO", "CUSTOM"]),
  setup: amount.min(1),
  monthly: amount.min(1),
  approved: z.boolean().optional(),
  rules: z.array(rule).min(1).max(24).optional(),
  features: z.array(z.string().max(1000)).max(100).default([]),
  exclusions: paragraph.default(""),
  support: paragraph.default(""),
  limits: paragraph.default(""),
});
export const offerSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    product: z.enum(["ecommerce", "management"]),
    recipientEmail: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    clientLabel: z.string().max(200).default(""),
    description: paragraph,
    scope: paragraph.min(1),
    milestones: paragraph,
    delivery: paragraph.min(1),
    paymentTerms: paragraph.min(1),
    cancellation: paragraph.min(1),
    thirdPartyCosts: paragraph,
    ipTerms: paragraph.min(1),
    dataExit: paragraph.min(1),
    liability: paragraph.min(1),
    jurisdiction: paragraph.min(1),
    renewal: paragraph.min(1),
    expires: z.string().datetime(),
    tiers: z.array(tier).min(1).max(3),
    rules: z.array(rule).min(1).max(24).optional(),
    tax: z.object({
      mode: z.enum(["inclusive", "exclusive", "exempt"]),
      bps: z.number().int().min(0).max(10000),
    }),
    discountSetup: z.boolean().default(false),
    internalNotes: paragraph.default(""),
    attachments: z
      .array(z.string().regex(/^[a-f0-9]{36}$/))
      .max(10)
      .default([]),
    addons: z
      .array(z.object({ label: z.string().min(1).max(200), amount }))
      .max(20)
      .default([]),
  })
  .strict();
export const signerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(200),
    businessName: z.string().trim().max(200),
    phone: z.string().trim().min(7).max(30),
    registrationId: z.string().trim().max(40).optional().default(""),
    company: z.boolean(),
    role: z.string().trim().max(100),
    authority: z.boolean(),
    acceptAgreement: z.literal(true),
    acceptPrivacy: z.literal(true),
    confirmSignature: z.literal(true),
    signature: z.string().max(250000),
    tier: z.enum(["STARTER", "PRO", "CUSTOM"]),
    months: z.number().int(),
    agreementDigest: z.string().regex(/^[a-f0-9]{64}$/),
    idempotencyKey: z.string().regex(/^[a-zA-Z0-9-]{16,100}$/),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.company && (!v.authority || !v.role || !v.businessName))
      ctx.addIssue({ code: "custom", message: "Company authority required" });
    if (!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(v.signature))
      ctx.addIssue({ code: "custom", message: "PNG signature required" });
  });
export function snapshotFrom(input, settings, legal) {
  const data = offerSchema.parse(input);
  requireValue(
    new Date(data.expires) > new Date(),
    "תוקף ההצעה חייב להיות בעתיד",
  );
  const base = freezeOffer(data, settings.rules),
    extra = data.addons.reduce((a, b) => a + b.amount, 0);
  const snapshot = {
    ...base,
    product: data.product,
    expires: data.expires,
    description: data.description,
    scope: data.scope,
    milestones: data.milestones,
    delivery: data.delivery,
    paymentTerms: data.paymentTerms,
    cancellation: data.cancellation,
    thirdPartyCosts: data.thirdPartyCosts,
    ipTerms: data.ipTerms,
    dataExit: data.dataExit,
    liability: data.liability,
    jurisdiction: data.jurisdiction,
    addons: data.addons,
    privacyNotice: settings.privacyNotice,
    supplier: {
      name: settings.businessName,
      id: settings.businessId,
      address: settings.businessAddress,
      email: settings.adminEmail,
    },
    tiers: base.tiers.map((p) => ({
      ...p,
      ...Object.fromEntries(
        ["features", "exclusions", "support", "limits"].map((k) => [
          k,
          data.tiers.find((t) => t.name === p.name)[k],
        ]),
      ),
      legal: legal[p.name],
    })),
  };
  snapshot.quotes = base.quotes.map((q) => {
    requireValue(
      q.monthly > 0,
      "כל מסלול חייב לכלול חיוב שירות חודשי חיובי לאחר הנחה",
    );
    const subtotal = q.subtotal + extra,
      tax =
        snapshot.tax.mode === "exclusive"
          ? Number(
              (BigInt(subtotal) * BigInt(snapshot.tax.bps) + 5000n) / 10000n,
            )
          : 0;
    return { ...q, addons: extra, subtotal, tax, total: subtotal + tax };
  });
  return { ...snapshot, digest: digest(snapshot) };
}
export const selected = (s, tier, months) => {
  const q = s.quotes.find(
    (q) => q.tier === tier && q.months === Number(months),
  );
  requireValue(q, "בחירה אינה מאושרת");
  return q;
};
export function agreementData(s, q) {
  const tier = s.tiers.find((p) => p.name === q.tier);
  return {
    snapshotDigest: s.digest,
    quote: q,
    legal: tier.legal,
    scope: s.scope,
    privacyNotice: s.privacyNotice,
  };
}
export const agreementDigest = (s, q) => digest(agreementData(s, q));
export function state(offer) {
  return offer.contractId
    ? "signed"
    : offer.revokedAt
      ? "revoked"
      : offer.status === "draft"
        ? "draft"
        : new Date(offer.expires) <= new Date()
          ? "expired"
          : offer.viewedAt
            ? "viewed"
            : "sent";
}
export const assertOpen = (o) =>
  requireValue(
    o &&
      !o.revokedAt &&
      !o.contractId &&
      o.status === "published" &&
      new Date(o.expires) > new Date(),
    "ההצעה אינה זמינה לחתימה",
    410,
  );
