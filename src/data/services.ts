import { Users, RefreshCw, ShoppingBag, LayoutTemplate, LucideIcon } from "lucide-react";

export type ServiceSlug =
  | "crm"
  | "system-modernization"
  | "digital-stores"
  | "landing-pages";

export interface Service {
  slug: ServiceSlug;
  icon: LucideIcon;
  title: { he: string; en: string };
  tagline: { he: string; en: string };
  description: { he: string; en: string };
  features: { he: string; en: string }[];
}

export const services: Service[] = [
  {
    slug: "crm",
    icon: Users,
    title: { he: "מערכות CRM וניהול עסק", en: "CRM & Business Management Systems" },
    tagline: {
      he: "כל הלקוחות, כל התפעול, במקום אחד",
      en: "Every customer, every operation, in one place",
    },
    description: {
      he: "אנחנו בונים מערכות CRM וניהול עסק מותאמות אישית שמרכזות את כל המידע על הלקוחות, הלידים, העסקאות, המלאי והכספים שלכם — במקום גיליונות אקסל מפוזרים ותוכנות גנריות שלא מתאימות לאופן שבו העסק שלכם עובד באמת. המערכת גדלה איתכם, ומתממשקת לכלים שאתם כבר משתמשים בהם.",
      en: "We build custom CRM and business management systems that centralize every customer, lead, deal, inventory item, and financial record — replacing scattered spreadsheets and generic software that doesn't match how your business actually works. The system grows with you and integrates with the tools you already use.",
    },
    features: [
      { he: "ניהול לידים ומעקב מכירות", en: "Lead management & sales pipeline tracking" },
      { he: "היסטוריית לקוח מלאה במקום אחד", en: "Full customer history in one place" },
      { he: "ניהול מלאי, הזמנות וכוח אדם", en: "Inventory, order, and staff management" },
      { he: "דוחות כספיים ולוחות מחוונים בזמן אמת", en: "Financial reports and real-time dashboards" },
      { he: "אוטומציות לתזכורות ומשימות", en: "Automations for reminders and tasks" },
      { he: "הרשאות משתמשים לפי תפקיד או מחלקה", en: "Role- and department-based permissions" },
      { he: "אינטגרציה עם וואטסאפ, מייל ומערכות חיצוניות", en: "Integration with WhatsApp, email, and external systems" },
      { he: "התאמה מלאה לתהליכי העבודה הקיימים שלכם", en: "Fully tailored to your existing workflows" },
    ],
  },
  {
    slug: "system-modernization",
    icon: RefreshCw,
    title: { he: "חידוש מערכות", en: "System Modernization" },
    tagline: {
      he: "מערכת ישנה שעובדת, אבל מעכבת אתכם? נשדרג אותה",
      en: "An old system that works, but holds you back? We'll modernize it",
    },
    description: {
      he: "מערכות ישנות מטים לאט לאט על העסק — ממשק מיושן, קוד שקשה לתחזק, אבטחה חלשה וחוסר יכולת להתממשק לכלים חדשים. אנחנו לוקחים מערכות קיימות ומשדרגים אותן בהדרגה או במלואן: ממשק מודרני, ביצועים מהירים יותר, ואבטחה עדכנית — בלי לעצור את העסק תוך כדי.",
      en: "Legacy systems quietly weigh a business down — dated interfaces, code that's hard to maintain, weak security, and no way to connect to modern tools. We take existing systems and modernize them gradually or fully: modern UI, faster performance, and up-to-date security — without stopping the business along the way.",
    },
    features: [
      { he: "שדרוג ממשק משתמש למראה מודרני", en: "UI upgrade to a modern look and feel" },
      { he: "מיגרציה בטוחה של נתונים היסטוריים", en: "Safe migration of historical data" },
      { he: "שיפור ביצועים ומהירות טעינה", en: "Performance and load-time improvements" },
      { he: "סגירת פרצות אבטחה וניקוי קוד ישן", en: "Closing security gaps and cleaning up legacy code" },
      { he: "חיבור למערכות וכלים חדשים (API)", en: "Connecting to new systems and tools via API" },
      { he: "מעבר הדרגתי שלא פוגע בפעילות השוטפת", en: "A gradual rollout that doesn't disrupt daily operations" },
    ],
  },
  {
    slug: "digital-stores",
    icon: ShoppingBag,
    title: { he: "חנויות דיגיטליות", en: "Digital Stores" },
    tagline: {
      he: "חנויות אונליין שממירות גולשים ללקוחות",
      en: "Online stores that convert visitors into customers",
    },
    description: {
      he: "אנחנו בונים חנויות אונליין מהירות, מאובטחות ומעוצבות ברמה פרימיום — עם קופה חלקה, ניהול מלאי חכם וחוויית קנייה שמותאמת למובייל בראש ובראשונה. מהקטלוג ועד הסליקה, כל פרט נבנה כדי להגדיל המרות ולבנות אמון.",
      en: "We build online stores that are fast, secure, and designed at a premium level — with a smooth checkout, smart inventory management, and a mobile-first shopping experience. From catalog to payment, every detail is built to increase conversions and build trust.",
    },
    features: [
      { he: "עיצוב פרימיום מותאם למותג שלכם", en: "Premium design tailored to your brand" },
      { he: "סליקה מאובטחת ומגוון אמצעי תשלום", en: "Secure payments with multiple payment methods" },
      { he: "ניהול מלאי, מבצעים וקופונים", en: "Inventory, promotions, and coupon management" },
      { he: "אופטימיזציה למובייל ולמהירות טעינה", en: "Mobile optimization and fast load times" },
      { he: "קידום אורגני (SEO) מובנה", en: "Built-in SEO foundations" },
      { he: "חיבור למערכות משלוחים וניהול לקוחות", en: "Integration with shipping and customer-management tools" },
    ],
  },
  {
    slug: "landing-pages",
    icon: LayoutTemplate,
    title: { he: "דפי נחיתה ואתרי תדמית", en: "Landing Pages & Corporate Sites" },
    tagline: {
      he: "הרושם הראשון שהופך מבקרים ללקוחות",
      en: "The first impression that turns visitors into clients",
    },
    description: {
      he: "בין אם אתם צריכים דף נחיתה ממוקד קמפיין או אתר תדמית מלא לעסק, אנחנו בונים חוויה דיגיטלית שמשדרת אמינות מהשנייה הראשונה. עיצוב חד, מהירות טעינה גבוהה, וקריאייטיב שמדבר בשפה של המותג שלכם.",
      en: "Whether you need a focused campaign landing page or a full corporate website, we build a digital experience that signals credibility from the first second. Sharp design, fast load times, and creative that speaks your brand's language.",
    },
    features: [
      { he: "עיצוב ייחודי מותאם למותג", en: "Custom design tailored to your brand" },
      { he: "טפסי לידים ואינטגרציה עם וואטסאפ", en: "Lead forms and WhatsApp integration" },
      { he: "מהירות טעינה ודירוג גבוה בגוגל", en: "Fast load times and strong Google rankings" },
      { he: "תמיכה מלאה בעברית (RTL) ואנגלית", en: "Full Hebrew (RTL) and English support" },
      { he: "אנימציות ואפקטים עדינים שמדגישים את המותג", en: "Subtle animations and effects that elevate the brand" },
      { he: "מותאם מלא למובייל ולכל מסך", en: "Fully responsive across mobile and every screen" },
    ],
  },
];

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);
