import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Field, Notice } from "./shared";

export default function QuickOffer() {
  const [name, setName] = useState("");
  const [product, setProduct] = useState("ecommerce");
  const [tax, setTax] = useState<{ mode: string; bps: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{ _id: string; previewDigest: string }>();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    api("admin/offers/quick-defaults")
      .then((d) => setTax(d.tax))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section className="lt-card lt-quick-offer">
      <h2>הצעה מהירה — שם וקישור</h2>
      <p>
        STARTER ו-PRO לבחירת הלקוח, במחירי המחירון ובהנחות שהגדרתם. כולל עמודים,
        מסכי ניהול והסכם ברירת מחדל. תוקף הקישור: 14 ימים. CUSTOM זמין בעורך
        המלא באישור פרטני.
      </p>
      {error && <Notice error>{error}</Notice>}
      {url ? (
        <>
          <Notice>
            ההצעה מוכנה. שלחו ללקוח את הקישור באופן ידני; הוא יוכל לבחור מסלול
            ותקופת התחייבות מיד.
          </Notice>
          <Field label="קישור ההצעה המהירה">
            <input
              dir="ltr"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
            />
          </Field>
          <div className="lt-actions">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                } catch {
                  setError("אפשר לסמן ולהעתיק את הקישור מהשדה.");
                }
              }}
            >
              {copied ? "הקישור הועתק" : "העתקת קישור"}
            </button>
            <a
              className="secondary"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              פתיחת ההצעה
            </a>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setUrl("");
                setName("");
                setDraft(undefined);
                setCopied(false);
              }}
            >
              הצעה מהירה נוספת
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const current =
                draft ||
                (await api("admin/offers/quick", "POST", {
                  clientLabel: name,
                  product,
                  tax,
                }));
              setDraft(current);
              const result = await api(
                `admin/offers/${current._id}/publish`,
                "POST",
                { previewDigest: current.previewDigest },
              );
              setUrl(location.origin + result.url);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy || !!draft} className="lt-builder-fieldset">
            <div className="lt-form-grid">
              <Field label="שם לקוח להצעה מהירה">
                <input
                  required
                  maxLength={200}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="שירות להצעה מהירה">
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  <option value="ecommerce">חנות מסחר אלקטרוני</option>
                  <option value="management">מערכת ניהול</option>
                </select>
              </Field>
            </div>
            <Field label="טיפול במס להצעה מהירה">
              <select
                required
                value={tax ? `${tax.mode}:${tax.bps}` : ""}
                onChange={(e) => {
                  const [mode, bps] = e.target.value.split(":");
                  setTax({ mode, bps: Number(bps) });
                }}
              >
                <option value="">הגדירו פעם ראשונה טיפול במס</option>
                {tax &&
                  !["inclusive:1800", "exclusive:1800", "exempt:0"].includes(
                    `${tax.mode}:${tax.bps}`,
                  ) && (
                    <option value={`${tax.mode}:${tax.bps}`}>
                      ההגדרה מההצעה האחרונה: {tax.mode} · {tax.bps / 100}%
                    </option>
                  )}
                <option value="inclusive:1800">כולל מע״מ 18%</option>
                <option value="exclusive:1800">בתוספת מע״מ 18%</option>
                <option value="exempt:0">פטור ממע״מ</option>
              </select>
            </Field>
            <p>
              ברירת המחדל למס נלקחת מההצעה האחרונה שפורסמה. מסירה: 30 ימי עבודה
              לאחר קבלת החומרים והתשלום; 3 סבבי תיקונים; 55% מקדמה ו-45% לפני
              עלייה לאוויר. הקישור אינו נשלח אוטומטית.
            </p>
          </fieldset>
          <button disabled={busy || !tax} type="submit">
            {busy
              ? "יוצר קישור…"
              : draft
                ? "ניסיון נוסף לפרסום ההצעה"
                : "יצירת הצעת ברירת מחדל וקישור"}
          </button>
          {draft && (
            <p>
              <Link href={`/admin/offers/${draft._id}`}>
                פתיחת הטיוטה בעורך המלא
              </Link>
            </p>
          )}
        </form>
      )}
    </section>
  );
}
