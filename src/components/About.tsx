import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react';

export const About = () => {
  const { t } = useLanguage();

  const capabilities = [
    t('about.cap1'),
    t('about.cap2'),
    t('about.cap3'),
    t('about.cap4'),
  ];

  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
            <span className="text-gradient-gold">{t('about.title')}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 text-center leading-relaxed">
            {t('about.description')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border hover-lift"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="text-accent" size={16} />
                </div>
                <p className="text-lg text-foreground">{capability}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
