import type { ServiceSlug } from "./services";

export type ArticleCategory = ServiceSlug | "general";

export interface ArticleBlock {
  type: "heading" | "paragraph";
  he: string;
  en: string;
}

export interface Article {
  slug: string;
  category: ArticleCategory;
  date: string; // ISO
  readTime: number; // minutes
  cover: string;
  title: { he: string; en: string };
  excerpt: { he: string; en: string };
  content: ArticleBlock[];
}

const IMG = {
  crm: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80&auto=format&fit=crop",
  spreadsheet: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop",
  legacy: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
  ecommerce: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&auto=format&fit=crop",
  landing: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1600&q=80&auto=format&fit=crop",
  cost: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80&auto=format&fit=crop",
};

export const articles: Article[] = [
  {
    slug: "signs-your-business-needs-a-crm",
    category: "crm",
    date: "2026-02-10",
    readTime: 6,
    cover: IMG.crm,
    title: {
      he: "5 סימנים שהעסק שלכם צריך מערכת CRM",
      en: "5 Signs Your Business Needs a CRM System",
    },
    excerpt: {
      he: "אם אתם מוצאים את עצמכם מחפשים פרטי לקוח בין וואטסאפ, אקסל ומייל — כנראה שהגיע הזמן למערכת CRM אמיתית.",
      en: "If you find yourself hunting for a customer's details across WhatsApp, Excel, and email — it's probably time for a real CRM.",
    },
    content: [
      {
        type: "paragraph",
        he: "ככל שעסק גדל, כך גדל גם מספר הלקוחות, הלידים והשיחות שצריך לעקוב אחריהם. בשלב מסוים, כלים כלליים כמו אקסל או קבוצות וואטסאפ פשוט מפסיקים להספיק. הנה חמישה סימנים שמעידים שהגיע הזמן למערכת CRM מותאמת אישית.",
        en: "As a business grows, so does the number of customers, leads, and conversations you need to track. At some point, general-purpose tools like Excel or WhatsApp groups simply stop being enough. Here are five signs it's time for a custom CRM system.",
      },
      {
        type: "heading",
        he: "1. אתם מאבדים לידים בין הסדקים",
        en: "1. You're losing leads between the cracks",
      },
      {
        type: "paragraph",
        he: "ליד שהתקבל ביום שישי בערב ונשכח עד יום שני הוא לקוח שאיבדתם. כשאין מקום מרכזי אחד לכל הפניות הנכנסות, קל מאוד שדברים ייפלו בין הכיסאות — במיוחד כשכמה אנשי מכירות עובדים במקביל.",
        en: "A lead that came in Friday evening and got forgotten until Monday is a customer you've lost. Without one central place for every incoming inquiry, it's easy for things to fall through the cracks — especially with multiple salespeople working in parallel.",
      },
      {
        type: "heading",
        he: "2. אין לכם תמונה מלאה על כל לקוח",
        en: "2. You don't have a full picture of each customer",
      },
      {
        type: "paragraph",
        he: "מתי דיברתם איתו לאחרונה? מה הוא קנה? האם הוא פנה בתלונה? כשהמידע מפוזר בין אנשים וכלים שונים, קשה לתת שירות עקבי ואישי — ולקוחות מרגישים את זה.",
        en: "When did you last speak with them? What did they buy? Did they ever file a complaint? When information is scattered across people and tools, it's hard to deliver consistent, personal service — and customers can feel it.",
      },
      {
        type: "heading",
        he: "3. דוחות מכירות לוקחים שעות לבנות",
        en: "3. Sales reports take hours to build",
      },
      {
        type: "paragraph",
        he: "אם כל דוח חודשי דורש חיבור ידני של כמה קבצי אקסל, זה זמן יקר שיכול להיות מושקע במכירה בפועל. מערכת CRM נותנת תמונת מצב בזמן אמת בלחיצת כפתור.",
        en: "If every monthly report requires manually stitching together several spreadsheets, that's valuable time that could go into actual selling. A CRM gives you a real-time snapshot at the click of a button.",
      },
      {
        type: "heading",
        he: "4. קשה לדעת מי אחראי על מה",
        en: "4. It's hard to know who's responsible for what",
      },
      {
        type: "paragraph",
        he: "כשהצוות גדל, חשוב לדעת איזה איש מכירות מטפל באיזה לקוח, ומה השלב הבא בתהליך. מערכת CRM מגדירה בעלות ברורה על כל ליד ועסקה.",
        en: "As a team grows, it becomes essential to know which salesperson owns which customer, and what the next step is. A CRM gives clear ownership over every lead and deal.",
      },
      {
        type: "heading",
        he: "5. אתם רוצים להתחיל לחזות מכירות, לא רק לתעד אותן",
        en: "5. You want to start forecasting sales, not just recording them",
      },
      {
        type: "paragraph",
        he: "כלים גנריים טובים לתיעוד העבר, אבל CRM מותאם אישית עוזר לזהות דפוסים, לחזות הכנסות ולקבל החלטות מבוססות נתונים לגבי העתיד.",
        en: "Generic tools are fine for documenting the past, but a custom CRM helps you spot patterns, forecast revenue, and make data-driven decisions about the future.",
      },
      {
        type: "paragraph",
        he: "אם זיהיתם את העסק שלכם באחד או יותר מהסימנים האלה, כדאי לבחון מערכת CRM שמותאמת בדיוק לתהליך המכירה שלכם — לא תוכנה גנרית שתדרוש מכם להתאים את עצמכם אליה.",
        en: "If you recognized your business in one or more of these signs, it's worth considering a CRM built exactly around your sales process — not generic software that forces you to adapt to it.",
      },
    ],
  },
  {
    slug: "why-excel-is-not-enough-anymore",
    category: "crm",
    date: "2026-01-22",
    readTime: 5,
    cover: IMG.spreadsheet,
    title: {
      he: "למה גיליון אקסל כבר לא מספיק לניהול העסק שלכם",
      en: "Why a Spreadsheet Is No Longer Enough to Run Your Business",
    },
    excerpt: {
      he: "אקסל הוא כלי מדהים — עד שהעסק גדל. הנה מתי שווה לעבור למערכת ניהול פנימית בהתאמה אישית.",
      en: "Excel is a fantastic tool — until your business grows. Here's when it's worth moving to a custom internal management system.",
    },
    content: [
      {
        type: "paragraph",
        he: "כמעט כל עסק מתחיל עם אקסל: רשימת מלאי, לוח משמרות, מעקב הזמנות. זה זול, גמיש וכולם יודעים להשתמש בו. אבל בשלב מסוים, אותו כלי שחסך זמן הופך לצוואר בקבוק.",
        en: "Almost every business starts with a spreadsheet: an inventory list, a shift schedule, an order tracker. It's cheap, flexible, and everyone knows how to use it. But at some point, the tool that once saved time becomes a bottleneck.",
      },
      {
        type: "heading",
        he: "הסיכון של מקור אמת אחד שהוא בעצם הרבה קבצים",
        en: "The risk of one 'source of truth' that's actually many files",
      },
      {
        type: "paragraph",
        he: "כשכמה אנשים עורכים גרסאות שונות של אותו קובץ, קל מאוד שנתונים יסתרו זה את זה. מי ראה את הגרסה העדכנית ביותר? מה קרה לשינוי שנעשה אתמול? מערכת ניהול מרכזית פותרת את זה מהיסוד — כולם רואים את אותם הנתונים, בזמן אמת.",
        en: "When several people edit different versions of the same file, data conflicts are almost guaranteed. Who saw the latest version? What happened to yesterday's change? A central management system solves this at the root — everyone sees the same data, in real time.",
      },
      {
        type: "heading",
        he: "אין הרשאות, אין ביקורת",
        en: "No permissions, no audit trail",
      },
      {
        type: "paragraph",
        he: "אקסל לא יודע להגביל מי רואה מה, ולא שומר תיעוד מסודר של מי שינה מה ומתי. במערכת מותאמת אישית אפשר להגדיר הרשאות לפי תפקיד, ולדעת בדיוק מה קרה בכל שלב.",
        en: "Excel can't restrict who sees what, and it keeps no clean record of who changed what and when. A custom system lets you set role-based permissions and know exactly what happened at every step.",
      },
      {
        type: "heading",
        he: "אין חיבור בין החלקים",
        en: "The pieces don't talk to each other",
      },
      {
        type: "paragraph",
        he: "מלאי, הזמנות, כספים וכוח אדם — כשכל אחד מהם חי בקובץ נפרד, אין תמונה מלאה. מערכת ניהול עסקית מחברת את כל התהליכים, כך שעדכון במלאי מתעדכן אוטומטית גם בדוח הכספי.",
        en: "Inventory, orders, finance, and staffing — when each lives in its own file, there's no complete picture. A business management system connects every process, so an inventory update automatically flows into the financial report too.",
      },
      {
        type: "paragraph",
        he: "המעבר ממערכת אד-הוק למערכת ניהול פנימית לא חייב להיות מהפכני וקיצוני. אפשר להתחיל בתהליך אחד כואב במיוחד, ולהרחיב בהדרגה — כך שהעסק ממשיך לתפקד תוך כדי השדרוג.",
        en: "Moving from an ad-hoc setup to an internal management system doesn't have to be a dramatic overhaul. You can start with the single most painful process and expand gradually — so the business keeps running while it upgrades.",
      },
    ],
  },
  {
    slug: "5-signs-its-time-to-modernize-your-system",
    category: "system-modernization",
    date: "2026-03-02",
    readTime: 6,
    cover: IMG.legacy,
    title: {
      he: "5 סימנים שהגיע הזמן לחדש את המערכת הישנה שלכם",
      en: "5 Signs It's Time to Modernize Your Legacy System",
    },
    excerpt: {
      he: "מערכת שעובדת היא לא בהכרח מערכת שמשרתת אתכם נכון. איך לזהות שהגיע הזמן לשדרוג.",
      en: "A system that 'works' isn't necessarily one that's serving you well. Here's how to tell it's time for an upgrade.",
    },
    content: [
      {
        type: "paragraph",
        he: "מערכות ישנות נוטות להישאר במקום כי 'הן עדיין עובדות'. הבעיה היא שהעלות האמיתית שלהן לא תמיד נראית לעין — עד שהיא פוגעת בעסק בצורה שקשה להתעלם ממנה.",
        en: "Legacy systems tend to stick around because 'they still work.' The problem is their real cost isn't always visible — until it starts hurting the business in ways that are hard to ignore.",
      },
      {
        type: "heading",
        he: "1. כל שינוי קטן לוקח שבועות",
        en: "1. Every small change takes weeks",
      },
      {
        type: "paragraph",
        he: "אם הוספת שדה פשוט למערכת דורשת פרויקט שלם, כנראה שהקוד הישן הפך שביר מדי לשינויים בטוחים.",
        en: "If adding a simple field to the system requires an entire project, the old code has probably become too fragile for safe changes.",
      },
      {
        type: "heading",
        he: "2. אין מי שבאמת מכיר את הקוד",
        en: "2. No one truly understands the code anymore",
      },
      {
        type: "paragraph",
        he: "מערכות שנכתבו לפני שנים רבות, לעיתים בטכנולוגיות שכבר לא נתמכות, יוצרות תלות מסוכנת באנשים ספציפיים או בספק אחד.",
        en: "Systems written many years ago, sometimes in technologies no longer supported, create a risky dependency on specific people or a single vendor.",
      },
      {
        type: "heading",
        he: "3. עובדים חדשים מתקשים ללמוד להשתמש בה",
        en: "3. New employees struggle to learn it",
      },
      {
        type: "paragraph",
        he: "ממשק מיושן מאריך את זמן ההכשרה, מגדיל טעויות אנוש, ופוגע בפרודוקטיביות של עובדים חדשים בחודשים הראשונים שלהם.",
        en: "A dated interface lengthens training time, increases human error, and hurts new employees' productivity in their first months.",
      },
      {
        type: "heading",
        he: "4. אי אפשר לחבר אותה לכלים חדשים",
        en: "4. It can't connect to new tools",
      },
      {
        type: "paragraph",
        he: "עולם התוכנה מתקדם באמצעות API ואינטגרציות. מערכת ישנה בלי יכולות חיבור פשוט מבודדת את העסק מכלים שיכולים לחסוך זמן וכסף.",
        en: "The software world moves forward through APIs and integrations. An old system with no connectivity isolates the business from tools that could save time and money.",
      },
      {
        type: "heading",
        he: "5. אבטחת המידע מדאיגה אתכם",
        en: "5. Data security keeps you up at night",
      },
      {
        type: "paragraph",
        he: "מערכות ישנות לרוב לא עומדות בסטנדרטים עדכניים של אבטחת מידע, מה שחושף את העסק ואת הלקוחות שלו לסיכון מיותר.",
        en: "Older systems often fall short of modern data-security standards, exposing the business and its customers to unnecessary risk.",
      },
      {
        type: "paragraph",
        he: "חידוש מערכות לא חייב לקרות בבת אחת. אפשר לשדרג בהדרגה — מודול אחר מודול — כך שהעסק ממשיך לפעול בזמן שהמערכת מתעדכנת מתחתיו.",
        en: "System modernization doesn't have to happen all at once. You can upgrade gradually — module by module — so the business keeps running while the system is updated underneath it.",
      },
    ],
  },
  {
    slug: "ecommerce-trends-to-watch",
    category: "digital-stores",
    date: "2026-04-15",
    readTime: 7,
    cover: IMG.ecommerce,
    title: {
      he: "טרנדים במסחר אלקטרוני שכל בעל חנות צריך להכיר",
      en: "E-commerce Trends Every Store Owner Should Know",
    },
    excerpt: {
      he: "מקנייה במובייל ועד תשלומים מהירים — כך נראית חנות אונליין שבאמת ממירה בשנה הקרובה.",
      en: "From mobile shopping to fast checkout — here's what a truly high-converting online store looks like this year.",
    },
    content: [
      {
        type: "paragraph",
        he: "המסחר האלקטרוני ממשיך להתפתח בקצב מהיר, וגולשים מצפים לחוויית קנייה שהיא גם מהירה וגם אישית. אלה המגמות שהכי משפיעות על שיעורי ההמרה כרגע.",
        en: "E-commerce keeps evolving fast, and shoppers now expect an experience that's both quick and personal. Here are the trends currently making the biggest difference to conversion rates.",
      },
      {
        type: "heading",
        he: "מובייל-פירסט הוא לא אופציה, זו ברירת המחדל",
        en: "Mobile-first isn't optional — it's the default",
      },
      {
        type: "paragraph",
        he: "רוב הגלישה בחנויות אונליין מגיעה ממכשירים ניידים. חנות שלא נבנתה במחשבה על מובייל מהיום הראשון פשוט מאבדת לקוחות פוטנציאליים.",
        en: "Most browsing in online stores now happens on mobile devices. A store that wasn't designed mobile-first from day one is simply losing potential customers.",
      },
      {
        type: "heading",
        he: "קופה חכמה במקום קופה ארוכה",
        en: "A smart checkout instead of a long one",
      },
      {
        type: "paragraph",
        he: "כל שדה מיותר בקופה מפחית את שיעור ההשלמה. קופות חד-עמודיות, שמירת פרטים ותשלום באמצעי דיגיטליים מקצרים משמעותית את זמן הרכישה.",
        en: "Every unnecessary field at checkout reduces completion rates. One-page checkouts, saved details, and digital payment methods significantly shorten purchase time.",
      },
      {
        type: "heading",
        he: "התאמה אישית מבוססת התנהגות",
        en: "Behavior-based personalization",
      },
      {
        type: "paragraph",
        he: "המלצות מוצר מבוססות על היסטוריית גלישה ורכישה מגדילות את הערך הממוצע של ההזמנה, ומרגישות ללקוח כמו שירות אישי ולא מכירה גנרית.",
        en: "Product recommendations based on browsing and purchase history increase average order value, and feel to the customer like personal service rather than a generic sale.",
      },
      {
        type: "heading",
        he: "שקיפות במלאי ובזמני משלוח",
        en: "Transparency in stock and shipping times",
      },
      {
        type: "paragraph",
        he: "לקוחות מעריכים לדעת מיד אם מוצר במלאי ומתי הוא יגיע. חוסר ודאות בנקודה הזו הוא אחת הסיבות הנפוצות לנטישת עגלה.",
        en: "Customers value knowing immediately whether a product is in stock and when it will arrive. Uncertainty at this point is one of the most common reasons for cart abandonment.",
      },
      {
        type: "paragraph",
        he: "חנות דיגיטלית טובה היא לא רק עיצוב יפה — היא שילוב של ביצועים, אמון ופרטים קטנים שמצטברים לחוויית קנייה חלקה מקצה לקצה.",
        en: "A great digital store isn't just good-looking design — it's a combination of performance, trust, and small details that add up to a seamless end-to-end shopping experience.",
      },
    ],
  },
  {
    slug: "landing-page-vs-corporate-site",
    category: "landing-pages",
    date: "2026-05-06",
    readTime: 5,
    cover: IMG.landing,
    title: {
      he: "דף נחיתה או אתר תדמית? איך לבחור נכון",
      en: "Landing Page or Corporate Site? How to Choose",
    },
    excerpt: {
      he: "שני כלים שונים למטרות שונות. הבנת ההבדל תחסוך לכם זמן, כסף ותוצאות טובות יותר.",
      en: "Two different tools for two different goals. Understanding the difference will save you time, money, and get you better results.",
    },
    content: [
      {
        type: "paragraph",
        he: "אחת השאלות הראשונות שעולה כשעסק ניגש לבנות נוכחות דיגיטלית היא: דף נחיתה או אתר תדמית מלא? התשובה תלויה במטרה שאתם מנסים להשיג.",
        en: "One of the first questions a business faces when building a digital presence is: a landing page, or a full corporate site? The answer depends on the goal you're trying to achieve.",
      },
      {
        type: "heading",
        he: "דף נחיתה: ממוקד, ומטרתו פעולה אחת",
        en: "Landing page: focused, built for one action",
      },
      {
        type: "paragraph",
        he: "דף נחיתה נבנה סביב מטרה יחידה — מכירה של מוצר ספציפי, רישום לאירוע, או השארת פרטים לקמפיין פרסומי. אין בו הסחות דעת מיותרות, וכל אלמנט מוביל לאותה קריאה לפעולה.",
        en: "A landing page is built around a single goal — selling a specific product, registering for an event, or capturing a lead for an ad campaign. There are no unnecessary distractions, and every element drives toward the same call to action.",
      },
      {
        type: "heading",
        he: "אתר תדמית: הבית הדיגיטלי של המותג",
        en: "Corporate site: the brand's digital home",
      },
      {
        type: "paragraph",
        he: "אתר תדמית מציג את הסיפור המלא של העסק — שירותים, פורטפוליו, צוות, ערכים ומידע ליצירת קשר. זה הכתובת שאליה כל דרך מקוונת מובילה בסוף, מ-Google ועד כרטיס ביקור.",
        en: "A corporate website presents the full story of the business — services, portfolio, team, values, and contact information. It's the address every online path eventually leads to, from Google to a business card.",
      },
      {
        type: "heading",
        he: "מתי כדאי כל אחד מהם",
        en: "When each one makes sense",
      },
      {
        type: "paragraph",
        he: "אם אתם מריצים קמפיין ממומן עם מסר ברור אחד — דף נחיתה הוא הכלי המדויק. אם אתם רוצים לבנות אמון ארוך טווח ולהציג את מלוא הפעילות שלכם — אתר תדמית הוא הבסיס. הרבה עסקים בסוף צריכים את שניהם, ובונים אותם כך שיעבדו יחד.",
        en: "If you're running a paid campaign with one clear message, a landing page is the precise tool. If you want to build long-term trust and showcase the full scope of your work, a corporate site is the foundation. Many businesses end up needing both, built to work together.",
      },
    ],
  },
  {
    slug: "the-real-cost-of-custom-software",
    category: "general",
    date: "2026-06-18",
    readTime: 6,
    cover: IMG.cost,
    title: {
      he: "כמה עולה תוכנה בהתאמה אישית — ולמה זה משתלם",
      en: "How Much Does Custom Software Cost — and Why It Pays Off",
    },
    excerpt: {
      he: "פתרון מותאם אישית נראה יקר יותר בהתחלה. ככה מסתכלים על העלות האמיתית לאורך זמן.",
      en: "A custom solution looks more expensive up front. Here's how to look at the real cost over time.",
    },
    content: [
      {
        type: "paragraph",
        he: "השאלה 'כמה זה עולה' היא לרוב השאלה הראשונה שעולה כשחושבים על מערכת בהתאמה אישית. אבל ההשוואה הנכונה היא לא מול 'חינם', אלא מול העלות האמיתית של להמשיך עם פתרונות שלא מתאימים לעסק.",
        en: "'How much does this cost' is usually the first question that comes up when considering a custom system. But the right comparison isn't against 'free' — it's against the real cost of continuing with solutions that don't fit the business.",
      },
      {
        type: "heading",
        he: "העלות הנסתרת של פתרונות מדף",
        en: "The hidden cost of off-the-shelf solutions",
      },
      {
        type: "paragraph",
        he: "מנוי חודשי לתוכנה גנרית נראה זול, אבל שעות העבודה שהולכות על עקיפת מגבלות המערכת, תהליכים ידניים ותחזוקה של פתרונות ביניים — מצטברות לעלות אמיתית וגבוהה משמעותית.",
        en: "A monthly subscription to generic software looks cheap, but the hours spent working around the system's limitations, manual processes, and patchwork fixes add up to a real — and significantly higher — cost.",
      },
      {
        type: "heading",
        he: "השקעה חד פעמית מול תשלום מתמשך שלא נגמר",
        en: "A one-time investment vs. an endless recurring payment",
      },
      {
        type: "paragraph",
        he: "מערכת בהתאמה אישית היא נכס של העסק, לא מנוי שממשיך להצטבר לנצח. לאחר ההשקה, עלויות התחזוקה הן לרוב נמוכות משמעותית ממה שמשלמים על כלי מדף מתקדם.",
        en: "A custom system is a business asset, not a subscription that keeps accumulating forever. Once launched, maintenance costs are typically far lower than what's paid for an advanced off-the-shelf tool.",
      },
      {
        type: "heading",
        he: "מה שבאמת קובע את המחיר",
        en: "What actually determines the price",
      },
      {
        type: "paragraph",
        he: "היקף הפרויקט, מספר האינטגרציות הנדרשות, ורמת המורכבות של התהליכים העסקיים — כל אלה משפיעים על העלות הרבה יותר מ'סוג' המערכת. שיחת אפיון ראשונית טובה נותנת הערכה מדויקת עוד לפני שהתחלנו לפתח.",
        en: "Project scope, the number of required integrations, and the complexity of your business processes affect the cost far more than the 'type' of system. A good initial scoping conversation gives an accurate estimate before development even begins.",
      },
      {
        type: "paragraph",
        he: "בסופו של דבר, השאלה הנכונה היא לא 'כמה זה עולה', אלא 'כמה זה שווה לעסק שלי' — בזמן שנחסך, בטעויות שנמנעות, ובהזדמנויות שנפתחות כשהמערכת סוף סוף עובדת בשבילכם.",
        en: "Ultimately, the right question isn't 'how much does this cost,' but 'what is it worth to my business' — in time saved, mistakes avoided, and opportunities opened up once the system finally works for you.",
      },
    ],
  },
];

export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

const categoryLabelKeys: Record<ArticleCategory, string> = {
  general: "blog.category.general",
  crm: "portfolio.filter.crm",
  "system-modernization": "portfolio.filter.systemModernization",
  "digital-stores": "portfolio.filter.digitalStores",
  "landing-pages": "portfolio.filter.landingPages",
};

export const getCategoryLabelKey = (category: ArticleCategory) => categoryLabelKeys[category];
