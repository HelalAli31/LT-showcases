import { Link } from "@/lib/public-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { services } from "@/data/services";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const ServicesGrid = () => {
  const { language, t } = useLanguage();
  const Arrow = language === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <Link
            key={service.slug}
            to={`/services/${service.slug}`}
            className="group p-8 rounded-xl bg-card border border-border hover-lift hover-glow flex flex-col"
          >
            <div className="w-14 h-14 mb-6 rounded-full bg-accent/20 flex items-center justify-center">
              <Icon className="text-accent" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{service.title[language]}</h3>
            <p className="text-muted-foreground mb-6 flex-1">{service.tagline[language]}</p>
            <span className="inline-flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
              {t("services.learnMore")}
              <Arrow size={16} />
            </span>
          </Link>
        );
      })}
    </div>
  );
};
