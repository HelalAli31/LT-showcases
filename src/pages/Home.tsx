import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { Portfolio } from "@/components/Portfolio";
import { Values } from "@/components/Values";
import { Contact } from "@/components/Contact";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { t } = useLanguage();

  return (
    <>
      <Hero />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-gradient-gold">{t("home.services.title")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-16 text-center max-w-2xl mx-auto">
            {t("home.services.subtitle")}
          </p>
          <ServicesGrid />
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/services">{t("home.services.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Portfolio
        limit={3}
        showFilters={false}
        heading={t("home.portfolio.title")}
        sectionId="home-portfolio"
      />
      <div className="bg-card pb-24">
        <div className="container mx-auto px-4 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">{t("home.portfolio.viewAll")}</Link>
          </Button>
        </div>
      </div>

      <Values />

      <Contact showPageLink titleKey="home.contact.title" subtitleKey="home.contact.subtitle" />
    </>
  );
};

export default Home;
