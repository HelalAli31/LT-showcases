import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-foreground">Luxury</span>
              <span className="text-gradient-gold">Tech</span>
            </div>
            <p className="text-muted-foreground">{t('footer.tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-foreground">{t('footer.links')}</h4>
            <nav className="space-y-2">
              <Link to="/services" className="block text-muted-foreground hover:text-accent transition-colors">
                {t('nav.services')}
              </Link>
              <Link to="/portfolio" className="block text-muted-foreground hover:text-accent transition-colors">
                {t('nav.portfolio')}
              </Link>
              <Link to="/blog" className="block text-muted-foreground hover:text-accent transition-colors">
                {t('nav.blog')}
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-accent transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-accent transition-colors">
                {t('nav.contact')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-foreground">{t('footer.contact')}</h4>
            <div className="space-y-2 text-muted-foreground">
              <p>054-959-8571</p>
              <p>luxurytech30@gmail.com</p>
            </div>
          </div>

          {/* Social & Language */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-foreground">{t('footer.follow')}</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/luxury_tech7?igsh=MW9xM202NjhpZHFnNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              
              
            </div>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg border border-border hover:border-accent transition-colors"
            >
              <span className={language === 'he' ? 'text-accent font-semibold' : 'text-muted-foreground'}>
                HE
              </span>
              <span className="mx-2 text-muted-foreground">|</span>
              <span className={language === 'en' ? 'text-accent font-semibold' : 'text-muted-foreground'}>
                EN
              </span>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center text-muted-foreground">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};
