import { useLanguage } from '@/contexts/LanguageContext';
import { useState, MouseEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink } from 'lucide-react';

// categories
type ProjectCategory = 'all' | 'stores' | 'branding' | 'gym' | 'restaurant';

interface Project {
  id: number;
  title: { he: string; en: string };
  description: { he: string; en: string };
  category: ProjectCategory;
  tags: string[];
  image: string;          // poster/thumbnail URL
  videoUrl?: string;      // Cloudinary mp4 URL for dialog playback
  siteUrl?: string;       // external live site/demo link
  fullDescription: { he: string; en: string };
}

// ==== VIDEO LINKS (Cloudinary) ====
const vidGym =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762677330/Rise_Fitness_-_Google_Chrome_2025-11-09_10-30-14_kwdhlp.mp4';
const vidRestaurant =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674828/matam-taamim_zbliwy.mp4';
const vidNovaStore =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674807/novastore_fbm10j.mp4';
const vidBrand1 =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674740/jam3yat-alwafa_cc4xlp.mp4';
const vidLuxurySkin =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674719/luxury-skin_hhj5mj.mp4';
const vidMeiza =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674545/meiza-heritage_ofx23x.mp4';
const vidBrand2 =
  'https://res.cloudinary.com/dvvjwfflc/video/upload/v1762674485/graduation-works_wwrqw3.mp4';

// Posters (external). Replace anytime.
const POSTERS = {
  brand1:
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80&auto=format&fit=crop',
  brand2:
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80&auto=format&fit=crop',
  gym:
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format&fit=crop',
  restaurant:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80&auto=format&fit=crop',
  nova:
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1600&q=80&auto=format&fit=crop',
  meiza:
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=1600&q=80&auto=format&fit=crop',
  luxury:
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=80&auto=format&fit=crop',
};

// ==== PROJECT DATA ====
const projects: Project[] = [
    {
    id: 402,
    title: { he: 'MEIZA HERITAGE — חנות פרימיום', en: 'MEIZA HERITAGE — Premium Store' },
    description: {
      he: 'אתר יוקרתי לעיצוב הבית עם חוויית קנייה חלקה.',
      en: 'Premium home-decor store with smooth shopping.',
    },
    category: 'stores',
    tags: ['Store', 'Premium', 'UX'],
    image: POSTERS.meiza,
    videoUrl: vidMeiza,
    siteUrl: '#',
    fullDescription: {
      he: 'עיצוב שחור-זהב, גלריות מעודנות ואופטימיזציה למובייל.',
      en: 'Black-gold design, refined galleries, mobile-optimized.',
    },
  },
  {
    id: 403,
    title: { he: 'Luxury Skin — קוסמטיקה', en: 'Luxury Skin — Cosmetics' },
    description: {
      he: 'חנות טיפוח עם סרטוני הדגמה ודפי מוצר מפורטים.',
      en: 'Skincare store with product videos and rich PDPs.',
    },
    category: 'stores',
    tags: ['Store', 'Beauty', 'Video'],
    image: POSTERS.luxury,
    videoUrl: vidLuxurySkin,
    siteUrl: '#',
    fullDescription: {
      he: 'סקירות רכיבים, המלצות ומערכת חוות דעת.',
      en: 'Ingredient breakdowns, recommendations, reviews.',
    },
  },
    // Gym
  {
    id: 201,
    title: { he: 'RiseFitness — סרט מועדון כושר', en: 'RiseFitness — Gym Promo' },
    description: {
      he: 'וידאו המציג את המתקנים, האימונים והאווירה.',
      en: 'Video showcasing facilities, training, and vibe.',
    },
    category: 'gym',
    tags: ['Fitness', 'Promo', 'Video'],
    image: POSTERS.gym,
    videoUrl: vidGym,
    siteUrl: 'https://www.raisesfitness.com/',
    fullDescription: {
      he: 'צילום מרובה זוויות, קצב מהיר וגרפיקת לוגו.',
      en: 'Multi-angle footage, fast pacing, branded graphics.',
    },
  },

    // Restaurant
  {
    id: 301,
    title: { he: 'מסעדת טעמים — סרט מסעדה', en: 'Matam Taamim — Restaurant Video' },
    description: {
      he: 'וידאו שמציג אווירה, מנות וחוויית שירות.',
      en: 'Atmospheric video highlighting dishes and service.',
    },
    category: 'restaurant',
    tags: ['Food', 'Promo', 'Video'],
    image: POSTERS.restaurant,
    videoUrl: vidRestaurant,
    siteUrl: 'https://resturant-lemon-iota.vercel.app',
    fullDescription: {
      he: 'צילום מנות בתקריב, תאורה חמה והצגת סיפור קולינרי.',
      en: 'Close-up dishes, warm lighting, storytelling.',
    },
  },
  // Branding
  {
    id: 101,
    title: { he: 'جمعية الوفاء — סרט תדמית', en: 'Al-Wafaa Association — Branding Video' },
    description: {
      he: 'סרט תדמית המציג את פעילות העמותה וההשפעה שלה בקהילה.',
      en: 'Brand film showing the association’s community impact.',
    },
    category: 'branding',
    tags: ['Branding', 'Video', 'Story'],
    image: POSTERS.brand1,
    videoUrl: vidBrand1,
    siteUrl: 'https://wafaa-amal-baqa.vercel.app',
    fullDescription: {
      he: 'הפקת וידאו תדמיתית מלאה: תסריט, צילום, עריכה וגרפיקות מותאמות.',
      en: 'Full branding video production including script, shoot, and edit.',
    },
  },
  {
    id: 102,
    title: { he: 'מו.על – עבודות גמר איכותיות', en: 'Mo.Al — Premium Final Works' },
    description: {
      he: 'עבודות גמר ברמה הגבוהה ביותר. ריצוף, שיפוצים וצבע — איכות, אמינות וגימור ללא פשרות.',
      en: 'Top-tier finishing works. Tiling, renovations, painting — quality and flawless finish.',
    },
    category: 'branding',
    tags: ['Showreel', 'Construction', 'Branding'],
    image: POSTERS.brand2,
    videoUrl: vidBrand2,
    siteUrl: 'https://v0-tiling-project.vercel.app/',
    fullDescription: {
      he: 'תיעוד מקצועי של לפני/אחרי, תהליכי עבודה, ותוצאות מדויקות לפי תוכנית.',
      en: 'Professional before/after, workflow coverage, and precise results.',
    },
  },





  // Stores
  {
    id: 401,
    title: { he: 'NovaStore — חנות אונליין', en: 'NovaStore — Online Shop' },
    description: {
      he: 'חנות אלקטרוניקה עם תשלומים מאובטחים ומלאי חכם.',
      en: 'Electronics store with secure payments and smart inventory.',
    },
    category: 'stores',
    tags: ['Store', 'E-commerce', 'Payments'],
    image: POSTERS.nova,
    videoUrl: vidNovaStore,
    siteUrl: 'https://nova-store-mauve.vercel.app',
    fullDescription: {
      he: 'קטלוג דינמי, סינון לפי קטגוריות וקופה מהירה.',
      en: 'Dynamic catalog, filters, fast checkout.',
    },
  },

];

export const Portfolio = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<ProjectCategory>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // i18n with fallback
  const label = (key: string, he: string, en: string) => {
    const k = `portfolio.filter.${key}`;
    const v = t(k);
    return v !== k ? v : language === 'he' ? he : en;
    };

  const filters: { key: ProjectCategory; label: string }[] = [
    { key: 'all',        label: label('all',        'הכל',         'All') },
    { key: 'stores',     label: label('stores',     'חנויות',       'Stores') },
    { key: 'branding',   label: label('branding',   'תדמית',       'Branding') },
    { key: 'gym',        label: label('gym',        'מכון כושר',   'Gym') },
    { key: 'restaurant', label: label('restaurant', 'מסעדה',       'Restaurant') },
  ];

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  const onVisitClick = (e: MouseEvent, url?: string) => {
    e.stopPropagation(); // do not open the dialog
    if (!url || url === '#') return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="portfolio" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="text-gradient-gold">{t('portfolio.title')}</span>
        </h2>

        {/* <div className="flex flex-wrap justify-center gap-3 mb-16">
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              className={filter === key ? 'bg-accent text-accent-foreground' : ''}
            >
              {label}
            </Button>
          ))}
        </div> */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project) => (
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
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                    <Play className="text-accent-foreground" size={32} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">{project.title[language]}</h3>
                <p className="text-muted-foreground mb-4">{project.description[language]}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-accent/50 text-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setSelectedProject(project)}>
                    {language === 'he' ? 'צפייה בווידאו' : 'Watch Video'}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={(e) => onVisitClick(e, project.siteUrl)}
                    disabled={!project.siteUrl || project.siteUrl === '#'}
                    title={
                      !project.siteUrl || project.siteUrl === '#'
                        ? language === 'he' ? 'קישור יתווסף בהמשך' : 'Link coming soon'
                        : project.siteUrl
                    }
                  >
                    <ExternalLink size={16} />
                    {language === 'he' ? 'לביקור באתר' : 'Visit Site'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-5xl p-0">
            {selectedProject && (
              <div className="space-y-0">
                <div className="aspect-video bg-black">
                  {selectedProject.videoUrl ? (
                    <video
                      src={selectedProject.videoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                      playsInline
                      poster={selectedProject.image}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Play size={64} className="mx-auto mb-4 opacity-50" />
                        <p>{t('portfolio.videoSoon') || (language === 'he' ? 'וידאו יתווסף בקרוב' : 'Video coming soon')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      {selectedProject.title[language]}
                    </h3>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={(e) => onVisitClick(e as unknown as MouseEvent, selectedProject.siteUrl)}
                      disabled={!selectedProject.siteUrl || selectedProject.siteUrl === '#'}
                    >
                      <ExternalLink size={16} />
                      {language === 'he' ? 'לביקור באתר' : 'Visit Site'}
                    </Button>
                  </div>

                  <p className="text-muted-foreground mt-3 mb-4">
                    {selectedProject.fullDescription[language]}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="border-accent/50 text-accent">
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
