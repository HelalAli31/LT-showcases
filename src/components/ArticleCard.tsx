import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/data/articles";
import { getCategoryLabelKey } from "@/data/articles";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { language, t } = useLanguage();
  const locale = language === "he" ? "he-IL" : "en-US";

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group rounded-xl overflow-hidden bg-card border border-border hover-lift hover-glow flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={article.cover}
          alt={article.title[language]}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <Badge variant="outline" className="border-accent/50 text-accent w-fit mb-3">
          {t(getCategoryLabelKey(article.category))}
        </Badge>
        <h3 className="text-xl font-bold mb-2 text-foreground">{article.title[language]}</h3>
        <p className="text-muted-foreground mb-4 flex-1">{article.excerpt[language]}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <span>{new Date(article.date).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {article.readTime} {t("blog.minRead")}
          </span>
        </div>
      </div>
    </Link>
  );
};
