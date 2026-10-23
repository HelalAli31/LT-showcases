import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { ArticleCard } from "@/components/ArticleCard";
import { articles } from "@/data/articles";

const Blog = () => {
  const { t } = useLanguage();

  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <PageBanner
        title={t("blog.pageTitle")}
        subtitle={t("blog.pageSubtitle")}
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.blog") }]}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
