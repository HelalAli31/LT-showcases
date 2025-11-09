import { useLanguage } from '@/contexts/LanguageContext';
import { Lightbulb, Eye, Award, Handshake } from 'lucide-react';

export const Values = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Lightbulb,
      title: t('values.innovation'),
      description: t('values.innovation.desc'),
    },
    {
      icon: Eye,
      title: t('values.transparency'),
      description: t('values.transparency.desc'),
    },
    {
      icon: Award,
      title: t('values.excellence'),
      description: t('values.excellence.desc'),
    },
    {
      icon: Handshake,
      title: t('values.partnership'),
      description: t('values.partnership.desc'),
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="text-gradient-gold">{t('values.title')}</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-xl bg-card border border-border hover-lift hover-glow text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Icon className="text-accent" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
