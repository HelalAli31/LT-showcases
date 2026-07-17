import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  he: {
    // Header
    'nav.about': 'אודות',
    'nav.values': 'ערכים',
    'nav.portfolio': 'פורטפוליו',
    'nav.videos': 'סרטונים',
    'nav.contact': 'צור קשר',
    'nav.cta': 'קבלו הצעת מחיר',
    'nav.home': 'בית',
    'nav.services': 'שירותים',
    'nav.blog': 'מאמרים',

    // Hero
    'hero.headline': 'בונים חוויות דיגיטליות שמייצרות אמון',
    'hero.subheadline': 'Luxury Tech מפתחים אתרים, אפליקציות ומערכות ניהול לבתי עסק שרוצים לבלוט',
    'hero.cta': 'דברו איתנו',
    
    // About
    'about.title': 'מי אנחנו',
    'about.description': 'אנחנו צוות מפתחים ומעצבים שבונה אתרים, אפליקציות מובייל ומערכות ניהול מתקדמות. מומחים בחנויות אונליין, אפליקציות מותאמות אישית, ומערכות ארגוניות.',
    'about.cap1': 'אתרים ואפליקציות מתקדמות',
    'about.cap2': 'מערכות ניהול חכמות',
    'about.cap3': 'חנויות אונליין פרמיום',
    'about.cap4': 'אבטחה ומהירות מובילים',
    
    // Values
    'values.title': 'הערכים שלנו',
    'values.innovation': 'חדשנות',
    'values.innovation.desc': 'תמיד צעד אחד קדימה עם טכנולוגיות חדשניות ופתרונות יצירתיים',
    'values.transparency': 'שקיפות',
    'values.transparency.desc': 'תקשורת ברורה ופתוחה בכל שלב של הפרויקט',
    'values.excellence': 'מצוינות',
    'values.excellence.desc': 'מחויבות לאיכות הגבוהה ביותר בכל פרט ופרט',
    'values.partnership': 'שותפות',
    'values.partnership.desc': 'עבודה משותפת להשגת המטרות העסקיות שלכם',
    
    // Portfolio
    'portfolio.title': 'חלק מהפרויקטים שלנו',
    'portfolio.filter.all': 'הכל',
    'portfolio.filter.ecommerce': 'חנויות',
    'portfolio.filter.admin': 'ניהול',
    'portfolio.filter.corporate': 'תדמית',
    'portfolio.view': 'צפייה בפרויקט',
    'portfolio.close': 'סגור',
    'portfolio.videoSoon': 'הוספת וידאו בקרוב',
    
    // Videos
    'videos.title': 'סרטונים אחרונים',
    'videos.showreel': 'הדגשה ראשית',
    
    // Contact
    'contact.title': 'בואו נבנה משהו מדויק יחד',
    'contact.subtitle': 'ספרו לנו על הפרויקט שלכם ונחזור אליכם בהקדם',
    'contact.name': 'שם מלא',
    'contact.phone': 'טלפון',
    'contact.email': 'אימייל',
    'contact.projectType': 'סוג פרויקט',
    'contact.projectType.ecommerce': 'חנות אונליין',
    'contact.projectType.admin': 'מערכת ניהול',
    'contact.projectType.corporate': 'אתר תדמית',
    'contact.projectType.other': 'אחר',
    'contact.message': 'ספרו לנו על הפרויקט',
    'contact.submit': 'שלחו הודעה',
    'contact.thanks': 'תודה! נחזור אליכם בקרוב',
    'contact.whatsapp': 'או צרו קשר בוואטסאפ',
    
    // Footer
    'footer.tagline': 'בונים חוויות דיגיטליות שמייצרות אמון',
    'footer.links': 'קישורים',
    'footer.contact': 'צור קשר',
    'footer.follow': 'עקבו אחרינו',
    'footer.rights': '© 2025 Luxury Tech. כל הזכויות שמורות.',
    
    // WhatsApp
    'whatsapp.tooltip': 'דברו איתנו בוואטסאפ',
    'whatsapp.message': 'שלום, ראיתי את האתר של Luxury Tech ומתעניין/ת בבניית אתר.',

    // Home (new)
    'home.services.title': 'מה אנחנו עושים',
    'home.services.subtitle': 'תחומי הליבה שמאפשרים לעסק שלכם לגדול בביטחון',
    'home.services.viewAll': 'לכל השירותים',
    'home.portfolio.title': 'עבודות נבחרות',
    'home.portfolio.viewAll': 'לכל הפרויקטים',
    'home.contact.title': 'בואו נבנה משהו מדויק יחד',
    'home.contact.subtitle': 'ספרו לנו על הפרויקט שלכם ונחזור אליכם בהקדם',
    'home.contact.cta': 'לעמוד יצירת קשר',

    // Services (page-level, new)
    'services.pageTitle': 'השירותים שלנו',
    'services.pageSubtitle': 'פתרונות טכנולוגיים מקצה לקצה, מותאמים אישית לעסק שלכם',
    'services.learnMore': 'למידע נוסף',
    'services.backToServices': 'חזרה לשירותים',
    'services.whatsIncluded': 'מה כלול בשירות',
    'services.ourProcess': 'תהליך העבודה שלנו',
    'services.relatedWork': 'דוגמאות מהעבודות שלנו',
    'services.ctaTitle': 'מוכנים להתחיל פרויקט?',
    'services.ctaSubtitle': 'ספרו לנו על הצרכים שלכם ונבנה יחד את הפתרון המתאים',
    'services.ctaButton': 'דברו איתנו',

    // Portfolio (page-level, new)
    'portfolio.pageTitle': 'הפרויקטים שלנו',
    'portfolio.pageSubtitle': 'מבחר מהעבודות שביצענו עבור לקוחות ומיזמים בתחומים שונים',
    'portfolio.concept': 'עבודת קונספט',
    'portfolio.videoDemo': 'הדגמת מערכת בווידאו',
    'portfolio.filter.crm': 'מערכות CRM וניהול עסק',
    'portfolio.filter.systemModernization': 'חידוש מערכות',
    'portfolio.filter.digitalStores': 'חנויות דיגיטליות',
    'portfolio.filter.landingPages': 'דפי נחיתה ותדמית',

    // Blog (new)
    'blog.pageTitle': 'מאמרים ותובנות',
    'blog.pageSubtitle': 'תובנות, מדריכים וטרנדים מהעולם של פיתוח תוכנה ועסקים דיגיטליים',
    'blog.readMore': 'קראו עוד',
    'blog.backToBlog': 'חזרה למאמרים',
    'blog.minRead': 'דקות קריאה',
    'blog.relatedArticles': 'מאמרים נוספים',
    'blog.notFound': 'המאמר לא נמצא',
    'blog.category.general': 'תובנות כלליות',

    // About (page-level, new)
    'about.story.title': 'הסיפור שלנו',
    'about.story.p1': 'Luxury Tech נולדה מתוך אמונה פשוטה: לעסקים קטנים ובינוניים מגיע אותו רמת טכנולוגיה שמניעה חברות ענק — בלי המחיר והבירוקרטיה של חברות ענק.',
    'about.story.p2': 'התחלנו כצוות מצומצם של מפתחים ומעצבים, ועם השנים בנינו עשרות מערכות, חנויות ואתרים ללקוחות בישראל ומעבר לים. כל פרויקט מלמד אותנו משהו חדש שאנחנו מביאים לפרויקט הבא.',
    'about.story.p3': 'היום אנחנו משלבים פיתוח, עיצוב ואסטרטגיה תחת קורת גג אחת, כדי שכל לקוח יקבל פתרון שלם — לא רק קוד.',
    'about.process.title': 'איך אנחנו עובדים',
    'about.process.subtitle': 'תהליך ברור ושקוף מהרעיון ועד ההשקה',
    'about.process.step1.title': 'גילוי ואפיון',
    'about.process.step1.desc': 'מכירים את העסק שלכם, המטרות והאתגרים, ומגדירים יחד את היקף הפרויקט.',
    'about.process.step2.title': 'עיצוב ואבטיפוס',
    'about.process.step2.desc': 'בונים חוויית משתמש ועיצוב שמשקפים את המותג שלכם, לפני שורת קוד אחת.',
    'about.process.step3.title': 'פיתוח ובדיקות',
    'about.process.step3.desc': 'פיתוח מודולרי, בדיקות לאורך הדרך, ועדכונים שוטפים על ההתקדמות.',
    'about.process.step4.title': 'השקה וליווי',
    'about.process.step4.desc': 'עולים לאוויר, מלווים, ותומכים בכל שאלה או שינוי גם אחרי ההשקה.',
    'about.stats.projects': 'פרויקטים שהושלמו',
    'about.stats.years': 'שנות ניסיון משולבות',
    'about.stats.satisfaction': 'שביעות רצון לקוחות',
    'about.cta.title': 'בואו נכיר',
    'about.cta.subtitle': 'נשמח לשמוע על העסק שלכם ולבחון איך נוכל לעזור',
    'about.cta.button': 'צרו קשר',

    // Contact (page-level, new)
    'contact.pageSubtitle': 'הכי מהיר לדבר איתנו זה בוואטסאפ — נחזור אליכם באותו היום',
    'contact.info.title': 'פרטי התקשרות',
    'contact.info.phone': 'טלפון',
    'contact.info.email': 'אימייל',
    'contact.info.hours': 'שעות פעילות',
    'contact.info.hoursValue': 'א׳–ה׳, 09:00–18:00',
    'contact.whatsapp.title': 'דברו איתנו בוואטסאפ',
    'contact.whatsapp.desc': 'הדרך המהירה ביותר לקבל מענה. שלחו הודעה ונחזור אליכם תוך זמן קצר.',
    'contact.social.title': 'עקבו אחרינו',

    // 404 (new)
    'notFound.title': 'העמוד לא נמצא',
    'notFound.message': 'נראה שהעמוד שחיפשתם לא קיים או שהוסר.',
    'notFound.cta': 'חזרה לדף הבית',
  },
  en: {
    // Header
    'nav.about': 'About',
    'nav.values': 'Values',
    'nav.portfolio': 'Portfolio',
    'nav.videos': 'Videos',
    'nav.contact': 'Contact',
    'nav.cta': 'Get a Quote',
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.blog': 'Articles',

    // Hero
    'hero.headline': 'Crafting Digital Experiences That Inspire Confidence',
    'hero.subheadline': 'Luxury Tech builds premium websites, mobile apps, and management systems for brands that want to stand out',
    'hero.cta': 'Talk to Us',
    
    // About
    'about.title': 'Who We Are',
    'about.description': "We're a team of developers and designers delivering fast, secure web solutions: websites, mobile applications, e-commerce, and enterprise systems.",
    'about.cap1': 'Websites & Mobile Apps',
    'about.cap2': 'Smart Admin Systems',
    'about.cap3': 'Premium E-commerce',
    'about.cap4': 'Leading Security & Speed',
    
    // Values
    'values.title': 'Our Values',
    'values.innovation': 'Innovation',
    'values.innovation.desc': 'Always one step ahead with cutting-edge technologies and creative solutions',
    'values.transparency': 'Transparency',
    'values.transparency.desc': 'Clear and open communication throughout every project phase',
    'values.excellence': 'Excellence',
    'values.excellence.desc': 'Commitment to the highest quality in every detail',
    'values.partnership': 'Partnership',
    'values.partnership.desc': 'Working together to achieve your business goals',
    
    // Portfolio
    'portfolio.title': 'Our Work at a Glance',
    'portfolio.filter.all': 'All',
    'portfolio.filter.ecommerce': 'E-commerce',
    'portfolio.filter.admin': 'Admin',
    'portfolio.filter.corporate': 'Corporate',
    'portfolio.view': 'View Case',
    'portfolio.close': 'Close',
    'portfolio.videoSoon': 'Video coming soon',
    
    // Videos
    'videos.title': 'Latest Videos',
    'videos.showreel': 'Featured Showreel',
    
    // Contact
    'contact.title': 'Let\'s Build Something Exceptional',
    'contact.subtitle': 'Tell us about your project and we\'ll get back to you soon',
    'contact.name': 'Full Name',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.projectType': 'Project Type',
    'contact.projectType.ecommerce': 'E-commerce',
    'contact.projectType.admin': 'Admin System',
    'contact.projectType.corporate': 'Corporate Site',
    'contact.projectType.other': 'Other',
    'contact.message': 'Tell us about your project',
    'contact.submit': 'Send Message',
    'contact.thanks': 'Thank you! We\'ll be in touch soon',
    'contact.whatsapp': 'Or reach us on WhatsApp',
    
    // Footer
    'footer.tagline': 'Crafting digital experiences that inspire confidence',
    'footer.links': 'Links',
    'footer.contact': 'Contact',
    'footer.follow': 'Follow Us',
    'footer.rights': '© 2025 Luxury Tech. All rights reserved.',
    
    // WhatsApp
    'whatsapp.tooltip': 'Chat with us on WhatsApp',
    'whatsapp.message': 'Hi, I saw Luxury Tech and I am interested in a website.',

    // Home (new)
    'home.services.title': 'What We Do',
    'home.services.subtitle': 'The core disciplines that help your business grow with confidence',
    'home.services.viewAll': 'View All Services',
    'home.portfolio.title': 'Featured Work',
    'home.portfolio.viewAll': 'View All Projects',
    'home.contact.title': 'Let\'s Build Something Exceptional',
    'home.contact.subtitle': 'Tell us about your project and we\'ll get back to you soon',
    'home.contact.cta': 'Go to Contact Page',

    // Services (page-level, new)
    'services.pageTitle': 'Our Services',
    'services.pageSubtitle': 'End-to-end technology solutions, tailored to your business',
    'services.learnMore': 'Learn More',
    'services.backToServices': 'Back to Services',
    'services.whatsIncluded': "What's Included",
    'services.ourProcess': 'Our Process',
    'services.relatedWork': 'Examples of Our Work',
    'services.ctaTitle': 'Ready to Start a Project?',
    'services.ctaSubtitle': "Tell us what you need and we'll design the right solution together",
    'services.ctaButton': 'Talk to Us',

    // Portfolio (page-level, new)
    'portfolio.pageTitle': 'Our Projects',
    'portfolio.pageSubtitle': 'A selection of work delivered for clients and ventures across industries',
    'portfolio.concept': 'Concept Work',
    'portfolio.videoDemo': 'Video System Demo',
    'portfolio.filter.crm': 'CRM & Business Management',
    'portfolio.filter.systemModernization': 'System Modernization',
    'portfolio.filter.digitalStores': 'Digital Stores',
    'portfolio.filter.landingPages': 'Landing & Corporate Sites',

    // Blog (new)
    'blog.pageTitle': 'Articles & Insights',
    'blog.pageSubtitle': 'Insights, guides, and trends from the world of software and digital business',
    'blog.readMore': 'Read More',
    'blog.backToBlog': 'Back to Articles',
    'blog.minRead': 'min read',
    'blog.relatedArticles': 'More Articles',
    'blog.notFound': 'Article not found',
    'blog.category.general': 'General Insights',

    // About (page-level, new)
    'about.story.title': 'Our Story',
    'about.story.p1': "Luxury Tech was founded on a simple belief: small and mid-sized businesses deserve the same level of technology that powers giant companies — without the price tag or bureaucracy.",
    'about.story.p2': "We started as a small team of developers and designers, and over the years we've built dozens of systems, stores, and websites for clients in Israel and beyond. Every project teaches us something we bring to the next one.",
    'about.story.p3': 'Today we combine development, design, and strategy under one roof, so every client gets a complete solution — not just code.',
    'about.process.title': 'How We Work',
    'about.process.subtitle': 'A clear, transparent process from idea to launch',
    'about.process.step1.title': 'Discovery & Scoping',
    'about.process.step1.desc': 'We learn your business, goals, and challenges, and define the project scope together.',
    'about.process.step2.title': 'Design & Prototype',
    'about.process.step2.desc': 'We craft UX and visuals that reflect your brand before a single line of code.',
    'about.process.step3.title': 'Development & Testing',
    'about.process.step3.desc': 'Modular development, continuous testing, and regular progress updates.',
    'about.process.step4.title': 'Launch & Support',
    'about.process.step4.desc': "We go live, stay close, and support any question or change after launch too.",
    'about.stats.projects': 'Projects Completed',
    'about.stats.years': 'Combined Years of Experience',
    'about.stats.satisfaction': 'Client Satisfaction',
    'about.cta.title': "Let's Talk",
    'about.cta.subtitle': "We'd love to hear about your business and see how we can help",
    'about.cta.button': 'Contact Us',

    // Contact (page-level, new)
    'contact.pageSubtitle': "The fastest way to reach us is WhatsApp — we'll reply the same day",
    'contact.info.title': 'Contact Details',
    'contact.info.phone': 'Phone',
    'contact.info.email': 'Email',
    'contact.info.hours': 'Business Hours',
    'contact.info.hoursValue': 'Sun–Thu, 9:00 AM–6:00 PM',
    'contact.whatsapp.title': 'Chat with Us on WhatsApp',
    'contact.whatsapp.desc': "The fastest way to get a response. Send a message and we'll get back to you shortly.",
    'contact.social.title': 'Follow Us',

    // 404 (new)
    'notFound.title': 'Page Not Found',
    'notFound.message': "The page you're looking for doesn't exist or has been moved.",
    'notFound.cta': 'Back to Home',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('luxurytech-language');
    return (saved as Language) || 'he';
  });

  useEffect(() => {
    localStorage.setItem('luxurytech-language', language);
    
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'he' ? 'en' : 'he');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.he] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
