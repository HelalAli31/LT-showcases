import { Link } from "@/lib/public-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { Portfolio } from "@/components/Portfolio";
import { Values } from "@/components/Values";
import { Contact } from "@/components/Contact";
import { StatsStrip } from "@/components/StatsStrip";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ArticleCard } from "@/components/ArticleCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { generalFaq } from "@/data/services";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Home = () => {
  const { language, t } = useLanguage();
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  const latestArticles = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  return (
    <>
      <Hero />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground text-center mb-8">
            {t("home.stats.title")}
          </h2>
          <StatsStrip />
        </div>
      </section>

      <section className="py-24 bg-card">
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

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            <span className="text-gradient-gold">{t("about.process.title")}</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            {t("about.process.subtitle")}
          </p>
          <ProcessSteps />
          <div className="text-center mt-12">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium"
            >
              {t("home.process.viewMore")}
              <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Portfolio
        featuredIds={[501, 502, 503]}
        showFilters={false}
        heading={t("home.portfolio.crmTitle")}
        sectionId="home-portfolio-crm"
      />
      <div className="bg-card pb-24">
        <div className="container mx-auto px-4 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">{t("home.portfolio.viewAll")}</Link>
          </Button>
        </div>
      </div>

      <Portfolio
        featuredIds={[400, 403, 401]}
        showFilters={false}
        heading={t("home.portfolio.storeTitle")}
        sectionId="home-portfolio-store"
      />
      <div className="bg-card pb-24">
        <div className="container mx-auto px-4 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/portfolio">{t("home.portfolio.viewAll")}</Link>
          </Button>
        </div>
      </div>

      <Values />

      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-gradient-gold">{t("home.articles.title")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-16 text-center max-w-2xl mx-auto">
            {t("home.articles.subtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/blog">{t("home.articles.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              <span className="text-gradient-gold">{t("services.faqTitle")}</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12">{t("services.faqSubtitle")}</p>
            <FaqAccordion items={generalFaq} />
            <div className="text-center mt-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium"
              >
                {t("home.faq.viewAll")}
                <Arrow size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Contact showPageLink titleKey="home.contact.title" subtitleKey="home.contact.subtitle" />
    </>
  );
};

export default Home;
