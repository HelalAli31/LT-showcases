import PriceRounding from "./PriceRounding";
import QuickOffer from "./QuickOffer";
import OfferSelection from "./OfferSelection";
import ProjectScope, {
  ProjectScopeEditor,
  emptyProjectDetails,
} from "./ProjectScope";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type {
  OfferInput,
  Offer,
  Product,
  Settings,
  Snapshot,
  Tier,
} from "./types";
import { api, Field, Notice, DiscountRules, QuoteCard, money } from "./shared";
import AdvancedBuilder from "./Builder";

const localDate = (value: string) => {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const emptyBrief = () => ({
  title: "",
  product: "ecommerce",
  clientLabel: "",
  recipientEmail: "",
  description: "",
  specialRequirements: "",
  deliveryDays: 30,
  revisionRounds: 3,
  depositPercent: 55,
  expires: localDate(new Date(Date.now() + 14 * 86400000).toISOString()),
});
const agorot = (value: string) => {
  if (!/^\d+(?:\.\d{0,2})?$/.test(value)) return 0;
  const [whole, fraction = ""] = value.split(".");
  return Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
};
export default function GuidedBuilder({
  offerId,
  settings,
}: {
  offerId?: string;
  settings: Settings;
}) {
  const router = useRouter();
  const [brief, setBrief] = useState(emptyBrief);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [pages, setPages] = useState<OfferInput["pages"]>([]);
  const [projectDetails, setProjectDetails] = useState(emptyProjectDetails);
  const [offerRules, setOfferRules] = useState(settings.rules);
  const [tax, setTax] = useState({ mode: "", bps: 0 });
  const [discountSetup, setDiscountSetup] = useState(false);
  const [draftId, setDraftId] = useState(offerId);
  const [doc, setDoc] = useState<Offer>();
  const [preview, setPreview] = useState<Snapshot>();
  const [selection, setSelection] = useState({ tier: "", months: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [extras, setExtras] = useState<Partial<OfferInput>>({});
  useEffect(() => {
    let active = true;
    setPreview(undefined);
    setDoc(undefined);
    setDraftId(offerId);
    setBrief(emptyBrief());
    setAdvanced(false);
    setOfferRules(settings.rules);
    setExtras({});
    setPages([]);
    setProjectDetails(emptyProjectDetails);
    setTax({ mode: "", bps: 0 });
    setDiscountSetup(false);
    setError("");
    (async () => {
      const products: Product[] = await api("admin/catalog");
      if (!active) return;
      setCatalog(products);
      if (offerId) {
        const d: Offer = await api("admin/offers/" + offerId);
        if (!active) return;
        setDoc(d);
        if (d.input.composition) {
          const input = d.input;
          setBrief({
            ...emptyBrief(),
            ...input.composition,
            title: input.title,
            product: input.product,
            clientLabel: input.clientLabel,
            recipientEmail: input.recipientEmail,
            description: input.description,
            expires: localDate(input.expires),
          });
          setTiers(input.tiers);
          setPages(input.pages || []);
          setProjectDetails(input.projectDetails || emptyProjectDetails);
          setTax(input.tax);
          setDiscountSetup(input.discountSetup);
          setOfferRules(input.rules || settings.rules);
          setExtras({
            addons: input.addons,
            attachments: input.attachments,
            internalNotes: input.internalNotes,
          });
        }
      } else {
        const initial = products
          .find((p) => p._id === "ecommerce")
          ?.tiers.find((t) => t.name === "PRO");
        setTiers(
          initial
            ? [{ ...initial, rules: settings.rules.map((r) => ({ ...r })) }]
            : [],
        );
      }
    })().catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [offerId, settings.rules]);
  const invalidate = () => {
    setPreview(undefined);
    setMessage("");
  };
  const change = (key: string, value: string | number) => {
    setBrief((b) => ({ ...b, [key]: value }));
    invalidate();
  };
  const updateTier = (name: string, key: string, value: unknown) => {
    setTiers((ts) =>
      ts.map((t) => (t.name === name ? { ...t, [key]: value } : t)),
    );
    invalidate();
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  async function generate() {
    const input: OfferInput = await api("admin/offers/compose", "POST", {
      ...brief,
      expires: new Date(brief.expires).toISOString(),
      tiers,
      rules: offerRules,
      tax,
      discountSetup,
      pages,
      projectDetails,
      ...extras,
    });
    let id = draftId;
    if (id) await api("admin/offers/" + id, "PUT", input);
    else {
      id = (await api("admin/offers", "POST", input))._id;
      setDraftId(id);
    }
    const snapshot: Snapshot = await api(`admin/offers/${id}/preview`);
    setPreview(snapshot);
    setSelection({
      tier: snapshot.tiers[0].name,
      months: snapshot.tiers[0].rules[0].months,
    });
    setMessage(
      "ההצעה וההסכם נוצרו ונשמרו. בדקו את המסמך ואת המחירים לפני יצירת הקישור.",
    );
    setTimeout(
      () =>
        document
          .getElementById("offer-review")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }
  const product = catalog.find((p) => p._id === brief.product);
  const quote = preview?.quotes.find(
    (q) => q.tier === selection.tier && q.months === selection.months,
  );
  const previewUrl = `/api/admin/offers/${draftId}/preview?tier=${selection.tier}&months=${selection.months}`;
  if (advanced || (doc && (doc.status !== "draft" || !doc.input.composition)))
    return <AdvancedBuilder offerId={offerId || draftId} settings={settings} />;
  if (offerId && !doc)
    return error ? <Notice error>{error}</Notice> : <p>טוען את ההצעה…</p>;
  return (
    <>
      <div className="lt-page-heading lt-builder-heading">
        <div>
          <span className="lt-eyebrow">LUXURY TECH / PROPOSALS</span>
          <h1>מפרטים להצעה מוכנה.</h1>
          <p>
            בוחרים שירות, מגדירים מחיר ומוסיפים דגשים. ההצעה וההסכם נוצרים
            עבורכם.
          </p>
        </div>
        <span className="lt-tag">{draftId ? "טיוטה שמורה" : "הצעה חדשה"}</span>
      </div>
      {!offerId && !draftId && <QuickOffer />}
      <div className="lt-builder-steps">
        <span>
          <b>01</b> הלקוח והפרויקט
        </span>
        <span>
          <b>02</b> מסלולים ומחירים
        </span>
        <span className={preview ? "active" : ""}>
          <b>03</b> בדיקה ושיתוף
        </span>
      </div>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {settings.capabilities.publishing === false && (
        <Notice error>
          אפשר להכין ולבדוק את ההצעה. פרסום דורש הגדרת DATA_ENCRYPTION_KEY
          ב-Vercel כמפתח הצפנה בן 64 תווי hex ופריסה מחדש. יש לשמור על אותו מפתח
          עבור כל ההסכמים.
        </Notice>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(generate);
        }}
      >
        <fieldset disabled={busy} className="lt-builder-fieldset">
          <section className="lt-card">
            <div className="lt-section-heading">
              <span className="lt-step-number">01</span>
              <div>
                <h2>למי ומה בונים?</h2>
                <p>הפרטים האלה הופכים לתיאור ולהיקף העבודה במסמך.</p>
              </div>
            </div>
            <div className="lt-form-grid">
              <Field label="שם הלקוח או העסק">
                <input
                  required
                  maxLength={200}
                  value={brief.clientLabel}
                  onChange={(e) => change("clientLabel", e.target.value)}
                />
              </Field>
              <Field label="דוא״ל הנמען (לקבלת עותק)">
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={brief.recipientEmail}
                  onChange={(e) => change("recipientEmail", e.target.value)}
                />
              </Field>
              <Field label="סוג השירות">
                <select
                  value={brief.product}
                  onChange={(e) => {
                    change("product", e.target.value);
                    const t = catalog
                      .find((p) => p._id === e.target.value)
                      ?.tiers.find((t) => t.name === "PRO");
                    setTiers(
                      t
                        ? [{ ...t, rules: offerRules.map((r) => ({ ...r })) }]
                        : [],
                    );
                  }}
                >
                  {catalog.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="תוקף הצעה">
                <input
                  required
                  type="datetime-local"
                  value={brief.expires}
                  onChange={(e) => change("expires", e.target.value)}
                />
              </Field>
            </div>
            <Field label="מה הפרויקט צריך לעשות?">
              <textarea
                required
                minLength={3}
                maxLength={8000}
                rows={3}
                placeholder="לדוגמה: חנות למותג בגדים עם קטגוריות, סל קניות וניהול הזמנות"
                value={brief.description}
                onChange={(e) => change("description", e.target.value)}
              />
            </Field>
            <Field label="דרישות מיוחדות ודברים שחשוב לכלול">
              <textarea
                rows={3}
                maxLength={8000}
                placeholder="אינטגרציות, מגבלות, תוצרים מיוחדים או דרישה קריטית. הדגשים ייכללו בהסכם."
                value={brief.specialRequirements}
                onChange={(e) => change("specialRequirements", e.target.value)}
              />
            </Field>
          </section>
          <ProjectScopeEditor
            pages={pages}
            details={projectDetails}
            product={brief.product}
            onChange={(p, d) => {
              setPages(p);
              setProjectDetails(d);
              invalidate();
            }}
          />
          <section className="lt-card">
            <div className="lt-section-heading">
              <span className="lt-step-number">02</span>
              <div>
                <h2>מה מציעים ובאיזה מחיר?</h2>
                <p>
                  המחירים נטענים מהמחירון שלכם. אפשר לשנות כל מסלול עבור הלקוח
                  הזה.
                </p>
              </div>
            </div>
            <div className="lt-package-options">
              {product?.tiers.map((t) => {
                const active = tiers.find((x) => x.name === t.name);
                return (
                  <div
                    className={`lt-tier-editor lt-package-option ${active ? "selected" : ""}`}
                    key={brief.product + t.name}
                  >
                    <label className="lt-check">
                      <input
                        type="checkbox"
                        checked={!!active}
                        onChange={(e) => {
                          setTiers(
                            e.target.checked
                              ? [
                                  ...tiers,
                                  {
                                    ...t,
                                    approved: false,
                                    rules: offerRules.map((r) => ({ ...r })),
                                  },
                                ]
                              : tiers.filter((x) => x.name !== t.name),
                          );
                          invalidate();
                        }}
                      />
                      <strong>{t.name}</strong>
                      <span>
                        {t.name === "CUSTOM"
                          ? "הצעה מותאמת"
                          : t.name === "PRO"
                            ? "המסלול המתקדם"
                            : "כל מה שצריך להתחלה"}
                      </span>
                    </label>
                    {active ? (
                      <>
                        <div className="lt-form-grid">
                          <Field label={`דמי הקמה ${t.name} ₪`}>
                            <input
                              required
                              type="number"
                              min="1"
                              max="1000000"
                              step="1"
                              value={active.setup / 100}
                              onChange={(e) =>
                                updateTier(
                                  t.name,
                                  "setup",
                                  agorot(e.target.value),
                                )
                              }
                            />
                          </Field>
                          <Field label={`מחיר חודשי ${t.name} ₪`}>
                            <input
                              required
                              type="number"
                              min="1"
                              max="1000000"
                              step="1"
                              value={active.monthly / 100}
                              onChange={(e) =>
                                updateTier(
                                  t.name,
                                  "monthly",
                                  agorot(e.target.value),
                                )
                              }
                            />
                          </Field>
                        </div>
                        <PriceRounding
                          setup={active.setup}
                          monthly={active.monthly}
                          onChange={(setup, monthly) => {
                            updateTier(t.name, "setup", setup);
                            updateTier(t.name, "monthly", monthly);
                          }}
                        />
                        <ul className="lt-package-features">
                          {active.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                        {t.name === "CUSTOM" && (
                          <label className="lt-check">
                            <input
                              required
                              type="checkbox"
                              checked={!!active.approved}
                              onChange={(e) =>
                                updateTier(t.name, "approved", e.target.checked)
                              }
                            />
                            אישרתי את המחיר ואת היקף CUSTOM עבור לקוח זה
                          </label>
                        )}
                        <details>
                          <summary>התאמת תכולה והנחות למסלול</summary>
                          <Field label={`רכיבים כלולים ${t.name}`}>
                            <textarea
                              value={active.features.join("\n")}
                              onChange={(e) =>
                                updateTier(
                                  t.name,
                                  "features",
                                  e.target.value.split("\n").filter(Boolean),
                                )
                              }
                            />
                          </Field>
                          <DiscountRules
                            value={active.rules || offerRules}
                            onChange={(v) => updateTier(t.name, "rules", v)}
                          />
                          {[
                            ["limits", "כמויות ומגבלות"],
                            ["exclusions", "החרגות"],
                            ["support", "רמת תמיכה, זמני מענה וחריגים"],
                          ].map(([k, label]) => (
                            <Field label={`${label} ${t.name}`} key={k}>
                              <textarea
                                placeholder="יושלם אוטומטית לפי פרטי הפרויקט"
                                value={active[k] || ""}
                                onChange={(e) =>
                                  updateTier(t.name, k, e.target.value)
                                }
                              />
                            </Field>
                          ))}
                        </details>
                      </>
                    ) : (
                      <p>
                        {money(t.monthly)} לחודש · {money(t.setup)} הקמה
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="lt-form-grid lt-tax-fields">
              <Field label="טיפול במס">
                <select
                  required
                  value={tax.mode}
                  onChange={(e) => {
                    setTax({ ...tax, mode: e.target.value });
                    invalidate();
                  }}
                >
                  <option value="">בחרו את הטיפול במס להצעה</option>
                  <option value="inclusive">המחירים כוללים מס</option>
                  <option value="exclusive">מס נוסף למחירים</option>
                  <option value="exempt">פטור ממס</option>
                </select>
              </Field>
              {tax.mode && tax.mode !== "exempt" && (
                <Field label="שיעור מס %">
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={tax.bps / 100}
                    onChange={(e) => {
                      setTax({ ...tax, bps: agorot(e.target.value) });
                      invalidate();
                    }}
                  />
                </Field>
              )}
            </div>
            <details className="lt-builder-details">
              <summary>תקופות התחייבות והנחות להצעה</summary>
              <p>
                ההנחות האלו מאושרות ללקוח. ביטול תקופה מסיר אותה מהבחירה. 0%
                יוצר הצעה ללא הנחה.
              </p>
              <DiscountRules
                value={offerRules}
                onChange={(r) => {
                  setOfferRules(r);
                  setTiers(
                    tiers.map((t) => ({
                      ...t,
                      rules: r.map((x) => ({ ...x })),
                    })),
                  );
                  invalidate();
                }}
              />
              <label className="lt-check">
                <input
                  type="checkbox"
                  checked={discountSetup}
                  onChange={(e) => {
                    setDiscountSetup(e.target.checked);
                    invalidate();
                  }}
                />
                אישור מפורש: להחיל את ההנחה גם על דמי ההקמה
              </label>
            </details>
          </section>
          <section className="lt-card">
            <h2>התנאים נוצרים אוטומטית</h2>
            <p>
              היקף העבודה, שלבי המסירה, תנאי התשלום, התמיכה והחידוש ייכללו
              במסמך. אפשר להתאים את הפרטים כאן.
            </p>
            <div className="lt-form-grid">
              <Field label="יעד מסירה בימי עבודה">
                <input
                  required
                  type="number"
                  min="1"
                  max="365"
                  value={brief.deliveryDays}
                  onChange={(e) =>
                    change("deliveryDays", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="סבבי תיקונים כלולים">
                <input
                  required
                  type="number"
                  min="0"
                  max="20"
                  value={brief.revisionRounds}
                  onChange={(e) =>
                    change("revisionRounds", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="מקדמה מתוך דמי ההקמה %">
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={brief.depositPercent}
                  onChange={(e) =>
                    change("depositPercent", Number(e.target.value))
                  }
                />
              </Field>
            </div>
            <p className="lt-inline-note">
              יתרת ההקמה לפני עלייה לאוויר. החיוב החודשי מתחיל במסירה. ההנחה לכל
              תקופת ההתחייבות; חידוש דורש הסכמה חדשה.
            </p>
          </section>
          <div className="lt-builder-submit">
            <div>
              <strong>השלב הבא: מסמך מוכן לבדיקה</strong>
              <p>המחירים יחושבו ויאומתו בשרת. שום דבר לא נשלח בשלב הזה.</p>
            </div>
            <button disabled={!tiers.length || !catalog.length}>
              {busy ? "יוצר את ההצעה…" : "יצירת הצעה והסכם אוטומטית"}
            </button>
          </div>
        </fieldset>
      </form>
      {preview && (
        <section
          id="offer-review"
          className="lt-card lt-review lt-admin-preview"
        >
          <div className="lt-section-heading">
            <span className="lt-step-number">03</span>
            <div>
              <h2>ההצעה מוכנה לבדיקה</h2>
              <p>
                זה הנוסח שיוצג ללקוח. בחרו מסלול ותקופה כדי לבדוק כל אפשרות.
              </p>
            </div>
          </div>
          <OfferSelection
            snapshot={preview}
            tier={selection.tier}
            months={selection.months}
            onChange={setSelection}
          />
          {quote && <QuoteCard snapshot={preview} quote={quote} />}
          <ProjectScope snapshot={preview} tier={selection.tier} />
          <div className="lt-document-toolbar">
            <strong>תצוגת ההסכם המלא</strong>
            <a
              target="_blank"
              rel="noreferrer"
              href={`/admin/offers/${draftId}/preview?tier=${selection.tier}&months=${selection.months}`}
            >
              תצוגת לקוח אינטראקטיבית ↗
            </a>
          </div>
          <iframe
            title="תצוגה מקדימה של ההסכם"
            className="lt-agreement lt-document-preview"
            src={previewUrl + "&format=agreement"}
            key={preview.digest + selection.tier + selection.months}
          />
          <div className="lt-builder-submit">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setAdvanced(true)}
            >
              עריכה מתקדמת ותוספות
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await api(`admin/offers/${draftId}/publish`, "POST", {
                    previewDigest: preview.digest,
                  });
                  router.push("/admin/offers/" + draftId);
                })
              }
            >
              {busy ? "מפרסם…" : "אישור ויצירת קישור ללקוח"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
