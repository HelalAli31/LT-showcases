import { useLanguage } from "@/contexts/LanguageContext";

const steps = [1, 2, 3, 4] as const;

export const ProcessSteps = () => {
  const { t } = useLanguage();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {steps.map((step) => (
        <div key={step} className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold">
            {step}
          </div>
          <h3 className="text-lg font-bold mb-2 text-foreground">{t(`about.process.step${step}.title`)}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`about.process.step${step}.desc`)}
          </p>
        </div>
      ))}
    </div>
  );
};
