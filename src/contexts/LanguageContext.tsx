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
    'portfolio.title': 'הפרויקטים שלנו',
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
  },
  en: {
    // Header
    'nav.about': 'About',
    'nav.values': 'Values',
    'nav.portfolio': 'Portfolio',
    'nav.videos': 'Videos',
    'nav.contact': 'Contact',
    'nav.cta': 'Get a Quote',
    
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
