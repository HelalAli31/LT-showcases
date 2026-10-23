// Generate a clearly marked sample for visual QA; never connect to live services.
import { mkdir, writeFile } from "node:fs/promises";
import { composeOffer } from "../server/lib/composer.mjs";
import { catalog, initialSettings, templates } from "../server/lib/catalog.mjs";
import { snapshotFrom } from "../server/lib/domain.mjs";
import { renderAgreement, pdfFromHtml } from "../server/lib/documents.mjs";
const offer = composeOffer(
  {
    product: "ecommerce",
    clientLabel: "לקוח לדוגמה",
    recipientEmail: "client@example.test",
    description: "חנות למותג בגדים עם קטגוריות, סל קניות וניהול הזמנות",
    specialRequirements: "חיבור למלאי קיים לאחר קבלת גישת API מהלקוח.",
    deliveryDays: 30,
    revisionRounds: 3,
    depositPercent: 55,
    expires: new Date(Date.now() + 14 * 86400000).toISOString(),
    tiers: [catalog[0].tiers.find((t) => t.name === "PRO")],
    tax: { mode: "inclusive", bps: 1800 },
  },
  initialSettings,
  catalog,
);
const s = snapshotFrom(
  offer,
  {
    ...initialSettings,
    businessId: "דוגמה בלבד",
    businessAddress: "כתובת לדוגמה",
    adminEmail: "admin@example.test",
  },
  { PRO: templates.find((t) => t.product === "ecommerce" && t.tier === "PRO") },
);
const html = await renderAgreement(
  s,
  s.quotes.find((q) => q.months === 24),
  {
    mode: "test",
    signer: {
      fullName: "לקוח לדוגמה",
      businessName: "עסק לדוגמה",
      phone: "050-0000000",
      registrationId: "דוגמה בלבד",
      company: false,
      signature:
        "data:image/svg+xml;base64," +
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="85"><path d="M20 60 Q60 5 90 55 T200 25" stroke="#283c52" stroke-width="2" fill="none"/></svg>',
        ).toString("base64"),
    },
    email: "client@example.test",
    verifiedAt: "DEMO",
    at: "DEMO",
    id: "DEMO-NOT-A-SIGNED-AGREEMENT",
    evidenceDigest: "DEMO",
  },
);
await mkdir("private-data/qa", { recursive: true });
await mkdir("output/pdf", { recursive: true });
await writeFile("private-data/qa/agreement-preview.html", html);
const pdf = await pdfFromHtml(html, {});
await writeFile("output/pdf/luxury-tech-agreement-preview.pdf", pdf);
await writeFile("private-data/qa/signed-test.pdf", pdf);
console.log("Generated designed agreement sample (test document only).");
