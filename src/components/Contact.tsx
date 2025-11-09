import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const Contact = () => {
  const { language, t } = useLanguage();

  const message =
    language === 'he'
      ? 'שלום! אני מעוניין בפרויקט חדש, אשמח לשוחח 🙂'
      : 'Hello! I’m interested in starting a new project.';

  const whatsappUrl = `https://wa.me/972549598571?text=${encodeURIComponent(message)}`;

  return (
    <section id="contact" className="py-24 bg-card text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient-gold">{t('contact.title')}</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12">{t('contact.subtitle')}</p>

        <Button
          asChild
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow text-lg px-10 py-6"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            {language === 'he' ? 'דברו איתנו בוואטסאפ' : 'Chat on WhatsApp'}
          </a>
        </Button>
      </div>
    </section>
  );
};
