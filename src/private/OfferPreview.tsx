import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Snapshot, Offer } from "./types";
import { api, Notice, QuoteCard, Field } from "./shared";
import OfferSelection from "./OfferSelection";

export default function OfferPreview({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [selection, setSelection] = useState({ tier: "", months: 0 });
  const [error, setError] = useState("");
  const [offer, setOffer] = useState<Offer>();
  const [customerUrl, setCustomerUrl] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api(`admin/offers/${offerId}`)
      .then((o: Offer) => {
        if (!active) return;
        setOffer(o);
        setCustomerUrl(o.url ? location.origin + o.url : "");
      })
      .catch((e) => active && setError(e.message));
    api(`admin/offers/${offerId}/preview`)
      .then((s: Snapshot) => {
        if (!active) return;
        const tier =
          s.tiers.find((t) => t.name === router.query.tier) || s.tiers[0];
        const months =
          tier.rules.find((r) => r.months === Number(router.query.months))
            ?.months || tier.rules[0].months;
        setSnapshot(s);
        setSelection({ tier: tier.name, months });
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [offerId, router.query.tier, router.query.months]);
  if (error && !snapshot) return <Notice error>{error}</Notice>;
  if (!snapshot) return <Notice>טוען את ההצעה…</Notice>;
  const tier = snapshot.tiers.find((t) => t.name === selection.tier);
  const quote = snapshot.quotes.find(
    (q) => q.tier === selection.tier && q.months === selection.months,
  );
  const agreement = `/api/admin/offers/${offerId}/preview?format=agreement&tier=${selection.tier}&months=${selection.months}`;
  return (
    <>
      {error && <Notice error>{error}</Notice>}
      <div className="lt-page-heading">
        <span className="lt-tag">תצוגת לקוח אינטראקטיבית</span>
        <h1>{snapshot.title}</h1>
        <p>{snapshot.description}</p>
      </div>
      <Notice>
        כל המסלולים שסימנתם מוצגים כאן. הלקוח יבחר מסלול ותקופה בעצמו בקישור
        ההצעה שיתקבל לאחר הפרסום. זו תצוגת מנהל; לא מתבצעת כאן חתימה.
      </Notice>
      {customerUrl && (
        <section className="lt-card">
          <Field label="קישור ללקוח — בחירת מסלול וחתימה">
            <input readOnly dir="ltr" value={customerUrl} />
          </Field>
          <a
            className="lt-button"
            target="_blank"
            rel="noreferrer"
            href={customerUrl}
          >
            פתיחת הצעת הלקוח
          </a>
        </section>
      )}
      <OfferSelection
        snapshot={snapshot}
        {...selection}
        onChange={setSelection}
      />
      <div className="lt-two-col">
        <section className="lt-card">
          <h2>מה כלול במסלול {tier.name}?</h2>
          <ul>
            {tier.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <h3>כמויות ומגבלות</h3>
          <p className="lt-pre">{tier.limits}</p>
          <h3>תמיכה</h3>
          <p className="lt-pre">{tier.support}</p>
          <h3>החרגות</h3>
          <p className="lt-pre">{tier.exclusions}</p>
          <h3>היקף הפרויקט</h3>
          <p className="lt-pre">{snapshot.scope}</p>
          <h3>מסירה</h3>
          <p className="lt-pre">{snapshot.delivery}</p>
        </section>
        <QuoteCard snapshot={snapshot} quote={quote} />
      </div>
      <section className="lt-card lt-admin-preview">
        <h2>
          הסכם לפי הבחירה: {tier.name} · {selection.months} חודשים
        </h2>
        <p>
          המסמך מתעדכן לפי המסלול והתקופה שנבחרו למעלה. בחירת תצוגה אינה מסירה
          את יתר האפשרויות מההצעה.
        </p>
        <iframe
          title="תצוגה מקדימה של ההסכם"
          className="lt-agreement lt-document-preview"
          src={agreement}
          key={agreement}
        />
        <Link className="lt-button" href={`/admin/offers/${offerId}`}>
          חזרה לעריכה ולפרסום קישור ללקוח
        </Link>
        {!customerUrl && offer?.status === "draft" && (
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const r = await api(`admin/offers/${offerId}/publish`, "POST", {
                  previewDigest: snapshot.digest,
                });
                setCustomerUrl(location.origin + r.url);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "מפרסם…" : "פרסום כל האפשרויות ויצירת קישור ללקוח"}
          </button>
        )}
        <p>
          כל המסלולים המוצגים יישארו לבחירת הלקוח. בחירת מסלול להדמיה כאן אינה
          בוחרת אותו עבור הלקוח.
        </p>
      </section>
    </>
  );
}
