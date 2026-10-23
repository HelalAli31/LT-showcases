import { Link } from "@/lib/public-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Crumb {
  label: string;
  to?: string;
}

interface PageBannerProps {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}

export const PageBanner = ({ title, subtitle, crumbs }: PageBannerProps) => {
  const { language } = useLanguage();
  const Chevron = language === "he" ? ChevronLeft : ChevronRight;

  return (
    <section className="relative pt-36 pb-16 md:pt-44 md:pb-20 overflow-hidden bg-card border-b border-border">
      <div
        className="pointer-events-none absolute -top-32 ltr:-right-32 rtl:-left-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(45% 45% at 50% 50%, #facc15 0%, transparent 60%)" }}
      />
      <div className="container relative mx-auto px-4 text-center">
        {crumbs && crumbs.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            {crumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <Chevron size={14} />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-accent transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-gradient-gold">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};
