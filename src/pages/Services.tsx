import { Link } from "@/lib/public-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { ServicesGrid } from "@/components/ServicesGrid";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { generalFaq } from "@/data/services";

const Services = () => {
  const { t } = useLanguage();

  const whatsappMessage = encodeURIComponent(t("whatsapp.message"));
  const whatsappUrl = `https://wa.me/972549598571?text=${whatsappMessage}`;

  return (
    <>
      <PageBanner
        title={t("services.pageTitle")}
        subtitle={t("services.pageSubtitle")}
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.services") }]}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ServicesGrid />
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              <span className="text-gradient-gold">{t("services.faqTitle")}</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12">{t("services.faqSubtitle")}</p>
            <FaqAccordion items={generalFaq} />
          </div>
        </div>
      </section>

      <section className="py-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-gold">{t("services.ctaTitle")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            {t("services.ctaSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                {t("services.ctaButton")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/portfolio">{t("nav.portfolio")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
