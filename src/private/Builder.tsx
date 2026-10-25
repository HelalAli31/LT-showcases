import PriceRounding from "./PriceRounding";
import OfferSelection from "./OfferSelection";
import ProjectScope, {
  ProjectScopeEditor,
  emptyProjectDetails,
} from "./ProjectScope";
import type { Settings, OfferInput, Product, Offer, Snapshot } from "./types";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, Field, Notice, DiscountRules, QuoteCard, money } from "./shared";
const blank = {
  title: "",
  product: "ecommerce",
  recipientEmail: "",
  clientLabel: "",
  description: "",
  scope: "",
  pages: [],
  projectDetails: emptyProjectDetails,
  milestones: "",
  delivery: "",
  paymentTerms: "",
  cancellation: "",
  thirdPartyCosts: "",
  ipTerms: "",
  dataExit: "",
  liability: "",
  jurisdiction: "",
  renewal: "",
  expires: "",
  tiers: [],
  tax: { mode: "", bps: 0 },
  discountSetup: false,
  internalNotes: "",
  addons: [],
  attachments: [],
};
const paragraphLabels: Record<string, string> = {
  description: "תיאור הפרויקט",
  scope: "היקף עבודה ותוצרים מאושרים",
  milestones: "אבני דרך",
  delivery: "מועדי מסירה ותלות בשיתוף פעולה",
  paymentTerms: "תנאי תשלום, תחילת עבודה והפעלת שירות",
  cancellation: "ביטול וסיום התקשרות",
  thirdPartyCosts: "עלויות ושירותי צד שלישי",
  ipTerms: "זכויות קניין רוחני ורישיון שימוש",
  dataExit: "בעלות מידע, יצוא נתונים וסיום שירות",
  liability: "חלוקת אחריות, מגבלות וסעדים",
  jurisdiction: "דין, סמכות שיפוט ויישוב מחלוקות",
  renewal: "תנאים לאחר ההתחייבות וחידוש",
  internalNotes: "הערות פנימיות — אינן מוצגות ללקוח",
};
export default function Builder({
  offerId,
  settings,
}: {
  offerId?: string;
  settings: Settings;
}) {
  const router = useRouter();
  const [form, setForm] = useState<OfferInput>({
      ...blank,
      rules: settings.rules,
    }),
    [catalog, setCatalog] = useState<Product[]>(),
    [doc, setDoc] = useState<Offer>(),
    [draftId, setDraftId] = useState(offerId),
    [preview, setPreview] = useState<Snapshot>(),
    [previewTier, setPreviewTier] = useState(""),
    [previewMonths, setPreviewMonths] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [link, setLink] = useState("");
  useEffect(() => {
    if (!link) return;
    const frame = requestAnimationFrame(() => {
      const field = document.getElementById("published-offer-link");
      field?.scrollIntoView({ block: "center" });
      field?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [link]);
  useEffect(() => {
    api("admin/catalog")
      .then(setCatalog)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    setPreview(undefined);
    setLink("");
    setDoc(undefined);
    setDraftId(offerId);
    if (offerId)
      api("admin/offers/" + offerId)
        .then((d) => {
          setDoc(d);
          setForm({
            ...d.input,
            rules: d.input.rules || settings.rules,
            tiers: d.input.tiers.map((t) => ({
              ...t,
              rules: t.rules || d.input.rules || settings.rules,
            })),
            attachments: d.input.attachments || [],
            pages: d.input.pages || [],
            projectDetails: d.input.projectDetails || emptyProjectDetails,
          });
          setLink(d.url ? location.origin + d.url : "");
        })
        .catch((e) => setError(e.message));
    else setForm({ ...blank, rules: settings.rules });
  }, [offerId, settings.rules]);
  const set = (key: string, value: unknown) => {
    setForm((v) => ({
      ...v,
      [key]: value,
      // Manual contract wording must not be overwritten by later generation.
      ...(paragraphLabels[key] && key !== "internalNotes"
        ? { composition: undefined }
        : {}),
    }));
    setPreview(undefined);
  };
  const tierUpdate = (name: string, key: string, value: unknown) => {
    set(
      "tiers",
      form.tiers.map((t) => (t.name === name ? { ...t, [key]: value } : t)),
    );
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
  async function save() {
    const input = { ...form, expires: new Date(form.expires).toISOString() };
    if (draftId) {
      await api("admin/offers/" + draftId, "PUT", input);
      return draftId;
    }
    const r = await api("admin/offers", "POST", input);
    setDraftId(r._id);
    return r._id;
  }
  async function showPreview() {
    const id = await save();
    const p = await api(`admin/offers/${id}/preview`);
    setPreview(p);
    setPreviewTier(p.tiers[0].name);
    setPreviewMonths(p.tiers[0].rules[0].months);
    setMessage("הטיוטה נשמרה. בדקו את כל המסלולים וההסכם לפני פרסום.");
  }
  const enabled = form.tiers.map((t) => t.name),
    source = catalog?.find((c) => c._id === form.product),
    published = doc && doc.status !== "draft",
    pq = preview?.quotes.find(
      (q) => q.tier === previewTier && q.months === previewMonths,
    );
  if (published)
    return (
      <>
        <h1>{doc.input.title}</h1>
        <Notice>
          הצעה שפורסמה קפואה. שינוי תנאים מחייב גרסה חדשה וקבלה חדשה מצד הלקוח.
        </Notice>
        <section className="lt-card">
          <p>מצב: {doc.state}</p>
          {link && (
            <>
              <Field label="קישור ללקוח — בחירת מסלול וחתימה">
                <input
                  id="published-offer-link"
                  readOnly
                  value={link}
                  dir="ltr"
                />
              </Field>
              <button
                onClick={() =>
                  run(async () => {
                    await navigator.clipboard.writeText(link);
                    setMessage("הקישור הועתק");
                  })
                }
              >
                העתקת קישור
              </button>
              <a
                className="lt-button secondary"
                target="_blank"
                rel="noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent("היי, הכנו עבורך הצעה אישית מ־Luxury Tech. לצפייה וחתימה: " + link)}`}
              >
                הודעה מוכנה ל־WhatsApp
              </a>
            </>
          )}
          <button
            className="secondary"
            onClick={() =>
              run(async () => {
                const r = await api(
                  `admin/offers/${doc._id}/duplicate`,
                  "POST",
                  {},
                );
                router.push("/admin/offers/" + r._id);
              })
            }
          >
            יצירת גרסה חדשה
          </button>
          {doc.contractId && (
            <Link
              className="lt-button"
              href={"/admin/contracts/" + doc.contractId}
            >
              צפייה בהסכם
            </Link>
          )}
          <p className="lt-pre">הערות פנימיות: {doc.input.internalNotes}</p>
        </section>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
      </>
    );
  return (
    <>
      <div className="lt-page-heading">
        <h1>{draftId ? "עריכת טיוטה" : "הצעה אישית חדשה"}</h1>
        <p>מחירים, היקף ותנאים לכל לקוח. לאחר פרסום נשמרת גרסה קפואה.</p>
      </div>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(showPreview);
        }}
      >
        <section className="lt-card">
          <h2>לקוח ופרויקט</h2>
          <div className="lt-form-grid">
            <Field label="כותרת ההצעה">
              <input
                required
                maxLength={200}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="תווית לקוח פנימית">
              <input
                maxLength={200}
                value={form.clientLabel}
                onChange={(e) => set("clientLabel", e.target.value)}
              />
            </Field>
            <Field label="דוא״ל הנמען (לקבלת עותק)">
              <input
                required
                type="email"
                autoComplete="off"
                dir="ltr"
                value={form.recipientEmail}
                onChange={(e) => set("recipientEmail", e.target.value)}
              />
            </Field>
            <Field label="מוצר">
              <select
                value={form.product}
                onChange={(e) => {
                  setForm({ ...form, product: e.target.value, tiers: [] });
                  setPreview(undefined);
                }}
              >
                <option value="ecommerce">חנות מסחר אלקטרוני</option>
                <option value="management">מערכת ניהול עסקי</option>
              </select>
            </Field>
            <Field label="תוקף הצעה">
              <input
                required
                type="datetime-local"
                value={form.expires ? localInput(form.expires) : ""}
                onChange={(e) => set("expires", e.target.value)}
              />
            </Field>
          </div>
        </section>
        <section className="lt-card">
          <h2>התחייבות והנחות להצעה</h2>
          <DiscountRules
            value={form.rules || settings.rules}
            onChange={(r) => {
              setForm({
                ...form,
                rules: r,
                tiers: form.tiers.map((t) => ({
                  ...t,
                  rules: r.map((r) => ({ ...r })),
                })),
              });
              setPreview(undefined);
            }}
          />
          <p>
            שינוי כאן מעתיק את הכללים למסלולים שבחרתם. לאחר מכן אפשר לשנות כל
            מסלול בנפרד. אחוז 0 מאפשר הצעה ללא הנחה.
          </p>
          <label className="lt-check">
            <input
              type="checkbox"
              checked={form.discountSetup}
              onChange={(e) => set("discountSetup", e.target.checked)}
            />
            אישור מפורש: ההנחה תחול גם על דמי ההקמה
          </label>
        </section>
        <section className="lt-card">
          <h2>מסלולים מאושרים ללקוח</h2>
          {source?.tiers.map((t) => {
            const active = form.tiers.find((p) => p.name === t.name);
            return (
              <div className="lt-tier-editor" key={t.name}>
                <label className="lt-check">
                  <input
                    type="checkbox"
                    checked={enabled.includes(t.name)}
                    onChange={(e) =>
                      set(
                        "tiers",
                        e.target.checked
                          ? [
                              ...form.tiers,
                              {
                                ...t,
                                approved: false,
                                rules: (form.rules || settings.rules).map(
                                  (r) => ({ ...r }),
                                ),
                                exclusions: "",
                                support: "",
                                limits: "",
                              },
                            ]
                          : form.tiers.filter((p) => p.name !== t.name),
                      )
                    }
                  />
                  <strong>{t.name}</strong> — ברירת מחדל {money(t.monthly)}{" "}
                  לחודש + {money(t.setup)} הקמה
                </label>
                {active && (
                  <>
                    <div className="lt-form-grid">
                      <Field label="הקמה / פיתוח ₪">
                        <input
                          required
                          type="number"
                          min="1"
                          max="1000000"
                          step="1"
                          value={active.setup / 100}
                          onChange={(e) =>
                            tierUpdate(
                              t.name,
                              "setup",
                              Math.round(Number(e.target.value) * 100),
                            )
                          }
                        />
                      </Field>
                      <Field label="שירות חודשי ₪">
                        <input
                          required
                          type="number"
                          min="1"
                          max="1000000"
                          step="1"
                          value={active.monthly / 100}
                          onChange={(e) =>
                            tierUpdate(
                              t.name,
                              "monthly",
                              Math.round(Number(e.target.value) * 100),
                            )
                          }
                        />
                      </Field>
                    </div>
                    <PriceRounding
                      setup={active.setup}
                      monthly={active.monthly}
                      onChange={(setup, monthly) =>
                        set(
                          "tiers",
                          form.tiers.map((tier) =>
                            tier.name === t.name
                              ? { ...tier, setup, monthly }
                              : tier,
                          ),
                        )
                      }
                    />
                    <DiscountRules
                      value={active.rules}
                      onChange={(v) => tierUpdate(t.name, "rules", v)}
                    />
                    <Field label="רכיבים כלולים (שורה לכל רכיב)">
                      <textarea
                        value={active.features.join("\n")}
                        onChange={(e) =>
                          tierUpdate(
                            t.name,
                            "features",
                            e.target.value.split("\n"),
                          )
                        }
                      />
                    </Field>
                    {[
                      ["limits", "כמויות ומגבלות"],
                      ["exclusions", "החרגות"],
                      ["support", "רמת תמיכה, זמני מענה וחריגים"],
                    ].map(([key, label]) => (
                      <Field key={key} label={label}>
                        <textarea
                          required
                          maxLength={16000}
                          value={active[key]}
                          onChange={(e) =>
                            tierUpdate(t.name, key, e.target.value)
                          }
                        />
                      </Field>
                    ))}
                    {t.name === "CUSTOM" && (
                      <label className="lt-check">
                        <input
                          required
                          type="checkbox"
                          checked={active.approved}
                          onChange={(e) =>
                            tierUpdate(t.name, "approved", e.target.checked)
                          }
                        />
                        תמחור והיקף CUSTOM אושרו פרטנית
                      </label>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </section>
        <ProjectScopeEditor
          pages={form.pages}
          details={form.projectDetails}
          product={form.product}
          onChange={(pages, projectDetails) => {
            setForm((v) => ({ ...v, pages, projectDetails }));
            setPreview(undefined);
          }}
        />
        <section className="lt-card">
          <h2>היקף ותנאי התקשרות</h2>
          {Object.entries(paragraphLabels).map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea
                required={
                  ![
                    "internalNotes",
                    "thirdPartyCosts",
                    "milestones",
                    "description",
                  ].includes(key)
                }
                maxLength={16000}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          ))}
        </section>
        <section className="lt-card">
          <h2>תוספות חד־פעמיות ונספחים</h2>
          <p>
            תוספות מחויבות פעם אחת, ללא הנחת התחייבות. עלויות חודשיות מאושרות יש
            לכלול במחיר החודשי של המסלול ובהיקף.
          </p>
          {form.addons.map((a, i) => (
            <div className="lt-inline" key={i}>
              <Field label="תיאור תוספת">
                <input
                  required
                  maxLength={200}
                  value={a.label}
                  onChange={(e) =>
                    set(
                      "addons",
                      form.addons.map((a, j) =>
                        i === j ? { ...a, label: e.target.value } : a,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="מחיר ₪">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={a.amount / 100}
                  onChange={(e) =>
                    set(
                      "addons",
                      form.addons.map((a, j) =>
                        i === j
                          ? {
                              ...a,
                              amount: Math.round(Number(e.target.value) * 100),
                            }
                          : a,
                      ),
                    )
                  }
                />
              </Field>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  set(
                    "addons",
                    form.addons.filter((_, j) => i !== j),
                  )
                }
              >
                הסרה
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            onClick={() =>
              set("addons", [...form.addons, { label: "", amount: 0 }])
            }
          >
            הוספת עלות חד־פעמית
          </button>
          <Field label="צירוף PDF מאושר (עד 2MB)">
            <input
              type="file"
              accept="application/pdf"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                run(async () => {
                  if (file.size > 2 * 1024 * 1024)
                    throw Error("הקובץ גדול מ־2MB");
                  const data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () =>
                      resolve(String(reader.result).split(",")[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });
                  const a = await api("admin/attachments", "POST", {
                    label: file.name,
                    data,
                  });
                  set("attachments", [...form.attachments, a.id]);
                });
              }}
            />
          </Field>
          {form.attachments.map((id, i) => (
            <p key={id}>
              נספח {i + 1} · <bdi>{id}</bdi>{" "}
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  set(
                    "attachments",
                    form.attachments.filter((x) => x !== id),
                  )
                }
              >
                הסרת נספח
              </button>
            </p>
          ))}
        </section>
        <section className="lt-card">
          <h2>מסים</h2>
          <div className="lt-form-grid">
            <Field label="טיפול במס">
              <select
                required
                value={form.tax.mode}
                onChange={(e) =>
                  set("tax", { ...form.tax, mode: e.target.value })
                }
              >
                <option value="">בחרו במפורש</option>
                <option value="inclusive">המחירים כוללים מס</option>
                <option value="exclusive">מס נוסף למחירים</option>
                <option value="exempt">פטור ממס</option>
              </select>
            </Field>
            {form.tax.mode !== "exempt" && (
              <Field label="שיעור מס %">
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.tax.bps / 100}
                  onChange={(e) =>
                    set("tax", {
                      ...form.tax,
                      bps: Math.round(Number(e.target.value) * 100),
                    })
                  }
                />
              </Field>
            )}
          </div>
        </section>
        <button disabled={busy || !form.tiers.length}>
          {busy ? "שומר ובודק…" : "שמירת טיוטה ותצוגה מקדימה"}
        </button>
      </form>
      {preview && (
        <section className="lt-card lt-admin-preview">
          <h2>תצוגה מקדימה לפני פרסום</h2>
          <OfferSelection
            snapshot={preview}
            tier={previewTier}
            months={previewMonths}
            onChange={(v) => {
              setPreviewTier(v.tier);
              setPreviewMonths(v.months);
            }}
          />
          {pq && <QuoteCard snapshot={preview} quote={pq} />}
          <ProjectScope snapshot={preview} tier={previewTier} />
          <iframe
            title="תצוגה מקדימה של ההסכם"
            className="lt-agreement lt-document-preview"
            src={`/api/admin/offers/${draftId}/preview?format=agreement&tier=${previewTier}&months=${previewMonths}`}
            key={preview.digest + previewTier + previewMonths}
          />
          <a
            className="lt-button secondary"
            target="_blank"
            rel="noreferrer"
            href={`/admin/offers/${draftId}/preview?tier=${previewTier}&months=${previewMonths}`}
          >
            פתיחת תצוגת לקוח אינטראקטיבית
          </a>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                const result = await api(
                  `admin/offers/${draftId}/publish`,
                  "POST",
                  { previewDigest: preview.digest },
                );
                setLink(location.origin + result.url);
                router.push("/admin/offers/" + draftId);
              })
            }
          >
            פרסום הצעה קפואה ויצירת קישור
          </button>
        </section>
      )}
    </>
  );
}
function localInput(value: string) {
  if (!value.endsWith("Z")) return value;
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
