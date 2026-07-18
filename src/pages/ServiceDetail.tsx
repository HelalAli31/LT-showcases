import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { getServiceBySlug } from "@/data/services";
import { projects } from "@/components/Portfolio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ArrowRight, Play } from "lucide-react";
import NotFound from "@/pages/NotFound";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FaqAccordion } from "@/components/FaqAccordion";

const ServiceDetail = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const service = getServiceBySlug(slug ?? "");

  if (!service) return <NotFound />;

  const Icon = service.icon;
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;
  const relatedProjects = projects.filter((p) => p.category === service.slug).slice(0, 3);

  const whatsappMessage = encodeURIComponent(t("whatsapp.message"));
  const whatsappUrl = `https://wa.me/972549598571?text=${whatsappMessage}`;

  return (
    <>
      <PageBanner
        title={service.title[language]}
        subtitle={service.tagline[language]}
        crumbs={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.services"), to: "/services" },
          { label: service.title[language] },
        ]}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Icon className="text-accent" size={32} />
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {service.description[language]}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {service.descriptionExtra[language]}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              <span className="text-gradient-gold">{t("services.whatsIncluded")}</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {service.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover-lift"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                    <Check className="text-accent" size={14} />
                  </div>
                  <p className="text-foreground">{feature[language]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            <span className="text-gradient-gold">{t("services.ourProcess")}</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            {t("about.process.subtitle")}
          </p>
          <ProcessSteps />
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              <span className="text-gradient-gold">{t("services.relatedWork")}</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/portfolio"
                  className="group rounded-xl overflow-hidden bg-card border border-border hover-lift hover-glow block"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={project.image}
                      alt={project.title[language]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {project.video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
                          <Play className="text-accent-foreground" size={20} />
                        </div>
                      </div>
                    )}
                    {project.isConcept && (
                      <Badge className="absolute top-3 ltr:right-3 rtl:left-3 bg-background/90 text-accent border border-accent/40">
                        {t("portfolio.concept")}
                      </Badge>
                    )}
                    {project.video && (
                      <Badge className="absolute top-3 ltr:right-3 rtl:left-3 bg-background/90 text-accent border border-accent/40">
                        {t("portfolio.videoDemo")}
                      </Badge>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground">{project.title[language]}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.description[language]}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/portfolio">{t("home.portfolio.viewAll")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              <span className="text-gradient-gold">{t("services.faqTitle")}</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12">{t("services.faqSubtitle")}</p>
            <FaqAccordion items={service.faq} />
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
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              {t("services.ctaButton")}
            </a>
          </Button>
          <div className="mt-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
            >
              <Arrow size={16} />
              {t("services.backToServices")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
