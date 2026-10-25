import type { Snapshot, Quote } from "./types";
import Head from "next/head";
import Link from "next/link";
import {
  useEffect,
  useState,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
export const money = (n: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: n % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n / 100);
export async function api(path: string, method = "GET", data?: unknown) {
  const response = await fetch("/api/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  let value;
  try {
    value = await response.json();
  } catch {
    throw Error("שירות אינו זמין");
  }
  if (!response.ok) {
    const error = Object.assign(
      Error(
        (value.error || "הפעולה נכשלה") +
          (value.requestId ? ` (מזהה תקלה: ${value.requestId})` : ""),
      ),
      {
        status: response.status,
      },
    );
    throw error;
  }
  return value;
}
export function Shell({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
  }, []);
  return (
    <div className="lt-private" dir="rtl">
      <Head>
        <title>{admin ? "ניהול" : "הצעה אישית"} | Luxury Tech</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <header className="lt-top">
        <Link href="/">
          <img src="/assets/logo.png" alt="Luxury Tech" />
          <span>
            Luxury<span className="gold">Tech</span>
          </span>
        </Link>
        <span className="lt-tag">
          {admin ? "ניהול הצעות והסכמים" : "ההצעה הפרטית שלך"}
        </span>
      </header>
      {admin && (
        <nav className="lt-nav">
          {[
            ["/admin", "סקירה"],
            ["/admin/offers", "הצעות"],
            ["/admin/offers/new", "הצעה חדשה"],
            ["/admin/pricing", "מחירון"],
            ["/admin/contracts", "הסכמים"],
            ["/admin/contract-templates", "תבניות הסכם"],
            ["/admin/settings", "הגדרות"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      )}
      <main className="lt-content">{children}</main>
      <footer className="lt-bottom">
        Luxury Tech · הצעות אישיות והתקשרות מאובטחת
      </footer>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="lt-field">
      <span>{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ "aria-label"?: string }>, {
            "aria-label": label,
          })
        : children}
    </label>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={"lt-notice " + (error ? "lt-error" : "")}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export type Rule = { months: number; bps: number };
export function DiscountRules({
  value,
  onChange,
}: {
  value: Rule[];
  onChange: (rules: Rule[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const months = [...new Set([12, 24, 36, ...value.map((r) => r.months)])].sort(
    (a, b) => a - b,
  );
  return (
    <>
      <div className="lt-rules">
        {months.map((m) => {
          const r = value.find((r) => r.months === m);
          return (
            <div key={m}>
              <label>
                <input
                  type="checkbox"
                  checked={!!r}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...value, { months: m, bps: 0 }]
                        : value.filter((r) => r.months !== m),
                    )
                  }
                />
                {m} חודשים
              </label>
              <Field label="הנחה %">
                <input
                  aria-label={`הנחה ל-${m} חודשים`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={!r}
                  value={(r?.bps || 0) / 100}
                  onChange={(e) =>
                    onChange(
                      value.map((r) =>
                        r.months === m
                          ? {
                              ...r,
                              bps: Math.round(Number(e.target.value) * 100),
                            }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
            </div>
          );
        })}
      </div>
      <div className="lt-inline">
        <input
          aria-label="משך מותאם בחודשים"
          placeholder="משך אחר בחודשים"
          type="number"
          min="1"
          max="120"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          type="button"
          className="secondary"
          onClick={() => {
            const m = Number(custom);
            if (
              Number.isInteger(m) &&
              m > 0 &&
              m <= 120 &&
              !value.some((r) => r.months === m)
            ) {
              onChange([...value, { months: m, bps: 0 }]);
              setCustom("");
            }
          }}
        >
          הוספת משך
        </button>
      </div>
    </>
  );
}
export function QuoteCard({
  snapshot: s,
  quote: q,
  compact = false,
}: {
  snapshot: Snapshot;
  quote: Quote;
  compact?: boolean;
}) {
  return (
    <section
      className={`lt-card lt-quote ${compact ? "lt-quote-compact" : ""}`}
      aria-live="polite"
    >
      <p className="lt-eyebrow">
        {q.tier} · {q.months} חודשי התחייבות
      </p>
      <p>
        מחיר חודשי מקורי:{" "}
        {q.discountBps ? (
          <del>{money(q.originalMonthly)}</del>
        ) : (
          money(q.originalMonthly)
        )}
      </p>
      <span className="lt-tag">{q.discountBps / 100}% הנחה</span>
      <div className="lt-price">
        {money(q.monthly)}
        <small>/ חודש</small>
      </div>
      <dl>
        {[
          ["דמי הקמה חד־פעמיים", q.setup],
          ["תוספות חד־פעמיות", q.addons || 0],
          ["סכום לפני מס נוסף", q.subtotal],
          ["מס נוסף", q.tax],
          ["סך התחייבות לתקופה", q.total],
          ["חיסכון לתקופה לפני מס נוסף", q.savings],
        ]
          .filter(
            ([, n], index) =>
              !compact ||
              (index === 1
                ? Number(n) !== 0
                : index === 2 || index === 3
                  ? q.tax !== 0
                  : true),
          )
          .map(([label, n]) => (
            <div key={String(label)}>
              <dt>{label}</dt>
              <dd>{money(Number(n))}</dd>
            </div>
          ))}
      </dl>
      <p>
        {
          (
            {
              inclusive: "המחירים כוללים מס",
              exclusive: "מס נוסף למחירים",
              exempt: "פטור ממס",
            } as Record<string, string>
          )[s.tax.mode]
        }{" "}
        · {s.tax.bps / 100}%
      </p>
      <p>
        ההנחה תקפה לכל תקופת ההתחייבות.{" "}
        {s.discountSetup
          ? "ההנחה חלה גם על ההקמה."
          : "ההנחה חלה על החיוב החודשי בלבד."}
      </p>
      {compact ? (
        <details>
          <summary>מה קורה בסיום התקופה?</summary>
          <p>{s.renewal}</p>
        </details>
      ) : (
        <p>
          <strong>בחידוש:</strong> {s.renewal}
        </p>
      )}
    </section>
  );
}
export function Otp({
  base,
  onVerified,
}: {
  base: string;
  onVerified: () => void;
}) {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  return (
    <section className="lt-card lt-auth">
      <p className="lt-eyebrow">גישה אישית ומאובטחת</p>
      <h1>נעים להיפגש</h1>
      <p>הזינו את כתובת הדוא״ל שאליה מיועדת ההצעה כדי לקבל קוד אימות.</p>
      {error && <Notice error>{error}</Notice>}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            if (sent) {
              await api(base + "/verify", "POST", { email, code });
              onVerified();
            } else {
              await api(base + "/otp", "POST", { email });
              setSent(true);
              setCooldown(60);
            }
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="דוא״ל">
          <input
            type="email"
            dir="ltr"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
          />
        </Field>
        {sent && (
          <>
            <Notice>
              אם הכתובת תואמת לנמען ההצעה, נשלח קוד בתוקף ל־5 דקות.
            </Notice>
            <Field label="קוד חד־פעמי">
              <input
                required
                pattern="[0-9]{6}"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
          </>
        )}
        <button disabled={busy}>
          {busy ? "רגע…" : sent ? "אימות וכניסה" : "שליחת קוד אימות"}
        </button>
        {sent && (
          <button
            type="button"
            className="secondary"
            disabled={busy || cooldown > 0}
            onClick={() => {
              setSent(false);
              setCode("");
            }}
          >
            שליחה מחדש {cooldown > 0 ? `(${cooldown})` : ""}
          </button>
        )}
      </form>
    </section>
  );
}
