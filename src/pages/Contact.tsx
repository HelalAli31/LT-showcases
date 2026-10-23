import { useLanguage } from "@/contexts/LanguageContext";
import { PageBanner } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageCircle, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  const { language, t } = useLanguage();

  const message =
    language === "he"
      ? "שלום! אני מעוניין בפרויקט חדש, אשמח לשוחח 🙂"
      : "Hello! I'm interested in starting a new project.";
  const whatsappUrl = `https://wa.me/972549598571?text=${encodeURIComponent(message)}`;

  const infoCards = [
    {
      icon: Phone,
      title: t("contact.info.phone"),
      value: "054-959-8571",
      href: "tel:+972549598571",
    },
    {
      icon: Mail,
      title: t("contact.info.email"),
      value: "luxurytech30@gmail.com",
      href: "mailto:luxurytech30@gmail.com",
    },
    {
      icon: Clock,
      title: t("contact.info.hours"),
      value: t("contact.info.hoursValue"),
    },
  ];

  return (
    <>
      <PageBanner
        title={t("contact.title")}
        subtitle={t("contact.pageSubtitle")}
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("nav.contact") }]}
      />

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
            {/* WhatsApp CTA */}
            <div className="lg:col-span-3 p-10 rounded-2xl bg-card border border-border hover-glow flex flex-col justify-center text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                <MessageCircle className="text-accent" size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                {t("contact.whatsapp.title")}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("contact.whatsapp.desc")}</p>
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 hover-glow text-lg px-10 py-6 mx-auto"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {t("contact.whatsapp")}
                </a>
              </Button>
            </div>

            {/* Info cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {infoCards.map((card, index) => {
                const Icon = card.icon;
                const content = (
                  <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover-lift h-full">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Icon className="text-accent" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                      <p className="font-semibold text-foreground">{card.value}</p>
                    </div>
                  </div>
                );
                return card.href ? (
                  <a key={index} href={card.href}>
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card border-t border-border text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold mb-6 text-foreground">{t("contact.social.title")}</h3>
          <div className="flex justify-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/luxury_tech7?igsh=MW9xM202NjhpZHFnNA=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
