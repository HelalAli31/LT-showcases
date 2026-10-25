import OfferSelection from "./OfferSelection";
import ProjectScope from "./ProjectScope";
import type { OfferAccess, Contract, RequestError } from "./types";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { api, Shell, Field, Notice, Otp, QuoteCard, money } from "./shared";
function Signature({ onChange }: { onChange: (v: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null),
    drawing = useRef(false),
    moved = useRef(false);
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = ref.current!,
      r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  }
  return (
    <div>
      <canvas
        ref={ref}
        width={800}
        height={240}
        aria-label="משטח חתימה"
        className="lt-signature"
        onPointerDown={(e) => {
          drawing.current = true;
          moved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = point(e),
            ctx = ref.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const p = point(e),
            ctx = ref.current!.getContext("2d")!;
          ctx.strokeStyle = "#111";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          moved.current = true;
        }}
        onPointerUp={() => {
          drawing.current = false;
          if (moved.current) onChange(ref.current!.toDataURL("image/png"));
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      <button
        type="button"
        className="secondary"
        onClick={() => {
          ref.current!.getContext("2d")!.clearRect(0, 0, 800, 240);
          onChange("");
        }}
      >
        ניקוי חתימה
      </button>
      <p>
        חתמו באמצעות עכבר או מגע. אפשר לפנות לספק לקבלת דרך חתימה נגישה חלופית.
      </p>
    </div>
  );
}
export default function Customer() {
  const router = useRouter(),
    token = String(router.query.token || ""),
    contractAccess = String(router.query.id || ""),
    base = contractAccess
      ? "contract-access/" + contractAccess
      : "offers/" + token;
  const [verified, setVerified] = useState(false),
    [data, setData] = useState<OfferAccess>(),
    [tier, setTier] = useState(""),
    [months, setMonths] = useState(0),
    [agreement, setAgreement] = useState<{
      html: string;
      digest: string;
      mode: string;
    }>(),
    [reviewed, setReviewed] = useState(false),
    [signature, setSignature] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [contract, setContract] = useState<Contract>(),
    [confirm, setConfirm] = useState(false);
  const [signer, setSigner] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    registrationId: "",
    company: false,
    role: "",
    authority: false,
    acceptAgreement: false,
    acceptPrivacy: false,
    confirmSignature: false,
  });
  const key = useRef("");
  const s = data?.snapshot,
    p = s?.tiers.find((p) => p.name === tier),
    q = s?.quotes.find((q) => q.tier === tier && q.months === months);
  const load = useCallback(async () => {
    setError("");
    try {
      if (contractAccess) {
        setContract(await api("customer/contracts/" + contractAccess));
        setVerified(true);
        return;
      }
      const d = await api(base);
      setVerified(true);
      if (d.contractId) {
        setContract(await api(base + "/contract"));
        return;
      }
      setData(d);
      setTier(d.snapshot.tiers[0].name);
      setMonths(d.snapshot.tiers[0].rules[0].months);
    } catch (e) {
      if ((e as RequestError).status !== 401) setError((e as Error).message);
    }
  }, [base, contractAccess]);
  useEffect(() => {
    if (router.isReady) load();
  }, [router.isReady, load]);
  useEffect(() => {
    if (agreement) {
      const frame = requestAnimationFrame(() => {
        document
          .getElementById("agreement")
          ?.scrollIntoView({ block: "start" });
        document
          .getElementById("agreement-heading")
          ?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [agreement]);
  useEffect(() => {
    if (contract) window.scrollTo({ top: 0 });
  }, [contract]);
  useEffect(() => {
    setAgreement(undefined);
    setReviewed(false);
    setSignature("");
    setConfirm(false);
    setSigner((v) => ({
      ...v,
      acceptAgreement: false,
      acceptPrivacy: false,
      confirmSignature: false,
    }));
    key.current = "";
  }, [tier, months]);
  const update = (k: string, v: string | boolean) =>
    setSigner((s) => ({ ...s, [k]: v }));
  async function review() {
    setBusy(true);
    setError("");
    try {
      const result = await api(
        `${base}/agreement?tier=${tier}&months=${months}`,
      );
      setAgreement(result);
      setData((d) => (d ? { ...d, mode: result.mode } : d));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function sign() {
    setBusy(true);
    setError("");
    key.current ||= crypto.randomUUID();
    try {
      await api(base + "/sign", "POST", {
        ...signer,
        signature,
        tier,
        months,
        agreementDigest: agreement.digest,
        mode: agreement.mode,
        idempotencyKey: key.current,
      });
      setContract(await api(base + "/contract"));
      setConfirm(false);
    } catch (e) {
      setError((e as Error).message);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      {error && <Notice error>{error}</Notice>}
      {contract ? (
        <section className="lt-card lt-auth">
          <p className="lt-eyebrow">המסמך נשמר</p>
          <h1>
            {contract.mode === "test"
              ? "חתימת הבדיקה הושלמה"
              : "ההסכם נחתם בהצלחה"}
          </h1>
          <p>
            מספר הסכם: <bdi>{contract._id}</bdi>
          </p>
          <p>
            העותק והראיות נשמרו באופן מאובטח. סטטוס הודעות לספק וללקוח מנוהל
            בנפרד.
          </p>
          {contract.mode === "test" && (
            <Notice>מסמך בדיקה בלבד — אינו הסכם מחייב.</Notice>
          )}
          <a
            className="lt-button"
            href={
              contractAccess
                ? `/api/customer/contracts/${contract._id}/pdf`
                : `/api/${base}/contract/pdf`
            }
          >
            הורדת העתק ההסכם
          </a>
        </section>
      ) : !verified ? (
        contractAccess ? (
          <Otp base={base} onVerified={load} />
        ) : (
          <Notice>טוען את ההצעה שלך…</Notice>
        )
      ) : !s ? (
        <Notice>טוען הצעה…</Notice>
      ) : (
        <>
          <div className="lt-page-heading">
            <p className="lt-eyebrow">הצעה שהוכנה עבורך</p>
            <h1>המסלול שמתאים לעסק שלך</h1>
            <p className="lt-customer-title">{s.title}</p>
            <p>בוחרים מסלול ותקופה, בודקים את הסיכום וחותמים.</p>
          </div>
          {data.mode === "test" && (
            <Notice>סביבת בדיקה — חתימה כאן תפיק מסמך בדיקה בלבד.</Notice>
          )}
          <OfferSelection
            snapshot={s}
            tier={tier}
            months={months}
            onChange={(v) => {
              setTier(v.tier);
              setMonths(v.months);
            }}
          />
          <div className="lt-customer-summary">
            <QuoteCard snapshot={s} quote={q} compact />
            <div>
              <details className="lt-card lt-more-details">
                <summary>מה כלול? עמודים, שירות ותנאים</summary>
                <h2>מה כלול במסלול {tier}?</h2>
                <ul>
                  {p.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <p>{p.limits}</p>
                <ProjectScope snapshot={s} tier={tier} />
                <h2>היקף העבודה</h2>
                <p className="lt-pre">{s.scope}</p>
                <h3>אבני דרך ומסירה</h3>
                <p className="lt-pre">
                  {s.milestones}
                  {"\n"}
                  {s.delivery}
                </p>
                <h3>תמיכה והחרגות</h3>
                <p className="lt-pre">
                  {p.support}
                  {"\n"}
                  {p.exclusions}
                </p>
                <h3>תשלום, ביטול ועלויות נוספות</h3>
                <p className="lt-pre">
                  {s.paymentTerms}
                  {"\n"}
                  {s.cancellation}
                  {"\n"}
                  {s.thirdPartyCosts}
                </p>
                {s.attachments?.length > 0 && (
                  <>
                    <h3>נספחים מאושרים</h3>
                    {s.attachments.map((a) => (
                      <p key={a.id}>
                        <a href={`/api/offers/${token}/attachments/${a.id}`}>
                          {a.label}
                        </a>
                      </p>
                    ))}
                  </>
                )}
              </details>
            </div>
          </div>
          {!agreement && (
            <div className="lt-customer-next">
              <span>
                <strong>{money(q.monthly)}</strong> לחודש · {tier} · {months}{" "}
                חודשים
              </span>
              <button
                disabled={busy}
                onClick={review}
                aria-label="עיון בהסכם המלא והמשך לחתימה"
              >
                {busy ? "טוען…" : "להסכם ולחתימה ←"}
              </button>
            </div>
          )}
          {agreement && (
            <section className="lt-card" id="agreement">
              <h2 id="agreement-heading" tabIndex={-1}>
                3. בדיקה וחתימה
              </h2>
              <iframe
                className="lt-agreement"
                title="ההסכם המלא"
                sandbox=""
                srcDoc={agreement.html}
              />
              <label className="lt-check">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                קראתי את ההסכם המלא ואת נספחי ההצעה
              </label>
              {reviewed && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (signature) setConfirm(true);
                    else setError("נדרשת חתימה על המשטח");
                  }}
                >
                  <h2>פרטי החותם</h2>
                  <div className="lt-form-grid">
                    <Field label="שם מלא">
                      <input
                        required
                        autoComplete="name"
                        maxLength={200}
                        value={signer.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                      />
                    </Field>
                    <Field label="טלפון">
                      <input
                        required
                        autoComplete="tel"
                        minLength={7}
                        maxLength={30}
                        value={signer.phone}
                        onChange={(e) => update("phone", e.target.value)}
                      />
                    </Field>
                    <Field label="שם העסק (אם קיים)">
                      <input
                        maxLength={200}
                        value={signer.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                      />
                    </Field>
                  </div>
                  <label className="lt-check">
                    <input
                      type="checkbox"
                      checked={signer.company}
                      onChange={(e) => update("company", e.target.checked)}
                    />
                    אני חותם בשם חברה
                  </label>
                  {signer.company && (
                    <div className="lt-form-grid">
                      <Field label="תפקיד">
                        <input
                          required
                          maxLength={100}
                          value={signer.role}
                          onChange={(e) => update("role", e.target.value)}
                        />
                      </Field>
                      <Field label="מספר רישום חברה (אם נדרש להסכם)">
                        <input
                          maxLength={40}
                          value={signer.registrationId}
                          onChange={(e) =>
                            update("registrationId", e.target.value)
                          }
                        />
                      </Field>
                      <label className="lt-check">
                        <input
                          type="checkbox"
                          required
                          checked={signer.authority}
                          onChange={(e) =>
                            update("authority", e.target.checked)
                          }
                        />
                        אני מוסמך לחתום ולחייב את החברה
                      </label>
                    </div>
                  )}
                  <Notice>{s.privacyNotice}</Notice>
                  <label className="lt-check">
                    <input
                      required
                      type="checkbox"
                      checked={signer.acceptAgreement}
                      onChange={(e) =>
                        update("acceptAgreement", e.target.checked)
                      }
                    />
                    אני מקבל במפורש את ההסכם ואת ההיקף והמחירים שנבחרו
                  </label>
                  <label className="lt-check">
                    <input
                      required
                      type="checkbox"
                      checked={signer.acceptPrivacy}
                      onChange={(e) =>
                        update("acceptPrivacy", e.target.checked)
                      }
                    />
                    קראתי ומאשר את הודעת הפרטיות ואת עיבוד הנתונים הנדרש
                    להתקשרות
                  </label>
                  <h3>חתימה</h3>
                  <Signature onChange={setSignature} />
                  <label className="lt-check">
                    <input
                      required
                      type="checkbox"
                      checked={signer.confirmSignature}
                      onChange={(e) =>
                        update("confirmSignature", e.target.checked)
                      }
                    />
                    זו חתימתי ואני מבקש לחתום על הגרסה שהוצגה לי
                  </label>
                  <button disabled={busy}>
                    {data.mode === "test"
                      ? "המשך לאישור חתימת בדיקה"
                      : "המשך לאישור חתימה"}
                  </button>
                </form>
              )}
            </section>
          )}
          {confirm && (
            <div
              className="lt-modal"
              role="dialog"
              aria-modal="true"
              aria-label="אישור חתימה"
            >
              <section className="lt-card">
                <h2>אישור סופי</h2>
                <p>
                  מסלול {tier}, התחייבות ל־{months} חודשים. האישור ישמור את
                  ההסכם, חתימתך ורישום ההסכמות.
                </p>
                {data.mode === "test" && <Notice>חתימת בדיקה בלבד.</Notice>}
                <button disabled={busy} onClick={sign}>
                  {busy ? "מפיק ושומר את המסמך…" : "אני מאשר וחותם"}
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => setConfirm(false)}
                >
                  חזרה לבדיקה
                </button>
              </section>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
