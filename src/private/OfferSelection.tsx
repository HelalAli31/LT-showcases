import { useId } from "react";
import type { CSSProperties } from "react";
import type { Snapshot } from "./types";
import { money } from "./shared";

export default function OfferSelection({
  snapshot,
  tier,
  months,
  onChange,
}: {
  snapshot: Snapshot;
  tier: string;
  months: number;
  onChange: (selection: { tier: string; months: number }) => void;
}) {
  const group = useId();
  const current = snapshot.tiers.find((t) => t.name === tier);
  return (
    <div className="lt-offer-selection">
      <h2>1. בוחרים מסלול</h2>
      <div
        className="lt-tier-grid"
        aria-label="מסלולים לבחירת הלקוח"
        style={{ "--tier-count": snapshot.tiers.length } as CSSProperties}
      >
        {snapshot.tiers.map((t) => (
          <button
            type="button"
            key={t.name}
            className={`lt-card lt-tier ${tier === t.name ? "selected" : ""}`}
            aria-label={`בחירת מסלול ${t.name}`}
            aria-pressed={tier === t.name}
            onClick={() =>
              onChange({
                tier: t.name,
                months: t.rules.some((r) => r.months === months)
                  ? months
                  : t.rules[0].months,
              })
            }
          >
            <span className="lt-tier-choice-state">
              {tier === t.name ? "✓ המסלול שנבחר" : "בחירת מסלול"}
            </span>
            <h2>{t.name}</h2>
            <div className="lt-tier-base-price">
              <strong>{money(t.monthly)}</strong> / חודש לפני הנחה
            </div>
            <p>הקמה חד-פעמית: {money(t.setup)}</p>
            <ul>
              {t.features.slice(0, 3).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <fieldset className="lt-commitment">
        <legend>2. בוחרים תקופת התחייבות</legend>
        <div className="lt-commitment-options">
          {current?.rules.map((r) => {
            const q = snapshot.quotes.find(
              (q) => q.tier === tier && q.months === r.months,
            );
            return (
              <label
                key={r.months}
                className={`lt-commitment-option ${months === r.months ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={group}
                  aria-label={`${r.months} חודשים`}
                  checked={months === r.months}
                  onChange={() => onChange({ tier, months: r.months })}
                />
                <strong>{r.months} חודשים</strong>
                <span className="lt-commitment-discount">
                  {r.bps ? `${r.bps / 100}% הנחה` : "ללא הנחה"}
                </span>
                {r.bps > 0 && <del>{money(q.originalMonthly)}</del>}
                <b>
                  {money(q.monthly)}
                  <small> / חודש</small>
                </b>
                <span>כולל הקמה: {money(q.total)}</span>
                <span>חיסכון לתקופה: {money(q.savings)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
