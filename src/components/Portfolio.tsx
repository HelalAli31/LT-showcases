import { useLanguage } from "@/contexts/LanguageContext";
import { useState, MouseEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
const helalImg = "/assets/hero-BujqUG72.jpg";
import type { ServiceSlug } from "@/data/services";

type ProjectCategory = "all" | ServiceSlug;

interface Project {
  id: number;
  title: { he: string; en: string };
  description: { he: string; en: string };
  category: ServiceSlug;
  tags: string[];
  image: string; // card thumbnail
  dialogImage: string; // big image in dialog (replace per project)
  video?: string; // local mp4 path — when set, dialog plays this instead of showing dialogImage
  siteUrl?: string;
  isConcept?: boolean;
  fullDescription: { he: string; en: string };
}

// ====== IMAGES (REPLACE THESE ANYTIME) ======
// You can replace with:
// 1) local imports: import img1 from "@/assets/portfolio/x.jpg";
// 2) Cloudinary image URLs
// 3) any CDN URL
const IMAGES = {
  brand1:
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80&auto=format&fit=crop",
  brand2:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80&auto=format&fit=crop",
  gym: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format&fit=crop",
  restaurant:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80&auto=format&fit=crop",
  nova: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1600&q=80&auto=format&fit=crop",
  luxury:
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=80&auto=format&fit=crop",
  perfect: helalImg,
};

// Real system-demo videos (compressed, served from /public/videos)
const VIDEOS = {
  luxurytech: {
    src: "/videos/luxurytech-system.mp4",
    poster: "/videos/luxurytech-system-poster.jpg",
  },
  royalGroup: {
    src: "/videos/royal-group-system.mp4",
    poster: "/videos/royal-group-system-poster.jpg",
  },
  accounting: {
    src: "/videos/accounting-system.mp4",
    poster: "/videos/accounting-system-poster.jpg",
  },
  meizaStore: {
    src: "/videos/meiza-store.mp4",
    poster: "/videos/meiza-store-poster.jpg",
  },
  lordStore: {
    src: "/videos/lord-store.mp4",
    poster: "/videos/lord-store-poster.jpg",
  },
};

// ==== PROJECT DATA ====
// NOTE: dialogImage is the one shown in the popup (big).
// Ordered by category: CRM & business management, then digital stores, then landing pages / corporate sites.
const projects: Project[] = [
  // Real system demos — screen recordings of systems we built, not public client sites
  {
    id: 501,
    title: {
      he: "LuxuryTech CRM — מערכת ניהול לקוחות פנימית",
      en: "LuxuryTech CRM — Internal Customer Management System",
    },
    description: {
      he: "מערכת ה-CRM הפנימית שלנו: לידים, צנרת מכירות ותשלומים במקום אחד.",
      en: "Our own internal CRM: leads, sales pipeline, and payments in one place.",
    },
    category: "crm",
    tags: ["CRM", "Dashboard", "Video"],
    image: VIDEOS.luxurytech.poster,
    dialogImage: VIDEOS.luxurytech.poster,
    video: VIDEOS.luxurytech.src,
    fullDescription: {
      he: "הדגמת וידאו של מערכת ה-CRM שבנינו לשימוש הפנימי שלנו: מעקב לידים, צנרת עסקאות, משימות ותשלומים — כל מה שצריך כדי לנהל את מחזור המכירות מקצה לקצה.",
      en: "A video walkthrough of the CRM system we built for our own internal use: lead tracking, deal pipeline, tasks, and payments — everything needed to manage the sales cycle end to end.",
    },
  },
  {
    id: 502,
    title: {
      he: "Royal CMS Group — מערכת ניהול נכסים ולידים",
      en: "Royal CMS Group — Real Estate & Leads Management System",
    },
    description: {
      he: 'מערכת ניהול פנימית ללקוח בתחום הנדל"ן: נכסים, לידים ומכירות.',
      en: "Internal management system for a real-estate client: assets, leads, and sales.",
    },
    category: "crm",
    tags: ["Business Management", "Real Estate", "Video"],
    image: VIDEOS.royalGroup.poster,
    dialogImage: VIDEOS.royalGroup.poster,
    video: VIDEOS.royalGroup.src,
    fullDescription: {
      he: 'הדגמת וידאו של מערכת ניהול עסקית שבנינו עבור קבוצת נדל"ן: מעקב נכסים, ניהול לידים ועובדים, ודוחות מכירות חודשיים בזמן אמת.',
      en: "A video walkthrough of a business management system we built for a real-estate group: asset tracking, lead and staff management, and real-time monthly sales reports.",
    },
  },
  {
    id: 503,
    title: {
      he: "מערכת ניהול הנהלת חשבונות",
      en: "Accounting Management System",
    },
    description: {
      he: "לוח בקרה פיננסי: הכנסות, הוצאות ותזרים מזומנים בזמן אמת.",
      en: "A financial dashboard: income, expenses, and cash flow in real time.",
    },
    category: "crm",
    tags: ["Business Management", "Finance", "Video"],
    image: VIDEOS.accounting.poster,
    dialogImage: VIDEOS.accounting.poster,
    video: VIDEOS.accounting.src,
    fullDescription: {
      he: "הדגמת וידאו של מערכת ניהול הנהלת חשבונות בהתאמה אישית: מעקב הכנסות והוצאות, פילוח לפי מקור, ותרשימי תזרים מזומנים חודשיים.",
      en: "A video walkthrough of a custom accounting management system: income and expense tracking, source breakdowns, and monthly cash-flow charts.",
    },
  },
  {
    id: 400,
    title: { he: "RiseFitness — מועדון כושר", en: "RiseFitness — Gym" },
    description: {
      he: "הצגה של המתקנים, האימונים והאווירה.",
      en: "Showcasing facilities, training, and vibe.",
    },
    category: "landing-pages",
    tags: ["Corporate Site", "Fitness"],
    image: IMAGES.gym,
    dialogImage: IMAGES.gym,
    siteUrl: "https://www.raisesfitness.com/",
    fullDescription: {
      he: "דגש על אנרגיה, אמינות ומיתוג מועדון מודרני.",
      en: "Focus on energy, trust, and modern gym branding.",
    },
  },
  {
    id: 401,
    title: {
      he: "Lord Brands — חנות אופנת גברים",
      en: "Lord Brands — Men's Fashion Store",
    },
    description: {
      he: "חנות אונליין לבגדי גברים פרימיום עם קטגוריות מוצרים ומותגים מובילים.",
      en: "An online store for premium men's clothing with product categories and leading brands.",
    },
    category: "digital-stores",
    tags: ["Store", "Fashion", "Video"],
    image: VIDEOS.lordStore.poster,
    dialogImage: VIDEOS.lordStore.poster,
    video: VIDEOS.lordStore.src,
    fullDescription: {
      he: "הדגמת וידאו של חנות אופנת גברים: עיצוב פרימיום כהה-זהוב, ניווט לפי קטגוריות ומותגים, וחוויית קנייה חלקה.",
      en: "A video walkthrough of a men's fashion store: premium dark-gold design, category and brand navigation, and a smooth shopping experience.",
    },
  },
  {
    id: 402,
    title: {
      he: "MEIZA HERITAGE — חנות פרימיום",
      en: "MEIZA HERITAGE — Premium Store",
    },
    description: {
      he: "אתר יוקרתי לעיצוב הבית עם חוויית קנייה חלקה.",
      en: "Premium home-decor store with smooth shopping.",
    },
    category: "digital-stores",
    tags: ["Store", "Premium", "Video"],
    image: VIDEOS.meizaStore.poster,
    dialogImage: VIDEOS.meizaStore.poster,
    video: VIDEOS.meizaStore.src,
    fullDescription: {
      he: "הדגמת וידאו של החנות: עיצוב יוקרתי לעיצוב הבית, גלריות מעודנות ואופטימיזציה למובייל.",
      en: "A video walkthrough of the store: premium home-decor design, refined galleries, and mobile optimization.",
    },
  },
  {
    id: 403,
    title: { he: "Luxury Skin — קוסמטיקה", en: "Luxury Skin — Cosmetics" },
    description: {
      he: "חנות טיפוח עם דפי מוצר מפורטים.",
      en: "Skincare store with rich product pages.",
    },
    category: "digital-stores",
    tags: ["Store", "Beauty"],
    image: IMAGES.luxury,
    dialogImage: IMAGES.luxury,
    siteUrl: "https://amanda-line.vercel.app/",
    fullDescription: {
      he: "סקירות רכיבים, המלצות ומערכת חוות דעת.",
      en: "Ingredient breakdowns, recommendations, reviews.",
    },
  },

  {
    id: 404,
    title: { he: "perfect wrap", en: "perfect wrap" },
    description: {
      he: "חנות אריזות ומתנות פרימיום שלך",
      en: "Your premium gift wrapping and packaging store.",
    },
    category: "digital-stores",
    tags: ["Store"],
    image: IMAGES.perfect,
    dialogImage: helalImg,
    siteUrl: "https://www.perfectwrap2021.com/",
    fullDescription: {
      he: "חנות אריזות ומתנות פרימיום המתמחה בעיצוב אריזות יוקרתיות, מארזים מותאמים אישית וחוויית מתנה בלתי נשכחת. שילוב של סטייל, איכות וירידה לפרטים הקטנים.",
      en: "A premium gift wrapping and packaging store specializing in luxury designs, custom gift boxes, and unforgettable gifting experiences. A blend of style, quality, and meticulous attention to detail.",
    },
  },
  {
    id: 405,
    title: { he: "NovaStore — חנות אונליין", en: "NovaStore — Online Shop" },
    description: {
      he: "חנות אלקטרוניקה עם תשלומים מאובטחים ומלאי חכם.",
      en: "Electronics store with secure payments and smart inventory.",
    },
    category: "digital-stores",
    tags: ["Store", "E-commerce", "Payments"],
    image: IMAGES.nova,
    dialogImage: IMAGES.nova,
    siteUrl: "https://nova-store-mauve.vercel.app",
    fullDescription: {
      he: "קטלוג דינמי, סינון לפי קטגוריות וקופה מהירה.",
      en: "Dynamic catalog, filters, fast checkout.",
    },
  },
  {
    id: 406,
    title: {
      he: "The Fog Bank — חנות מוצרי אידוי",
      en: "The Fog Bank — Vape Store",
    },
    description: {
      he: "חנות אונליין רב-סניפית למוצרי אידוי, עם קטלוג מוצרים וניהול הזמנות.",
      en: "A multi-branch online store for vaping products, with a product catalog and order management.",
    },
    category: "digital-stores",
    tags: ["Store", "E-commerce"],
    image: "/portfolio/fogbank.jpg",
    dialogImage: "/portfolio/fogbank.jpg",
    siteUrl: "https://thefogbank.online",
    fullDescription: {
      he: "חנות אונליין לרשת סניפים המוכרת מוצרי אידוי: קטלוג קטגוריות, עגלת קניות, ופרטי יצירת קשר לכל אחד מהסניפים.",
      en: "An online store for a multi-branch retail chain selling vaping products: category catalog, shopping cart, and contact details for each branch location.",
    },
  },
  {
    id: 101,
    title: {
      he: "جمعية الوفاء — תדמית",
      en: "Al-Wafaa Association — Branding",
    },
    description: {
      he: "תדמית המציגה את פעילות העמותה וההשפעה שלה בקהילה.",
      en: "Brand piece showing the association's community impact.",
    },
    category: "landing-pages",
    tags: ["Corporate Site", "Branding"],
    image: IMAGES.brand1,
    dialogImage: IMAGES.brand1,
    siteUrl: "https://wafaa-amal-baqa.vercel.app",
    fullDescription: {
      he: "עיצוב והצגה ויזואלית מלאה: מסרים, סגנון ומיתוג אחיד.",
      en: "Full visual branding: messaging, style, and consistent identity.",
    },
  },
  {
    id: 102,
    title: {
      he: "מו.על – עבודות גמר איכותיות",
      en: "Mo.Al — Premium Final Works",
    },
    description: {
      he: "עבודות גמר ברמה הגבוהה ביותר. ריצוף, שיפוצים וצבע.",
      en: "Top-tier finishing works. Tiling, renovations, painting.",
    },
    category: "landing-pages",
    tags: ["Corporate Site", "Construction"],
    image: IMAGES.brand2,
    dialogImage: IMAGES.brand2,
    siteUrl: "https://v0-tiling-project.vercel.app/",
    fullDescription: {
      he: "תצוגה מקצועית של פרויקטים, תהליך עבודה ותוצאות.",
      en: "Professional showcase of projects, process, and results.",
    },
  },

  {
    id: 301,
    title: { he: "מסעדת טעמים — מסעדה", en: "Matam Taamim — Restaurant" },
    description: {
      he: "הצגה של אווירה, מנות וחוויית שירות.",
      en: "Atmosphere, dishes, and service experience.",
    },
    category: "landing-pages",
    tags: ["Corporate Site", "Food"],
    image: IMAGES.restaurant,
    dialogImage: IMAGES.restaurant,
    siteUrl: "https://resturant-lemon-iota.vercel.app",
    fullDescription: {
      he: "שפה ויזואלית חמה, מיקוד במנות ובסטייל.",
      en: "Warm visual language focused on dishes and style.",
    },
  },
];

interface PortfolioProps {
  limit?: number;
  showFilters?: boolean;
  showHeading?: boolean;
  heading?: string;
  sectionId?: string;
  featuredIds?: number[];
}

export const Portfolio = ({
  limit,
  showFilters = true,
  showHeading = true,
  heading,
  sectionId = "portfolio",
  featuredIds,
}: PortfolioProps = {}) => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filters: { key: ProjectCategory; label: string }[] = [
    { key: "all", label: t("portfolio.filter.all") },
    { key: "crm", label: t("portfolio.filter.crm") },
    { key: "digital-stores", label: t("portfolio.filter.digitalStores") },
    { key: "landing-pages", label: t("portfolio.filter.landingPages") },
  ];

  const filtered = featuredIds
    ? (featuredIds
        .map((id) => projects.find((p) => p.id === id))
        .filter(Boolean) as Project[])
    : filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  const onVisitClick = (e: MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id={sectionId} className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {showHeading && (
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            <span className="text-gradient-gold">
              {heading ?? t("portfolio.title")}
            </span>
          </h2>
        )}

        {showFilters && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {filters.map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
                className={
                  filter === key ? "bg-accent text-accent-foreground" : ""
                }
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl overflow-hidden bg-background border border-border hover-lift hover-glow"
              onClick={() => setSelectedProject(project)}
              role="button"
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={project.image}
                  alt={project.title[language]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {project.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="text-accent-foreground" size={24} />
                    </div>
                  </div>
                )}
                {project.isConcept && (
                  <Badge className="absolute top-3 ltr:right-3 rtl:left-3 bg-background/90 text-accent border border-accent/40">
                    {t("portfolio.concept")}
                  </Badge>
                )}
                {project.video && (
                  <Badge className="absolute top-3 ltr:right-3 rtl:left-3 bg-background/90 text-accent border border-accent/40">
                    {t("portfolio.videoDemo")}
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {project.title[language]}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {project.description[language]}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-accent/50 text-accent"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedProject(project)}
                  >
                    {language === "he" ? "צפייה" : "View"}
                  </Button>

                  {project.siteUrl && project.siteUrl !== "#" && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => onVisitClick(e, project.siteUrl)}
                      title={project.siteUrl}
                    >
                      <ExternalLink size={16} />
                      {language === "he" ? "לביקור באתר" : "Visit Site"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent className="max-w-5xl p-0 overflow-hidden">
            {selectedProject && (
              <div className="space-y-0">
                <div className="aspect-video bg-black">
                  {selectedProject.video ? (
                    <video
                      key={selectedProject.video}
                      src={selectedProject.video}
                      poster={selectedProject.dialogImage}
                      controls
                      autoPlay
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={selectedProject.dialogImage}
                      alt={selectedProject.title[language]}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      {selectedProject.title[language]}
                    </h3>

                    {selectedProject.siteUrl &&
                      selectedProject.siteUrl !== "#" && (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={(e) =>
                            onVisitClick(
                              e as unknown as MouseEvent,
                              selectedProject.siteUrl,
                            )
                          }
                        >
                          <ExternalLink size={16} />
                          {language === "he" ? "לביקור באתר" : "Visit Site"}
                        </Button>
                      )}
                  </div>

                  {selectedProject.isConcept && (
                    <Badge className="mt-3 bg-accent/10 text-accent border border-accent/40">
                      {t("portfolio.concept")}
                    </Badge>
                  )}
                  {selectedProject.video && (
                    <Badge className="mt-3 bg-accent/10 text-accent border border-accent/40">
                      {t("portfolio.videoDemo")}
                    </Badge>
                  )}

                  <p className="text-muted-foreground mt-3 mb-4">
                    {selectedProject.fullDescription[language]}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-accent/50 text-accent"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export { projects };
export type { Project, ProjectCategory };
