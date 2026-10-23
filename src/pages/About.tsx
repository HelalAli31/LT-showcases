import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { About as AboutSection } from "@/components/About";
import { Values } from "@/components/Values";
import { TeamSection } from "@/components/TeamSection";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Contact } from "@/components/Contact";
import { StatsStrip } from "@/components/StatsStrip";

const About = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageBanner
        title={t("about.title")}
        subtitle={t("about.description")}
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.about") }]}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="text-gradient-gold">{t("about.story.title")}</span>
            </h2>
            <div className="space-y-5 text-lg text-muted-foreground leading-relaxed text-start">
              <p>{t("about.story.p1")}</p>
              <p>{t("about.story.p2")}</p>
              <p>{t("about.story.p3")}</p>
            </div>
          </div>

          <StatsStrip />
        </div>
      </section>

      <AboutSection />
      <Values />

      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            <span className="text-gradient-gold">{t("about.process.title")}</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            {t("about.process.subtitle")}
          </p>
          <ProcessSteps />
        </div>
      </section>

      <TeamSection />

      <Contact showPageLink={false} titleKey="about.cta.title" subtitleKey="about.cta.subtitle" />
    </>
  );
};

export default About;
