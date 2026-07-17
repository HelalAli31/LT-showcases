import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { services } from "@/data/services";

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? "text-accent" : "text-foreground hover:text-accent"}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMobile}>
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
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass} end>
            {t("nav.home")}
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-accent transition-colors outline-none">
              {t("nav.services")}
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="bg-popover border-border min-w-[220px]">
              <DropdownMenuItem asChild className="cursor-pointer font-medium">
                <Link to="/services">{t("services.pageTitle")}</Link>
              </DropdownMenuItem>
              {services.map((service) => (
                <DropdownMenuItem key={service.slug} asChild className="cursor-pointer">
                  <Link to={`/services/${service.slug}`}>{service.title[language]}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink to="/portfolio" className={navLinkClass}>
            {t("nav.portfolio")}
          </NavLink>
          <NavLink to="/blog" className={navLinkClass}>
            {t("nav.blog")}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t("nav.about")}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t("nav.contact")}
          </NavLink>
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
            onClick={() => navigate("/contact")}
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
        <div className="md:hidden bg-card border-t border-border max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link to="/" onClick={closeMobile} className="text-foreground hover:text-accent transition-colors text-start">
              {t("nav.home")}
            </Link>

            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between text-foreground hover:text-accent transition-colors text-start"
              >
                {t("nav.services")}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileServicesOpen && (
                <div className="mt-3 ms-4 flex flex-col gap-3 border-s border-border ps-4">
                  <Link to="/services" onClick={closeMobile} className="text-sm font-medium text-accent">
                    {t("services.pageTitle")}
                  </Link>
                  {services.map((service) => (
                    <Link
                      key={service.slug}
                      to={`/services/${service.slug}`}
                      onClick={closeMobile}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {service.title[language]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/portfolio" onClick={closeMobile} className="text-foreground hover:text-accent transition-colors text-start">
              {t("nav.portfolio")}
            </Link>
            <Link to="/blog" onClick={closeMobile} className="text-foreground hover:text-accent transition-colors text-start">
              {t("nav.blog")}
            </Link>
            <Link to="/about" onClick={closeMobile} className="text-foreground hover:text-accent transition-colors text-start">
              {t("nav.about")}
            </Link>
            <Link to="/contact" onClick={closeMobile} className="text-foreground hover:text-accent transition-colors text-start">
              {t("nav.contact")}
            </Link>
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
                onClick={() => {
                  closeMobile();
                  navigate("/contact");
                }}
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
