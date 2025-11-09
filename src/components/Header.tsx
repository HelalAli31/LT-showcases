import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png"; // ✅ import from src/assets

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };
console.log("a");
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors overflow-hidden">
            <img
              src={logo}
              alt="Luxury Tech Logo"
              className="w-10 h-10 object-contain"
              draggable={false}
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="hidden sm:block text-2xl font-bold">
            <span className="text-foreground">Luxury</span>
            <span className="text-gradient-gold">Tech</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("about")}
            className="text-foreground hover:text-accent transition-colors"
          >
            {t("nav.about")}
          </button>
          <button
            onClick={() => scrollToSection("portfolio")}
            className="text-foreground hover:text-accent transition-colors"
          >
            {t("nav.portfolio")}
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-foreground hover:text-accent transition-colors"
          >
            {t("nav.contact")}
          </button>
          <a
            href="tel:+972549598571"
            className="text-sm text-accent hover:text-accent/80 transition-colors font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg border border-accent/20 hover:border-accent/40"
          >
            054-959-8571
          </a>
        </div>

        {/* Language Toggle & CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 rounded-lg border border-border hover:border-accent transition-colors"
          >
            <span
              className={
                language === "he"
                  ? "text-accent font-semibold"
                  : "text-muted-foreground"
              }
            >
              HE
            </span>
            <span className="mx-1 text-muted-foreground">|</span>
            <span
              className={
                language === "en"
                  ? "text-accent font-semibold"
                  : "text-muted-foreground"
              }
            >
              EN
            </span>
          </button>
          <Button
            onClick={() => scrollToSection("contact")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow"
          >
            {t("nav.cta")}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground hover:text-accent transition-colors text-start"
            >
              {t("nav.about")}
            </button>
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-foreground hover:text-accent transition-colors text-start"
            >
              {t("nav.portfolio")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground hover:text-accent transition-colors text-start"
            >
              {t("nav.contact")}
            </button>
            <a
              href="tel:+972549598571"
              className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
            >
              054-959-8571
            </a>
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 rounded-lg border border-border hover:border-accent transition-colors"
              >
                <span
                  className={
                    language === "he"
                      ? "text-accent font-semibold"
                      : "text-muted-foreground"
                  }
                >
                  HE
                </span>
                <span className="mx-1 text-muted-foreground">|</span>
                <span
                  className={
                    language === "en"
                      ? "text-accent font-semibold"
                      : "text-muted-foreground"
                  }
                >
                  EN
                </span>
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t("nav.cta")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
