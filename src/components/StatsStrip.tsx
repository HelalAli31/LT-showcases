import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { key: "about.stats.projects", value: "40+" },
  { key: "about.stats.years", value: "10+" },
  { key: "about.stats.satisfaction", value: "98%" },
];

export const StatsStrip = () => {
  const { t } = useLanguage();

  return (
    <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
      {stats.map((stat) => (
        <div key={stat.key} className="text-center p-6 rounded-xl bg-card border border-border">
          <div className="text-4xl font-bold text-gradient-gold mb-2">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{t(stat.key)}</div>
        </div>
      ))}
    </div>
  );
};
