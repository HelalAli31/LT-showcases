import { useParams, Link } from "@/lib/public-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { articles, getArticleBySlug, getCategoryLabelKey } from "@/data/articles";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import NotFound from "@/pages/NotFound";

const BlogPost = () => {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const locale = language === "he" ? "he-IL" : "en-US";
  const article = getArticleBySlug(slug ?? "");

  if (!article) return <NotFound />;

  const Arrow = language === "he" ? ArrowLeft : ArrowRight;
  const related = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <section className="relative pt-36 pb-16 md:pt-44 md:pb-20 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/" className="hover:text-accent transition-colors">
              {t("nav.home")}
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-accent transition-colors">
              {t("nav.blog")}
            </Link>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="border-accent/50 text-accent mb-6">
              {t(getCategoryLabelKey(article.category))}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-gradient-gold">{article.title[language]}</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(article.date).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {article.readTime} {t("blog.minRead")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden mb-12">
              <img src={article.cover} alt={article.title[language]} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-6">
              {article.content.map((block, index) =>
                block.type === "heading" ? (
                  <h2 key={index} className="text-2xl font-bold text-foreground pt-4">
                    {block[language]}
                  </h2>
                ) : (
                  <p key={index} className="text-lg text-muted-foreground leading-relaxed">
                    {block[language]}
                  </p>
                ),
              )}
            </div>

            <div className="mt-16 pt-8 border-t border-border">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium"
              >
                <Arrow size={16} />
                {t("blog.backToBlog")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
              <span className="text-gradient-gold">{t("blog.relatedArticles")}</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/blog/${item.slug}`}
                  className="group rounded-xl overflow-hidden bg-background border border-border hover-lift hover-glow"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.cover}
                      alt={item.title[language]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground">{item.title[language]}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/blog">{t("blog.backToBlog")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BlogPost;
