import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play } from 'lucide-react';

interface Video {
  id: string;
  title: { he: string; en: string };
  description: { he: string; en: string };
  thumbnail: string;
  embedUrl: string;
}

const videos: Video[] = [
  {
    id: '1',
    title: { he: 'איך בנינו חנות תכשיטים מקוונת', en: 'Building a Luxury Jewelry E-commerce' },
    description: { he: 'תהליך הפיתוח המלא של חנות תכשיטים מקוונת', en: 'Full development process of a jewelry e-commerce site' },
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: { he: 'מערכת CRM - מבט מאחורי הקלעים', en: 'CRM System - Behind the Scenes' },
    description: { he: 'הצצה למערכת ניהול לקוחות מתקדמת', en: 'Inside look at advanced customer management system' },
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: { he: 'עיצוב חווית משתמש מושלמת', en: 'Designing Perfect User Experience' },
    description: { he: 'העקרונות שלנו לעיצוב UX/UI', en: 'Our principles for UX/UI design' },
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: { he: 'אופטימיזציה לביצועים מקסימליים', en: 'Optimization for Maximum Performance' },
    description: { he: 'כיצד אנו משיגים מהירות וביצועים מעולים', en: 'How we achieve excellent speed and performance' },
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '5',
    title: { he: 'אבטחה ופרטיות במיטבם', en: 'Security and Privacy at Their Best' },
    description: { he: 'הגישה שלנו לאבטחת אתרים', en: 'Our approach to website security' },
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '6',
    title: { he: 'מובייל-פירסט: העתיד של הווב', en: 'Mobile-First: The Future of Web' },
    description: { he: 'למה מובייל-פירסט חיוני היום', en: 'Why mobile-first is essential today' },
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export const Videos = () => {
  const { language, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <section id="videos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="text-gradient-gold">{t('videos.title')}</span>
        </h2>

        {/* Featured Showreel */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">{t('videos.showreel')}</h3>
          <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border hover-glow">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Luxury Tech Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>

        {/* Video Gallery */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border hover-lift hover-glow"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title[language]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                    <Play className="text-accent-foreground" size={32} />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 text-foreground">{video.title[language]}</h3>
                <p className="text-sm text-muted-foreground">{video.description[language]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Lightbox Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-5xl p-0">
            {selectedVideo && (
              <div className="aspect-video">
                <iframe
                  src={selectedVideo.embedUrl}
                  title={selectedVideo.title[language]}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
