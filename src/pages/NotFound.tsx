import { useLocation, Link } from "@/lib/public-router";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-32">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-bold mb-4 text-gradient-gold">404</h1>
        <p className="text-2xl font-bold mb-2 text-foreground">{t("notFound.title")}</p>
        <p className="text-muted-foreground mb-8">{t("notFound.message")}</p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow">
          <Link to="/">{t("notFound.cta")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
