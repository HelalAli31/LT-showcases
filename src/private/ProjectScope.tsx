import type { ProjectPage, ProjectDetails, Snapshot } from "./types";
import { Field } from "./shared";
export const emptyProjectDetails: ProjectDetails = {
  design: "",
  content: "",
  integrations: "",
  acceptance: "",
};
const labels: Record<keyof ProjectDetails, string> = {
  design: "עיצוב וחוויית שימוש",
  content: "תוכן, תמונות והזנת מידע",
  integrations: "חיבורים ואינטגרציות",
  acceptance: "מה יימסר ואיך מאשרים מסירה",
};
import { presets, adminPresets } from "../../shared/project-presets.mjs";
export function ProjectScopeEditor({
  pages = [],
  details = emptyProjectDetails,
  product,
  onChange,
}: {
  pages?: ProjectPage[];
  details?: ProjectDetails;
  product: string;
  onChange: (pages: ProjectPage[], details: ProjectDetails) => void;
}) {
  const update = (index: number, field: string, value: unknown) =>
    onChange(
      pages.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      details,
    );
  return (
    <section className="lt-card lt-scope-editor">
      <h2>מה נבנה באתר?</h2>
      <p>
        פרטו אילו עמודים ומסכים ייבנו ומה כל אחד יכלול. אפשר להגדיר תכולה שונה
        ל-STARTER, PRO ו-CUSTOM.
      </p>
      <div className="lt-actions">
        <button
          type="button"
          className="secondary"
          disabled={pages.length >= 50}
          onClick={() =>
            onChange(
              [
                ...pages,
                ...adminPresets.filter(
                  (a) =>
                    !pages.some((p) => p.path === a.path || p.name === a.name),
                ),
              ].slice(0, 50),
              details,
            )
          }
        >
          הוספת מסכי ניהול לפי מסלול
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            const additions = (presets[product] || [])
              .filter(
                ([name, path]) =>
                  !pages.some((p) => p.name === name || p.path === path),
              )
              .map(([name, path, description]) => ({
                name,
                path,
                description,
                tiers: [],
              }));
            onChange([...pages, ...additions].slice(0, 50), details);
          }}
        >
          הוספת עמודים נפוצים לבחירה ועריכה
        </button>
      </div>
      {pages.map((p, index) => (
        <div className="lt-page-editor" key={index}>
          <div className="lt-scope-row-heading">
            <strong>עמוד / מסך {index + 1}</strong>
            <button
              type="button"
              className="secondary"
              aria-label={`הסרת עמוד ${index + 1}`}
              onClick={() =>
                onChange(
                  pages.filter((_, i) => i !== index),
                  details,
                )
              }
            >
              הסרה
            </button>
          </div>
          <div className="lt-form-grid">
            <Field label={`שם עמוד ${index + 1}`}>
              <input
                required
                maxLength={200}
                value={p.name}
                onChange={(e) => update(index, "name", e.target.value)}
                placeholder="לדוגמה: עמוד בית"
              />
            </Field>
            <Field label={`כתובת עמוד ${index + 1} (אופציונלי)`}>
              <input
                dir="ltr"
                maxLength={200}
                value={p.path}
                onChange={(e) => update(index, "path", e.target.value)}
                placeholder="/about"
              />
            </Field>
          </div>
          <Field label={`מה יכלול עמוד ${index + 1}`}>
            <textarea
              required
              maxLength={4000}
              rows={3}
              value={p.description}
              onChange={(e) => update(index, "description", e.target.value)}
              placeholder="מקטעים, פעולות, מידע ופונקציות שייבנו בעמוד"
            />
          </Field>
          <div className="lt-page-tier-scope">
            <span>העמוד כלול במסלולים:</span>
            {["STARTER", "PRO", "CUSTOM"].map((t) => {
              const allowed = p.tiers.length
                ? p.tiers
                : ["STARTER", "PRO", "CUSTOM"];
              return (
                <label className="lt-check" key={t}>
                  <input
                    type="checkbox"
                    aria-label={`עמוד ${index + 1} כלול ב-${t}`}
                    checked={allowed.includes(t)}
                    disabled={allowed.length === 1 && allowed.includes(t)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...allowed, t]
                        : allowed.filter((v) => v !== t);
                      update(index, "tiers", next.length === 3 ? [] : next);
                    }}
                  />
                  {t}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="secondary"
        disabled={pages.length >= 50}
        onClick={() =>
          onChange(
            [...pages, { name: "", path: "", description: "", tiers: [] }],
            details,
          )
        }
      >
        הוספת עמוד / מסך
      </button>
      <div className="lt-form-grid">
        {Object.entries(labels).map(([key, label]) => (
          <Field key={key} label={label}>
            <textarea
              maxLength={16000}
              rows={3}
              value={details[key] || ""}
              onChange={(e) =>
                onChange(pages, { ...details, [key]: e.target.value })
              }
              placeholder="פרטים נוספים שחשוב שיופיעו בהצעה ובהסכם"
            />
          </Field>
        ))}
      </div>
      <p>
        עמודים ופרטים שלא הוספתם לא נחשבים אוטומטית לחלק מהפרויקט. בדקו וערכו את
        העמודים הנפוצים לפני פרסום.
      </p>
    </section>
  );
}
export default function ProjectScope({
  snapshot,
  tier,
}: {
  snapshot: Snapshot;
  tier: string;
}) {
  const pages = (snapshot.pages || []).filter(
    (p) => !p.tiers.length || p.tiers.includes(tier),
  );
  const details = Object.entries(snapshot.projectDetails || {}).filter(
    ([, value]) => value?.trim(),
  );
  if (!pages.length && !details.length) return null;
  return (
    <section className="lt-project-scope">
      <h2>העמודים והמסכים שייבנו · {tier}</h2>
      <div className="lt-project-page-list">
        {pages.map((p, i) => (
          <article className="lt-project-page" key={i}>
            <div className="lt-scope-row-heading">
              <h3>{p.name}</h3>
              {p.path && <bdi className="lt-page-path">{p.path}</bdi>}
            </div>
            <p className="lt-pre">{p.description}</p>
          </article>
        ))}
      </div>
      {details.map(([key, value]) => (
        <div key={key}>
          <h3>{labels[key]}</h3>
          <p className="lt-pre">{value}</p>
        </div>
      ))}
    </section>
  );
}
