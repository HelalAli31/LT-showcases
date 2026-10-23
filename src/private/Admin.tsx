import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  api,
  Shell,
  Field,
  Notice,
  DiscountRules,
  QuoteCard,
  money,
} from "./shared";
import Builder from "./Builder";
const labels: Record<string, string> = {
  draft: "טיוטה",
  sent: "נשלחה",
  viewed: "נצפתה",
  signed: "נחתמה",
  expired: "פג תוקף",
  revoked: "בוטלה",
  awaiting_payment: "ממתין לתשלום",
  paid: "שולם",
  pending: "ממתין",
  active: "פעיל",
  cancelled: "בוטל",
  not_configured: "לא מוגדר",
  accepted: "התקבל אצל הספק",
  retry: "ממתין לניסיון נוסף",
  failed: "נכשל",
  sending: "נשלח כעת",
  delivered: "נמסר לנמען",
  read: "נקרא",
  test: "בדיקה",
  production: "מחייב",
};
export const statusLabel = (s: string) => labels[s] || s;
const localDate = (s: string) =>
  new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(s));
export default function Admin() {
  const router = useRouter(),
    path = (router.query.path || []) as string[],
    section = path[0] || "dashboard";
  const [settings, setSettings] = useState<any>(),
    [error, setError] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setSettings(await api("admin/settings"));
    } catch (e) {
      if ((e as any).status !== 401) setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <Shell admin>
      {error && <Notice error>{error}</Notice>}
      {loading ? (
        <Notice>טוען…</Notice>
      ) : !settings ? (
        <section className="lt-card lt-auth">
          <p className="lt-eyebrow">כניסת מנהל</p>
          <h1>הצעות שמובילות להסכמות</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api("login", "POST", { password });
                setPassword("");
                await load();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="סיסמת מנהל">
              <input
                type="password"
                required
                autoComplete="current-password"
                maxLength={256}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <button disabled={busy}>{busy ? "מתחבר…" : "כניסה מאובטחת"}</button>
          </form>
        </section>
      ) : (
        <>
          <div className="lt-admin-top">
            <span>{settings.businessName}</span>
            <button
              className="secondary"
              onClick={async () => {
                await api("logout", "POST", {});
                setSettings(undefined);
              }}
            >
              יציאה
            </button>
          </div>
          {!settings.capabilities.binding && (
            <Notice>
              מצב בדיקה פעיל. הסכמים מחייבים דורשים אישור משפטי והפעלה בהגדרות
              הפריסה.
            </Notice>
          )}
          {section === "dashboard" ? (
            <Dashboard />
          ) : section === "offers" ? (
            path[1] && path[1] !== "list" ? (
              <Builder
                offerId={path[1] === "new" ? undefined : path[1]}
                settings={settings}
              />
            ) : (
              <Offers />
            )
          ) : section === "pricing" ? (
            <Pricing />
          ) : section === "settings" ? (
            <Settings value={settings} onSaved={load} />
          ) : section === "contract-templates" ? (
            <Templates />
          ) : section === "contracts" ? (
            <Contracts key={path[1] || 'list'} contractId={path[1]} />
          ) : (
            <Notice>העמוד לא נמצא</Notice>
          )}
        </>
      )}
    </Shell>
  );
}
function useLoad(path: string) {
  const [data, setData] = useState<any>(),
    [error, setError] = useState("");
  const reload = async () => {
    try {
      setData(await api(path));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    reload();
  }, [path]);
  return { data, error, reload, setError };
}
function Dashboard() {
  const { data, error } = useLoad("admin/dashboard");
  return (
    <>
      <h1>סקירה כללית</h1>
      {error && <Notice error>{error}</Notice>}
      {data && (
        <>
          <div className="lt-stats">
            {Object.entries({
              ...data.counts,
              awaiting_payment: data.awaitingPayment,
            }).map(([k, v]) => (
              <div className="lt-card" key={k}>
                <span>{k === "total" ? "כל ההצעות" : statusLabel(k)}</span>
                <strong>{String(v)}</strong>
              </div>
            ))}
          </div>
          <section className="lt-card">
            <h2>פעילות אחרונה</h2>
            {data.activity.map((a) => (
              <p key={a._id}>
                <bdi>{a.action}</bdi> · {localDate(a.at)} ·{" "}
                <bdi>{a.subject}</bdi>
              </p>
            ))}
          </section>
        </>
      )}
    </>
  );
}
function Offers() {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [query, setQuery] = useState("");
  const { data, error, reload, setError } = useLoad("admin/offers" + query);
  const router = useRouter();
  async function action(id: string, kind: string) {
    try {
      const r = await api(`admin/offers/${id}/${kind}`, "POST", {});
      if (kind === "duplicate") router.push("/admin/offers/" + r._id);
      else reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="lt-page-heading">
        <h1>הצעות אישיות</h1>
        <Link className="lt-button" href="/admin/offers/new">
          יצירת הצעה
        </Link>
      </div>
      {error && <Notice error>{error}</Notice>}
      <form
        className="lt-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(`?q=${encodeURIComponent(q)}&status=${status}`);
        }}
      >
        <Field label="חיפוש לקוח / הצעה">
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
        <Field label="מצב">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">כל המצבים</option>
            {["draft", "sent", "viewed", "signed", "expired", "revoked"].map(
              (s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ),
            )}
          </select>
        </Field>
        <button>חיפוש</button>
      </form>
      <div className="lt-table-wrap">
        <table>
          <thead>
            <tr>
              <th>הצעה</th>
              <th>לקוח</th>
              <th>מצב</th>
              <th>נוצרה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((o) => (
              <tr key={o._id}>
                <td>
                  <Link href={"/admin/offers/" + o._id}>{o.input.title}</Link>
                </td>
                <td>
                  {o.input.clientLabel}
                  <br />
                  <bdi>{o.input.recipientEmail}</bdi>
                </td>
                <td>{statusLabel(o.state)}</td>
                <td>{localDate(o.createdAt)}</td>
                <td>
                  <button
                    className="secondary"
                    onClick={() => action(o._id, "duplicate")}
                  >
                    שכפול / גרסה חדשה
                  </button>
                  {!["signed", "revoked"].includes(o.state) && (
                    <button
                      className="danger"
                      onClick={() => {
                        if (window.confirm("לבטל את הגישה להצעה זו?"))
                          action(o._id, "revoke");
                      }}
                    >
                      ביטול
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.length === 0 && <Notice>אין הצעות להצגה</Notice>}
      </div>
    </>
  );
}
function Pricing() {
  const { data: catalog, error, setError, reload } = useLoad("admin/catalog");
  const [rules, setRules] = useState<any[]>(),
    [message, setMessage] = useState(""),
    [edit, setEdit] = useState<any>();
  useEffect(() => {
    api("admin/rules")
      .then(setRules)
      .catch((e) => setError(e.message));
  }, []);
  async function save(path: string, body: any) {
    try {
      await api(path, "PUT", body);
      setMessage("נשמר. הצעות שפורסמו לא השתנו.");
      setEdit(undefined);
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <h1>מחירון והנחות</h1>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <section className="lt-card">
        <h2>הנחות כלליות</h2>
        {rules && (
          <>
            <DiscountRules value={rules} onChange={setRules} />
            <button onClick={() => save("admin/rules", { rules })}>
              שמירת הנחות
            </button>
          </>
        )}
      </section>
      {catalog?.map((c) => (
        <section className="lt-card" key={c._id}>
          <h2>{c.label}</h2>
          <button
            className="secondary"
            onClick={() => setEdit(structuredClone(c))}
          >
            עריכת ברירות מחדל
          </button>
          <div className="lt-tier-grid">
            {c.tiers.map((t) => (
              <div key={t.name}>
                <h3>{t.name}</h3>
                <p>
                  הקמה {money(t.setup)} · חודשי {money(t.monthly)}
                </p>
                <ul>
                  {t.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                {t.name === "CUSTOM" && (
                  <p>מחירי התחלה בלבד; כל הצעה מחייבת אישור פרטני.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      {edit && (
        <section className="lt-card">
          <h2>עריכת {edit.label}</h2>
          {edit.tiers.map((t, i) => (
            <div key={t.name}>
              <h3>{t.name}</h3>
              <Field label="הקמה ₪">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={t.setup / 100}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      tiers: edit.tiers.map((t, j) =>
                        i === j
                          ? {
                              ...t,
                              setup: Math.round(Number(e.target.value) * 100),
                            }
                          : t,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="חודשי ₪">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={t.monthly / 100}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      tiers: edit.tiers.map((t, j) =>
                        i === j
                          ? {
                              ...t,
                              monthly: Math.round(Number(e.target.value) * 100),
                            }
                          : t,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="רכיבים (שורה לכל רכיב)">
                <textarea
                  value={t.features.join("\n")}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      tiers: edit.tiers.map((t, j) =>
                        i === j
                          ? { ...t, features: e.target.value.split("\n") }
                          : t,
                      ),
                    })
                  }
                />
              </Field>
            </div>
          ))}
          <button
            onClick={() =>
              save("admin/catalog/" + edit._id, { tiers: edit.tiers })
            }
          >
            שמירת מחירון
          </button>
        </section>
      )}
    </>
  );
}
function Settings({ value, onSaved }: { value: any; onSaved: () => void }) {
  const [form, setForm] = useState(() =>
      Object.fromEntries(
        [
          "businessName",
          "businessId",
          "businessAddress",
          "adminEmail",
          "adminPhone",
          "whatsappConsent",
          "privacyNotice",
          "retentionPolicy",
          "productionApproved",
        ].map((k) => [k, value[k]]),
      ),
    ),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <h1>הגדרות העסק</h1>
      <section className="lt-card">
        <h2>מצב חיבורים</h2>
        {Object.entries(value.capabilities).map(([k, v]) => (
          <p key={k}>
            {k}: {String(v)}
          </p>
        ))}
        <p>מפתחות וסיסמאות מוגדרים רק במשתני הסביבה של Vercel.</p>
      </section>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <form
        className="lt-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api("admin/settings", "PUT", form);
            setMessage("ההגדרות נשמרו");
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ["businessName", "שם ספק משפטי"],
          ["businessId", "מספר עוסק / חברה"],
          ["businessAddress", "כתובת העסק"],
          ["adminEmail", "דוא״ל התראות"],
          ["adminPhone", "טלפון WhatsApp בפורמט בינלאומי"],
        ].map(([k, l]) => (
          <Field key={k} label={l}>
            <input
              required
              maxLength={k === "businessAddress" ? 500 : 200}
              type={k === "adminEmail" ? "email" : "text"}
              value={String(form[k] || "")}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </Field>
        ))}
        <label className="lt-check">
          <input
            type="checkbox"
            checked={!!form.whatsappConsent}
            onChange={(e) =>
              setForm({ ...form, whatsappConsent: e.target.checked })
            }
          />
          הנמען העסקי הסכים לקבל התראות WhatsApp
        </label>
        {[
          ["privacyNotice", "הודעת פרטיות ללקוח"],
          ["retentionPolicy", "מדיניות שמירה, מחיקה ויצוא"],
        ].map(([k, l]) => (
          <Field key={k} label={l}>
            <textarea
              required
              value={String(form[k] || "")}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </Field>
        ))}
        <label className="lt-check">
          <input
            type="checkbox"
            checked={!!form.productionApproved}
            onChange={(e) =>
              setForm({ ...form, productionApproved: e.target.checked })
            }
          />
          אני מאשר שהמערכת, תהליך הראיות, הודעת הפרטיות ומדיניות השמירה נבדקו
          ואושרו להפעלה מחייבת
        </label>
        <p>
          אישור זה נפרד מאישור משפטי לכל גרסת תבנית וממשתנה
          BINDING_SIGNATURES_ENABLED בפריסה.
        </p>
        <button disabled={busy}>שמירת הגדרות</button>
      </form>
    </>
  );
}
function Templates() {
  const { data, error, reload, setError } = useLoad("admin/templates");
  const [edit, setEdit] = useState<any>(),
    [reviewer, setReviewer] = useState(""),
    [approval, setApproval] = useState<any>();
  return (
    <>
      <h1>תבניות הסכם וגרסאות</h1>
      <Notice>
        נוסחי ההתחלה הם טיוטות עבודה בלבד. יש לערוך אותם ולהעביר לעורך דין מסחרי
        ישראלי. כל שינוי נשמר כגרסה חדשה; הצעות קיימות שומרות את הנוסח המקורי.
      </Notice>
      {error && <Notice error>{error}</Notice>}
      {data?.map((t) => (
        <section className="lt-card" key={t._id}>
          <h2>
            {t.title} · גרסה {t.version}
          </h2>
          <p>
            {t.approved
              ? "אושר משפטית על ידי " + t.reviewer
              : "ממתין לבדיקה משפטית"}
          </p>
          <details>
            <summary>קריאת הנוסח</summary>
            <p className="lt-pre">{t.body}</p>
          </details>
          <button
            className="secondary"
            onClick={() =>
              setEdit({
                product: t.product,
                tier: t.tier,
                title: t.title,
                body: t.body,
              })
            }
          >
            יצירת גרסה חדשה
          </button>
          {!t.approved && (
            <button onClick={() => setApproval(t)}>אישור בדיקה משפטית</button>
          )}
        </section>
      ))}
      {edit && (
        <form
          className="lt-card"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("admin/templates", "POST", edit);
              setEdit(undefined);
              reload();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <h2>גרסה חדשה</h2>
          <Field label="כותרת">
            <input
              required
              value={edit.title}
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            />
          </Field>
          <Field label="נוסח מלא">
            <textarea
              className="lt-legal-edit"
              required
              minLength={100}
              value={edit.body}
              onChange={(e) => setEdit({ ...edit, body: e.target.value })}
            />
          </Field>
          <button>שמירת גרסה חדשה</button>
        </form>
      )}
      {approval && (
        <form
          className="lt-card"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api(`admin/templates/${approval._id}/approve`, "POST", {
                reviewer,
                confirm: true,
              });
              setApproval(undefined);
              reload();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <h2>אישור גרסה {approval.version}</h2>
          <Field label="שם עורך הדין הבודק / אסמכתה">
            <input
              required
              minLength={3}
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
            />
          </Field>
          <label className="lt-check">
            <input required type="checkbox" />
            גרסה מדויקת זו נבדקה ואושרה משפטית לשימוש המתאים
          </label>
          <button>תיעוד האישור</button>
        </form>
      )}
    </>
  );
}
function Contracts({ contractId }: { contractId?: string }) {
  const { data, error, reload, setError } = useLoad(
    contractId ? "admin/contracts/" + contractId : "admin/contracts",
  );
  const [query, setQuery] = useState(""),
    [product, setProduct] = useState(""),
    [tier, setTier] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [payment, setPayment] = useState("awaiting_payment"),
    [service, setService] = useState("pending");
  useEffect(() => {
    if (data?.state) {
      setPayment(data.state.payment);
      setService(
        data.state.service === "unsigned_to_active_pending"
          ? "pending"
          : data.state.service,
      );
    }
  }, [data]);
  async function action(path: string, body = {}) {
    try {
      await api(path, "POST", body);
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <h1>{contractId ? "פרטי הסכם" : "ניהול הסכמים"}</h1>
      {error && <Notice error>{error}</Notice>}
      {contractId && data ? (
        <>
          <section className="lt-card">
            <h2>{data.payload.snapshot.title}</h2>
            <p>
              {data.payload.signer.fullName} · <bdi>{data.email}</bdi>
            </p>
            <p>
              {data.mode === "test" ? "מסמך בדיקה" : "הסכם מחייב"} · {data.tier}{" "}
              · {data.months} חודשים · {money(data.monthly)} לחודש
            </p>
            <a
              className="lt-button"
              href={`/api/admin/contracts/${contractId}/pdf`}
            >
              הורדת PDF חתום
            </a>
            <Link
              className="lt-button secondary"
              href={"/admin/offers/" + data.offerId}
            >
              ההצעה המקורית / יצירת גרסה חדשה
            </Link>
            <Field label="תשלום">
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                {["awaiting_payment", "paid"].map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="מצב שירות">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {["pending", "active", "expired", "revoked", "cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <button
              onClick={() =>
                action(`admin/contracts/${contractId}/payment`, {
                  payment,
                  service,
                })
              }
            >
              עדכון מצב תשלום ושירות
            </button>
          </section>
          <section className="lt-card">
            <h2>התראות</h2>
            {data.notifications.map((n) => (
              <p key={n._id}>
                {n.channel} · {n.kind} · {statusLabel(n.status)} · ניסיונות:{" "}
                {n.attempts}
              </p>
            ))}
            <button
              className="secondary"
              onClick={() =>
                action(`admin/contracts/${contractId}/retry-notifications`)
              }
            >
              ניסיון חוזר להתראות שנכשלו
            </button>
          </section>
          <section className="lt-card">
            <h2>רישום ראיות ואירועים</h2>
            <pre>{JSON.stringify(data.evidence, null, 2)}</pre>
            <p className="lt-digest">SHA-256: {data.evidenceDigest}</p>
            {data.audit.map((a) => (
              <p key={a._id}>
                {a.action} · {localDate(a.at)}
              </p>
            ))}
          </section>
        </>
      ) : (
        !contractId && (
          <>
            <div className="lt-filters">
              <Field label="חיפוש מזהה / לקוח">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Field>
              <Field label="מוצר">
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                >
                  <option value="">הכל</option>
                  <option value="ecommerce">חנות</option>
                  <option value="management">מערכת ניהול</option>
                </select>
              </Field>
              <Field label="מסלול">
                <select value={tier} onChange={(e) => setTier(e.target.value)}>
                  <option value="">הכל</option>
                  {["STARTER", "PRO", "CUSTOM"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="מצב תשלום">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">הכל</option>
                  <option value="paid">שולם</option>
                  <option value="awaiting_payment">ממתין לתשלום</option>
                </select>
              </Field>
              <Field label="מתאריך">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Field>
              <Field label="עד תאריך">
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Field>
            </div>
            <a
              className="lt-button secondary"
              href="/api/admin/contracts/export"
            >
              יצוא דוח ללא פרטי קשר
            </a>
            <button onClick={() => action("admin/jobs/run")}>
              עיבוד התראות ממתינות
            </button>
            <div className="lt-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>מזהה / לקוח</th>
                    <th>מסלול</th>
                    <th>חודשים</th>
                    <th>לחודש</th>
                    <th>מצב</th>
                    <th>תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(data) &&
                    data
                      .filter(
                        (c) =>
                          (!query ||
                            (c._id + " " + c.clientLabel)
                              .toLowerCase()
                              .includes(query.toLowerCase())) &&
                          (!product || c.product === product) &&
                          (!tier || c.tier === tier) &&
                          (!status || c.state?.payment === status) &&
                          (!from || c.createdAt >= from) &&
                          (!to || c.createdAt.slice(0, 10) <= to),
                      )
                      .map((c) => (
                        <tr key={c._id}>
                          <td>
                            <Link href={"/admin/contracts/" + c._id}>
                              {c.clientLabel || c._id}
                            </Link>
                            <small>{c.mode === "test" ? "בדיקה" : ""}</small>
                          </td>
                          <td>{c.tier}</td>
                          <td>{c.months}</td>
                          <td>{money(c.monthly)}</td>
                          <td>{statusLabel(c.state?.payment)}</td>
                          <td>{localDate(c.createdAt)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </>
  );
}
