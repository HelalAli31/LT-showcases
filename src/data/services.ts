import { Users, ShoppingBag, LayoutTemplate, LucideIcon } from "lucide-react";

export type ServiceSlug = "crm" | "digital-stores" | "landing-pages";

export interface FaqItem {
  question: { he: string; en: string };
  answer: { he: string; en: string };
}

export interface Service {
  slug: ServiceSlug;
  icon: LucideIcon;
  title: { he: string; en: string };
  tagline: { he: string; en: string };
  description: { he: string; en: string };
  descriptionExtra: { he: string; en: string };
  features: { he: string; en: string }[];
  faq: FaqItem[];
}

export const services: Service[] = [
  {
    slug: "crm",
    icon: Users,
    title: { he: "מערכות CRM, ניהול עסק וחידוש מערכות", en: "CRM, Business Management & System Modernization" },
    tagline: {
      he: "כל הלקוחות, כל התפעול, במקום אחד — גם אם היום זה עדיין מערכת ישנה",
      en: "Every customer, every operation, in one place — even if today it's still an old system",
    },
    description: {
      he: "אנחנו בונים מערכות CRM וניהול עסק מותאמות אישית שמרכזות את כל המידע על הלקוחות, הלידים, העסקאות, המלאי והכספים שלכם — במקום גיליונות אקסל מפוזרים ותוכנות גנריות שלא מתאימות לאופן שבו העסק שלכם עובד באמת. המערכת גדלה איתכם, ומתממשקת לכלים שאתם כבר משתמשים בהם.",
      en: "We build custom CRM and business management systems that centralize every customer, lead, deal, inventory item, and financial record — replacing scattered spreadsheets and generic software that doesn't match how your business actually works. The system grows with you and integrates with the tools you already use.",
    },
    descriptionExtra: {
      he: "אותו צוות שבונה את המערכת החדשה שלכם גם יודע לשדרג מערכת קיימת: אם כבר יש לכם מערכת ניהול או CRM ישנים שעובדים אבל מרגישים מיושנים, איטיים או קשים לתחזוקה — אנחנו בודקים מה שווה לשמר ומה כדאי לבנות מחדש, ומבצעים את החידוש בהדרגה, בלי לעצור את העבודה השוטפת.",
      en: "The same team that builds your new system also knows how to modernize an existing one: if you already have a management or CRM system that works but feels dated, slow, or hard to maintain, we assess what's worth keeping and what should be rebuilt, and carry out the upgrade gradually — without stopping day-to-day operations.",
    },
    features: [
      { he: "ניהול לידים ומעקב מכירות", en: "Lead management & sales pipeline tracking" },
      { he: "היסטוריית לקוח מלאה במקום אחד", en: "Full customer history in one place" },
      { he: "ניהול מלאי, הזמנות וכוח אדם", en: "Inventory, order, and staff management" },
      { he: "דוחות כספיים ולוחות מחוונים בזמן אמת", en: "Financial reports and real-time dashboards" },
      { he: "אוטומציות לתזכורות ומשימות", en: "Automations for reminders and tasks" },
      { he: "הרשאות משתמשים לפי תפקיד או מחלקה", en: "Role- and department-based permissions" },
      { he: "אינטגרציה עם וואטסאפ, מייל ומערכות חיצוניות", en: "Integration with WhatsApp, email, and external systems" },
      { he: "שדרוג והתאמה של מערכות ישנות וקיימות", en: "Modernizing and upgrading old or existing systems" },
      { he: "מיגרציה בטוחה של נתונים היסטוריים", en: "Safe migration of historical data" },
      { he: "התאמה מלאה לתהליכי העבודה הקיימים שלכם", en: "Fully tailored to your existing workflows" },
    ],
    faq: [
      {
        question: { he: "יש לנו כבר מערכת ניהול ישנה — אתם יכולים לשדרג אותה במקום לבנות חדשה?", en: "We already have an old management system — can you upgrade it instead of building a new one?" },
        answer: {
          he: "בהחלט. אנחנו בודקים את המערכת הקיימת, מזהים מה עובד טוב ומה מעכב אתכם, ומציעים מסלול חידוש הדרגתי — ממשק מודרני, ביצועים משופרים ואבטחה עדכנית, תוך שמירה על הנתונים וההיסטוריה הקיימים.",
          en: "Absolutely. We review your existing system, identify what works well and what's holding you back, and propose a gradual modernization path — a modern interface, improved performance, and up-to-date security, while preserving your existing data and history.",
        },
      },
      {
        question: { he: "כמה זמן לוקח לבנות מערכת CRM או ניהול עסק בהתאמה אישית?", en: "How long does it take to build a custom CRM or business management system?" },
        answer: {
          he: "תלוי בהיקף: מערכת ממוקדת (למשל ניהול לידים בלבד) יכולה להיות מוכנה תוך מספר שבועות, בעוד מערכת מקיפה הכוללת מלאי, כספים וכוח אדם עשויה לקחת מספר חודשים. בכל מקרה, אנחנו עובדים בשלבים כדי שתראו תוצאות מוקדם ותוכלו לתת פידבק בדרך.",
          en: "It depends on scope: a focused system (e.g. lead management only) can be ready in a few weeks, while a comprehensive system covering inventory, finance, and staff may take a few months. Either way, we work in stages so you see results early and can give feedback along the way.",
        },
      },
      {
        question: { he: "מה קורה עם הנתונים הישנים שלנו כשעוברים למערכת חדשה?", en: "What happens to our old data when we move to a new system?" },
        answer: {
          he: "אנחנו מתכננים תהליך מיגרציה בטוח: מייצאים ומנקים את הנתונים הקיימים, ממפים אותם למבנה החדש, ובודקים שהכל עבר נכון לפני שהמערכת החדשה עולה לשימוש מלא. שום היסטוריה לא הולכת לאיבוד.",
          en: "We plan a safe migration process: exporting and cleaning your existing data, mapping it to the new structure, and verifying everything transferred correctly before the new system goes fully live. No history gets lost.",
        },
      },
      {
        question: { he: "האם המערכת תעבוד גם במובייל?", en: "Will the system work on mobile too?" },
        answer: {
          he: "כן. כל המערכות שאנחנו בונות מותאמות לעבודה נוחה גם ממחשב וגם ממכשיר נייד, כך שתוכלו לעקוב אחרי לידים, מלאי או דוחות גם כשאתם לא ליד השולחן.",
          en: "Yes. Every system we build is designed to work comfortably on both desktop and mobile, so you can track leads, inventory, or reports even when you're away from your desk.",
        },
      },
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
    descriptionExtra: {
      he: "מעבר לעיצוב, אנחנו חושבים על החנות כמערכת שלמה: איך המוצרים מסודרים, איך לקוח חדש מוצא מה שהוא מחפש תוך שניות, ואיך אתם, כבעלי החנות, מנהלים מלאי והזמנות בלי כאבי ראש. המטרה היא חנות שגם נראית יוקרתית וגם עובדת בשבילכם מאחורי הקלעים.",
      en: "Beyond design, we treat the store as one complete system: how products are organized, how a new customer finds what they're looking for within seconds, and how you, as the store owner, manage inventory and orders without headaches. The goal is a store that looks premium and also works for you behind the scenes.",
    },
    features: [
      { he: "עיצוב פרימיום מותאם למותג שלכם", en: "Premium design tailored to your brand" },
      { he: "סליקה מאובטחת ומגוון אמצעי תשלום", en: "Secure payments with multiple payment methods" },
      { he: "ניהול מלאי, מבצעים וקופונים", en: "Inventory, promotions, and coupon management" },
      { he: "אופטימיזציה למובייל ולמהירות טעינה", en: "Mobile optimization and fast load times" },
      { he: "קידום אורגני (SEO) מובנה", en: "Built-in SEO foundations" },
      { he: "חיבור למערכות משלוחים וניהול לקוחות", en: "Integration with shipping and customer-management tools" },
    ],
    faq: [
      {
        question: { he: "אפשר לחבר את החנות למערכת סליקה או משלוחים שאנחנו כבר עובדים איתה?", en: "Can the store connect to a payment or shipping provider we already use?" },
        answer: {
          he: "ברוב המקרים כן. אנחנו בונים את החנות כך שתתחבר לספקי הסליקה והמשלוחים המקובלים בישראל ובעולם, ובודקים מראש התאמה לספק הספציפי שאתם עובדים איתו.",
          en: "In most cases, yes. We build the store to connect with common payment and shipping providers in Israel and worldwide, and check compatibility with your specific provider up front.",
        },
      },
      {
        question: { he: "כמה מוצרים אפשר להעלות לחנות?", en: "How many products can we list in the store?" },
        answer: {
          he: "אין מגבלה מובנית מצידנו — בין אם יש לכם עשרות מוצרים או אלפי פריטים, אנחנו בונים את מבנה הקטלוג כך שיישאר מהיר ונוח לניהול גם כשהוא גדל.",
          en: "There's no built-in limit on our end — whether you have dozens of products or thousands of items, we structure the catalog so it stays fast and easy to manage as it grows.",
        },
      },
      {
        question: { he: "מי מעדכן את המלאי והמחירים אחרי ההשקה?", en: "Who updates inventory and pricing after launch?" },
        answer: {
          he: "אתם. אנחנו בונים לוח ניהול פשוט וברור שמאפשר לכם לעדכן מוצרים, מחירים ומלאי בעצמכם בכל רגע, בלי תלות בנו לכל שינוי קטן.",
          en: "You do. We build a simple, clear admin panel that lets you update products, prices, and inventory yourself at any time, without depending on us for every small change.",
        },
      },
      {
        question: { he: "האם החנות תופיע בחיפוש בגוגל?", en: "Will the store show up in Google search?" },
        answer: {
          he: "אנחנו בונים את החנות עם יסודות SEO נכונים מההתחלה — מבנה עמודים נקי, מהירות טעינה גבוהה ותגיות מתאימות — מה שנותן בסיס טוב לדירוג. קידום אורגני מתמשך הוא תהליך נפרד שנשמח להמליץ עליו בהתאם לצורך.",
          en: "We build the store with proper SEO foundations from the start — clean page structure, fast load times, and correct tags — which gives you a solid base for ranking. Ongoing organic SEO is a separate process we're happy to advise on as needed.",
        },
      },
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
    descriptionExtra: {
      he: "אנחנו מתחילים תמיד מהמטרה: האם האתר צריך למכור מוצר אחד ספציפי, לייצר לידים מקמפיין ממומן, או לספר את הסיפור המלא של העסק? התשובה קובעת את המבנה, התוכן והקריאה לפעולה — כך שכל אתר שאנחנו בונים עובד קשה בשבילכם, לא רק נראה טוב.",
      en: "We always start from the goal: does the site need to sell one specific product, generate leads from a paid campaign, or tell the full story of the business? The answer shapes the structure, content, and call to action — so every site we build works hard for you, not just looks good.",
    },
    features: [
      { he: "עיצוב ייחודי מותאם למותג", en: "Custom design tailored to your brand" },
      { he: "טפסי לידים ואינטגרציה עם וואטסאפ", en: "Lead forms and WhatsApp integration" },
      { he: "מהירות טעינה ודירוג גבוה בגוגל", en: "Fast load times and strong Google rankings" },
      { he: "תמיכה מלאה בעברית (RTL) ואנגלית", en: "Full Hebrew (RTL) and English support" },
      { he: "אנימציות ואפקטים עדינים שמדגישים את המותג", en: "Subtle animations and effects that elevate the brand" },
      { he: "מותאם מלא למובייל ולכל מסך", en: "Fully responsive across mobile and every screen" },
    ],
    faq: [
      {
        question: { he: "מה ההבדל בין דף נחיתה לאתר תדמית מלא?", en: "What's the difference between a landing page and a full corporate site?" },
        answer: {
          he: "דף נחיתה ממוקד במטרה אחת — מכירה, השארת פרטים או הרשמה — ולכן קצר וישיר. אתר תדמית מציג את הסיפור המלא של העסק: שירותים, פורטפוליו, צוות ויצירת קשר. לעיתים כדאי להתחיל בדף נחיתה ולהרחיב בהמשך לאתר תדמית מלא.",
          en: "A landing page focuses on one goal — a sale, a lead, or a signup — so it's short and direct. A corporate site presents the full story of the business: services, portfolio, team, and contact. Sometimes it makes sense to start with a landing page and expand later into a full corporate site.",
        },
      },
      {
        question: { he: "כמה זמן לוקח לבנות דף נחיתה או אתר תדמית?", en: "How long does it take to build a landing page or corporate site?" },
        answer: {
          he: "דף נחיתה ממוקד יכול להיות מוכן תוך ימים ספורים עד שבוע-שבועיים, ואילו אתר תדמית מלא עם כמה עמודים לוקח בדרך כלל בין שבועיים לחודש, תלוי בהיקף התוכן והעיצוב.",
          en: "A focused landing page can be ready within a few days to one or two weeks, while a full multi-page corporate site typically takes between two weeks and a month, depending on content and design scope.",
        },
      },
      {
        question: { he: "אתם כותבים גם את התוכן והטקסטים, או שאנחנו צריכים לספק אותם?", en: "Do you also write the content and copy, or do we need to provide it?" },
        answer: {
          he: "שני המסלולים אפשריים. אם יש לכם כבר טקסטים וחומרים, נשלב אותם בעיצוב; אם לא, נשמח לנסח את התוכן איתכם על בסיס שיחה על העסק, השירותים והקהל שלכם.",
          en: "Both options work. If you already have copy and materials, we'll incorporate them into the design; if not, we're happy to draft the content with you based on a conversation about your business, services, and audience.",
        },
      },
      {
        question: { he: "האם האתר יהיה מהיר וידורג טוב בגוגל?", en: "Will the site be fast and rank well on Google?" },
        answer: {
          he: "מהירות טעינה ויסודות SEO נכונים הם חלק בלתי נפרד מהבנייה שלנו, לא תוספת בסוף. כל דף נחיתה ואתר תדמית שאנחנו מוציאים עובר בדיקת ביצועים לפני ההשקה.",
          en: "Fast load times and proper SEO foundations are built in from the start, not an afterthought. Every landing page and corporate site we ship goes through a performance check before launch.",
        },
      },
    ],
  },
];

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);

export const generalFaq: FaqItem[] = [
  {
    question: { he: "איך תהליך העבודה נראה מרגע שיוצרים קשר?", en: "What does the process look like from the moment we get in touch?" },
    answer: {
      he: "מתחילים בשיחת היכרות קצרה על העסק והצורך שלכם, ממשיכים לאפיון מפורט של היקף הפרויקט, ואז עוברים לעיצוב, פיתוח, בדיקות והשקה — עם עדכונים שוטפים לאורך כל הדרך.",
      en: "We start with a short introductory conversation about your business and needs, move to a detailed scoping of the project, and then proceed through design, development, testing, and launch — with regular updates along the way.",
    },
  },
  {
    question: { he: "אתם עובדים גם עם עסקים מחוץ לישראל?", en: "Do you work with businesses outside Israel?" },
    answer: {
      he: "כן. אנחנו עובדים מרחוק עם לקוחות בארץ ובעולם, ומתאימים את שעות התקשורת ואת השפה (עברית או אנגלית) לצרכים שלכם.",
      en: "Yes. We work remotely with clients in Israel and worldwide, and adapt communication hours and language (Hebrew or English) to your needs.",
    },
  },
  {
    question: { he: "מה מבנה התשלום על פרויקט?", en: "What does the payment structure look like?" },
    answer: {
      he: "בדרך כלל עובדים במקדמה בתחילת הפרויקט ותשלומים נוספים לפי אבני דרך מוסכמות מראש, כך שהתשלום מתקדם יחד עם ההתקדמות בפועל של הפרויקט.",
      en: "We typically work with an upfront deposit and additional payments tied to milestones agreed in advance, so payment progresses alongside actual project progress.",
    },
  },
  {
    question: { he: "מה קורה אם נרצה לשנות משהו אחרי ההשקה?", en: "What happens if we want to change something after launch?" },
    answer: {
      he: "זה טבעי לחלוטין. אנחנו מציעים חבילות תמיכה ותחזוקה שוטפת, וגם שינויים חד-פעמיים אפשריים בכל שלב — פשוט מדברים איתנו על מה שצריך.",
      en: "That's completely natural. We offer ongoing support and maintenance packages, and one-off changes are possible at any stage — just talk to us about what's needed.",
    },
  },
  {
    question: { he: "יש לנו כבר אתר או מערכת קיימים — אפשר לשפר אותם במקום לבנות מחדש?", en: "We already have an existing site or system — can you improve it instead of rebuilding?" },
    answer: {
      he: "בהחלט, וזו לא פעם הבחירה הנכונה יותר. אנחנו בודקים את מה שקיים ומייעצים אם מדובר בשדרוג ממוקד, שיפוץ הדרגתי, או שבאמת כדאי להתחיל מחדש.",
      en: "Absolutely, and it's often the smarter choice. We review what already exists and advise whether a focused upgrade, a gradual overhaul, or truly starting fresh makes the most sense.",
    },
  },
];
