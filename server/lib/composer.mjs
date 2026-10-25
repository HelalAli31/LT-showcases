import { z } from "zod";
import { offerSchema } from "./domain.mjs";
import { rules } from "../pricing.mjs";
import { requireValue } from "./security.mjs";

const briefSchema = z
  .object({
    product: z.enum(["ecommerce", "management"]),
    clientLabel: z.string().trim().min(1).max(200),
    recipientEmail: offerSchema.shape.recipientEmail,
    title: z.string().trim().max(200).default(""),
    description: z.string().trim().min(3).max(8000),
    specialRequirements: z.string().trim().max(8000).default(""),
    pages: offerSchema.shape.pages,
    projectDetails: offerSchema.shape.projectDetails,
    deliveryDays: z.number().int().min(1).max(365),
    revisionRounds: z.number().int().min(0).max(20),
    depositPercent: z.number().int().min(0).max(100),
    expires: z.string().datetime(),
    tiers: offerSchema.shape.tiers,
    rules: offerSchema.shape.rules,
    tax: offerSchema.shape.tax,
    discountSetup: z.boolean().default(false),
    priceRounding: z.enum(["exact", "ending9"]).default("ending9"),
    addons: offerSchema.shape.addons,
    attachments: offerSchema.shape.attachments,
    internalNotes: z.string().max(16000).default(""),
  })
  .strict();

// Generate deterministic, reviewable wording. No invented features or approvals.
export function composeOffer(value, settings, catalog) {
  const b = briefSchema.parse(value);
  const product = catalog.find((p) => p._id === b.product);
  requireValue(product, "השירות אינו זמין במחירון", 400);
  const durations = rules(b.rules ?? settings.rules);
  const tiers = b.tiers.map((tier) => {
    const source = product.tiers.find((t) => t.name === tier.name);
    requireValue(source, "המסלול אינו זמין במחירון", 400);
    requireValue(
      tier.name !== "CUSTOM" || tier.approved === true,
      "יש לאשר במפורש את המחיר וההיקף של מסלול CUSTOM",
      400,
    );
    return {
      ...tier,
      features: tier.features.length ? tier.features : source.features,
      rules: rules(tier.rules ?? durations),
      limits:
        tier.limits ||
        `הכמויות והתכולות מוגבלות לרכיבים המפורטים במסלול זה. כלולות ${b.revisionRounds} הגשות מרוכזות של תיקונים במסגרת האפיון.`,
      exclusions:
        tier.exclusions ||
        "פיתוח חדש, שינוי מבני או עיצובי מהותי ורכיב שלא צוין במפורש אינם כלולים. תוספת תבוצע לאחר אישור כתוב למחיר ולמועד.",
      support:
        tier.support ||
        "טיפול בתקלות הנובעות מהקוד שסופק, בימי עסקים. מענה ראשוני עד 3 ימי עסקים מקבלת פנייה בכתב; זמן המענה אינו התחייבות לזמן פתרון. אין תמיכה 24/7 או התחייבות לזמינות רציפה.",
    };
  });
  return offerSchema.parse({
    title: b.title || `${product.label} עבור ${b.clientLabel}`,
    product: b.product,
    clientLabel: b.clientLabel,
    recipientEmail: b.recipientEmail,
    description: b.description,
    pages: b.pages,
    projectDetails: b.projectDetails,
    scope: `${b.description}\n\nהעבודה כוללת אפיון, התאמת עיצוב, פיתוח, בדיקות והתאמה למחשב ולמובייל, בהתאם לרכיבי המסלול שייבחר.\n${b.specialRequirements ? "דרישות מיוחדות הכלולות בהצעה:\n" + b.specialRequirements : "לא הוגדרו דרישות מיוחדות מעבר לתכולת המסלול."}\nכל שינוי בהיקף טעון אישור כתוב ונפרד.`,
    milestones:
      "1. אישור האפיון, מסירת חומרים ותשלום ראשון.\n2. הקמה ופיתוח לפי התכולה המאושרת.\n3. הצגה ללקוח וריכוז תיקונים.\n4. בדיקות, אישור מסירה והשלמת התשלום לפני העלייה לאוויר.",
    delivery: `יעד מסירה: ${b.deliveryDays} ימי עבודה לאחר חתימה, קבלת התשלום הראשון וקבלת מלוא התכנים והגישות. עיכוב בחומרים או באישורים ושינוי בהיקף מחייבים עדכון לוח הזמנים בכתב. כלולים ${b.revisionRounds} סבבי תיקונים מרוכזים במסגרת האפיון.`,
    paymentTerms: `${b.depositPercent}% מדמי ההקמה עם אישור ההצעה, ו-${100 - b.depositPercent}% בסיום הפיתוח ולפני עלייה לאוויר. השירות החודשי ותקופת ההתחייבות מתחילים עם מסירת המערכת והפעלת השירות. החיוב החודשי בתחילת כל חודש שירות. החתימה אינה גביית תשלום; התשלום מתואם בנפרד.`,
    cancellation:
      "בקשת ביטול או סיום תימסר בכתב לדוא״ל הספק. השלכות הסיום, תשלום עבור עבודה שבוצעה ויתרת ההתחייבות ייקבעו לפי ההסכם המאושר ובכפוף לזכויות ביטול ולהוראות דין מחייבות. אין חידוש לתקופת התחייבות נוספת ללא הסכמה חדשה בכתב.",
    thirdPartyCosts:
      "דומיין, סליקה, שירותי דוא״ל, הודעות, רישיונות ושירותי צד שלישי אינם כלולים, אלא אם צוינו במפורש בתכולה או בתוספות. הפעלת חיבור תלויה בהרשאות ובזמינות הספק החיצוני. אירוח יינתן רק אם נכלל במפורש במסלול.",
    ipTerms:
      "זכויות הלקוח בתכנים שמסר נשארות שלו. רכיבי תוכנה, תשתיות וכלים קיימים של הספק נשארים בבעלותו; ללקוח ניתן רישיון שימוש במערכת לצורך פעילותו במסגרת השירות ששולם. העברת קוד מקור או זכויות בתוכנה מחייבת הסכמה נפרדת בכתב.",
    dataExit:
      "המידע העסקי של הלקוח נשאר בבעלותו. בסיום השירות ניתן לבקש יצוא של נתוני הלקוח בפורמט זמין ומקובל, בתוך 30 ימים מהבקשה. העברת קוד, רישיונות או תשתיות אינה חלק מיצוא הנתונים. שמירה ומחיקה כפופות להודעת הפרטיות ולהוראות הדין.",
    liability:
      "כל צד אחראי לפעולותיו ולמידע שמסר. הספק יטפל בתקלות שבאחריותו בהתאם לתמיכה שנקבעה. אין הבטחה להכנסה, להיקף מכירות או לתוצאה עסקית. אין באמור לגרוע מאחריות או מסעד שלא ניתן להתנות עליהם לפי דין. תנאי האחריות המלאים בתבנית ההסכם המאושרת.",
    jurisdiction:
      "הדין הישראלי יחול. הצדדים ינסו לפתור מחלוקת בפנייה בכתב ובתום לב; סמכות השיפוט כפופה להוראות דין מחייבות ולתבנית ההסכם המאושרת.",
    renewal:
      "המחיר החודשי לאחר ההנחה קבוע לכל תקופת ההתחייבות שנבחרה. בסיום התקופה אין חידוש אוטומטי של התחייבות או של ההנחה. המשך השירות, מחירו ותקופתו טעונים הצעה חדשה והסכמה בכתב לפני תום התקופה; ללא הסכמה כזו יתואם סיום השירות ויצוא הנתונים.",
    expires: b.expires,
    tiers,
    rules: durations,
    tax: b.tax,
    discountSetup: b.discountSetup,
    priceRounding: b.priceRounding,
    internalNotes: b.internalNotes,
    addons: b.addons,
    attachments: b.attachments,
    composition: {
      specialRequirements: b.specialRequirements,
      deliveryDays: b.deliveryDays,
      revisionRounds: b.revisionRounds,
      depositPercent: b.depositPercent,
    },
  });
}
