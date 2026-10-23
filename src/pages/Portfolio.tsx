import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { Portfolio as PortfolioSection } from "@/components/Portfolio";

const PortfolioPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageBanner
        title={t("portfolio.pageTitle")}
        subtitle={t("portfolio.pageSubtitle")}
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.portfolio") }]}
      />
      <PortfolioSection showHeading={false} sectionId="portfolio-page" />
    </>
  );
};

export default PortfolioPage;
