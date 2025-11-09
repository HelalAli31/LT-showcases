import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

export const Hero = () => {
  const { t } = useLanguage();

  // Mouse parallax
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMx((e.clientX / window.innerWidth - 0.5) * 2);
      setMy((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Magnetic CTA
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [btnStyle, setBtnStyle] = useState<React.CSSProperties>({});
  const onBtnMove = (e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    setBtnStyle({ transform: `translate(${x * 0.12}px, ${y * 0.12}px)` });
  };
  const onBtnLeave = () => setBtnStyle({ transform: "translate(0,0)" });

  // Floating particles
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map(() => ({
        left: `${Math.random() * 100}%`,
        size: 4 + Math.random() * 6,
        delay: `${Math.random() * 6}s`,
        duration: `${6 + Math.random() * 8}s`,
        opacity: 0.15 + Math.random() * 0.25,
      })),
    []
  );

  const scrollToContact = () =>
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(${mx * 8}px, ${my * 8}px, 0) scale(1.02)`,
          transition: "transform 0.08s linear",
        }}
      >
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
      </div>

      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-25 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 50%, #facc15 0%, transparent 60%)",
          transform: `translate3d(${mx * -20}px, ${my * -10}px,0)`,
          transition: "transform 0.12s linear",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-28 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 50%, #22d3ee 0%, transparent 60%)",
          transform: `translate3d(${mx * 10}px, ${my * 16}px,0)`,
          transition: "transform 0.12s linear",
        }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-[-10%] rounded-full bg-yellow-400"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `rise ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-32 text-center z-10">
        {/* Alive Logo */}
        <div className="mb-6 flex justify-center">
          <div
            className="relative"
            style={{
              transform: `translate3d(${mx * 6}px, ${my * 4}px, 0)`,
              transition: "transform 0.08s linear",
            }}
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28 select-none [perspective:800px] animate-[logoFloat_7s_ease-in-out_infinite,logoBreath_4.5s_ease-in-out_infinite]">
              <img
                src={logo}
                alt="Luxury Tech"
                className="absolute inset-0 w-full h-full object-contain will-change-transform"
                style={{
                  transform: `rotateX(${my * 4}deg) rotateY(${mx * 6}deg)`,
                  transition: "transform 0.08s linear",
                }}
                draggable={false}
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-xl blur-md opacity-35"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 50%, rgba(250,204,21,.35), transparent 70%)",
                }}
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-xl mix-blend-screen"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 0%, rgba(250,204,21,.22) 35%, transparent 70%)",
                  animation: "shine 3.2s linear infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          style={{ animation: "fadeUp .9s ease both" }}
        >
          {t("hero.headline")}
        </h1>
        <p
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          style={{ animation: "fadeUp .9s ease .15s both" }}
        >
          {t("hero.subheadline")}
        </p>

        {/* CTA */}
        <Button
          ref={btnRef}
          onMouseMove={onBtnMove}
          onMouseLeave={onBtnLeave}
          onClick={scrollToContact}
          size="lg"
          style={btnStyle}
          className="relative bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 transition-transform"
        >
          <span className="relative z-10">{t("hero.cta")}</span>
          <span className="absolute inset-0 rounded-md ring-2 ring-accent/30 blur-[2px] animate-pulse pointer-events-none" />
        </Button>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ animation: "floatY 3s ease-in-out infinite" }}
          aria-hidden
        >
          <ChevronDown className="text-accent" size={32} />
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: .25; }
          100% { transform: translateY(-120vh) scale(1.2); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translate(-50%, 0); }
          50%     { transform: translate(-50%, -10px); }
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes logoBreath {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.035); }
        }
        @keyframes shine {
          0%   { transform: translateX(-120%); opacity: 0; }
          15%  { opacity: .9; }
          50%  { transform: translateX(120%); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
};
