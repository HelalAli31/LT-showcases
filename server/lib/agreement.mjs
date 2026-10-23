import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { agreementDigest } from "./domain.mjs";
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(
    n / 100,
  );
let resources;
export async function renderAgreement(s, q, signing) {
  resources ??= Promise.all([
    readFile(join(process.cwd(), "public/fonts/NotoSansHebrew.ttf")),
    readFile(join(process.cwd(), "public/assets/logo.png")),
  ]);
  const [font, logo] = await resources;
  const p = s.tiers.find((t) => t.name === q.tier);
  const product =
    {
      ecommerce: "פיתוח חנות מסחר אלקטרוני",
      management: "פיתוח מערכת ניהול עסקי",
    }[s.product] || s.product;
  let section = 0;
  const block = (title, value) =>
    !String(value || "").trim()
      ? ""
      : `<section class="clause"><h2><span>${String(++section).padStart(2, "0")}</span>${esc(title)}</h2><div class="pre">${esc(value)}</div></section>`;
  const taxText = {
    inclusive: "המחירים כוללים מס",
    exclusive: "המחירים לפני מס; המס נוסף בסיכום",
    exempt: "פטור ממס",
  }[s.tax.mode];
  const rows = [
    ["מחיר חודשי מקורי", money(q.originalMonthly)],
    ["הנחת התחייבות", q.discountBps / 100 + "%"],
    ["חיוב חודשי לאחר הנחה", money(q.monthly)],
    ["דמי הקמה מקוריים", money(q.originalSetup)],
    ["דמי הקמה לתשלום (חד-פעמי)", money(q.setup)],
    ["תוספות חד-פעמיות", money(q.addons || 0)],
    ["סכום לתקופה לפני מס נוסף", money(q.subtotal)],
    ["מס נוסף", money(q.tax)],
    ["סך התחייבות לתקופה", money(q.total)],
    ["חיסכון לתקופה לפני מס נוסף", money(q.savings)],
  ];
  const party = (label, title, lines) =>
    `<div class="party"><span class="eyebrow">${label}</span><h3>${esc(title)}</h3>${lines
      .filter(Boolean)
      .map((v) => `<div>${esc(v)}</div>`)
      .join("")}</div>`;
  const legalSections = String(p.legal.body)
    .split(/\n\s*\n/)
    .map((text) => {
      const [title, ...body] = text.split("\n");
      return `<div class="legal-clause"><h3>${esc(title)}</h3><div class="pre">${esc(body.join("\n"))}</div></div>`;
    })
    .join("");
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.title)} | Luxury Tech</title><style>
@font-face{font-family:Hebrew;src:url(data:font/ttf;base64,${font.toString("base64")})}*{box-sizing:border-box}html{background:#eae8e3}body{font-family:Hebrew,Arial,sans-serif;font-size:12px;line-height:1.85;color:#272b32;margin:0;padding:32px 16px}.document{max-width:860px;margin:auto;background:white;box-shadow:0 10px 45px #18212b12}.masthead{background:#121c29;color:white;padding:28px 38px;display:flex;align-items:center;justify-content:space-between;border-bottom:4px solid #c7a064}.brand{font:600 25px Arial;letter-spacing:-1px;direction:ltr}.brand span{color:#dbb97f}.logo{width:48px;height:48px;object-fit:contain;border-radius:8px}.masthead-meta{color:#bbc3cd;font-size:10px;text-align:left}.content{padding:34px 38px}.eyebrow{font-size:10px;letter-spacing:1.5px;color:#8c6c39;font-weight:bold}h1{font-size:27px;line-height:1.4;letter-spacing:-.7px;margin:8px 0 10px;color:#152234}.subtitle{color:#69717c;margin:0 0 24px}.status{padding:10px 14px;background:#f8f4eb;border-right:3px solid #c7a064;font-size:11px;margin:20px 0;color:#6e542f}.parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0}.party{border:1px solid #e1e5e9;border-radius:8px;padding:18px;background:#fcfcfd;overflow-wrap:anywhere}.party h3{margin:5px 0;font-size:15px}.party div{color:#606873;font-size:11px}.commercial{border:1px solid #ddd7ca;border-radius:10px;overflow:hidden;margin:26px 0}.commercial-heading{display:flex;justify-content:space-between;align-items:center;background:#f8f5ee;padding:16px 20px;border-bottom:1px solid #e5dfd2}.commercial-heading h2{margin:0;font-size:16px}.pill{font-size:11px;border:1px solid #dacfb9;border-radius:30px;padding:4px 12px}.price-summary{display:grid;grid-template-columns:1fr 1fr;gap:15px;padding:20px}.price-summary small{display:block;color:#747b83;font-size:11px}.price{font-size:30px;font-weight:bold;line-height:1.7;color:#142538;direction:ltr;unicode-bidi:isolate;display:inline-block}.original{color:#7d858e;font-size:12px}.discount{color:#876528;margin-right:8px;font-size:11px}.setup{font-size:23px;font-weight:bold;color:#384453}.price-note{font-size:10px;color:#777;margin-top:3px}table{border-collapse:collapse;width:100%;font-size:11px}td{padding:9px 20px;border-top:1px solid #eceef0}td:last-child{text-align:left;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}tr:nth-last-child(2){background:#152234;color:white;font-size:13px}tr:last-child{background:#f4f7f4;color:#3c6245}.commercial-notes{padding:14px 20px;color:#6b7178;font-size:10px}.commercial-notes p{margin:4px 0}.clause{margin:26px 0 0;display:flow-root}.clause h2{font-size:16px;line-height:1.5;margin:0 0 12px;border-bottom:1px solid #e6e8eb;padding-bottom:9px;color:#16263a;break-after:avoid}.clause h2 span{display:inline-block;color:#a17b43;font-size:11px;margin-left:10px;font-family:Arial}.pre{white-space:pre-wrap;overflow-wrap:anywhere}.features{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}.features li{padding:9px 14px;background:#f5f7f9;border-radius:5px;font-size:11px}.features li:before{content:'✓';color:#9b783e;margin-left:8px}.legal-heading{margin:35px 0 16px;padding:15px 20px;background:#f4f6f8;border-right:3px solid #c7a064;break-after:avoid}.legal-heading h2{font-size:16px;margin:0}.legal-heading p{font-size:10px;margin:4px 0 0;color:#6c7580}.legal-clause{margin:15px 0;display:flow-root}.legal-clause h3{font-size:12px;margin:0 0 6px;color:#23344b;break-after:avoid}.legal-clause .pre{font-size:10.5px;color:#505965}.signature-box{border:1px solid #dce2e8;background:#fafbfc;padding:20px;border-radius:8px;margin-top:28px;break-inside:avoid}.signature-box h2{font-size:16px;margin:0 0 10px}.signature{width:220px;height:85px;object-fit:contain;border-bottom:1px solid #8090a1}.evidence{font-size:9px;color:#6a7582}.digest{font:8px/1.7 Arial;direction:ltr;text-align:left;overflow-wrap:anywhere;color:#7a828b;margin-top:20px}.document-footer{margin-top:30px;border-top:1px solid #e5e8eb;padding-top:14px;display:flex;justify-content:space-between;color:#808994;font-size:9px}tr,img,.party,.price-summary{break-inside:avoid}h2,h3{break-after:avoid}
@media(max-width:600px){body{padding:0;font-size:12px}.masthead{padding:22px}.content{padding:24px 20px}.parties{grid-template-columns:1fr}.features{grid-template-columns:1fr}h1{font-size:23px}.price{font-size:26px}.price-summary{gap:8px}.commercial-heading{gap:8px;flex-wrap:wrap}td{padding:9px 12px}.masthead-meta{display:none}}
@media print{html,body{background:white;margin:0;padding:0;font-size:10px}.document{max-width:none;box-shadow:none}.masthead{padding:20px 24px}.content{padding:24px 0 0}.parties{grid-template-columns:1fr 1fr;margin:18px 0}.party{padding:12px}.clause{margin-top:20px}.clause h2{font-size:14px}.price-summary{padding:15px 20px}.commercial{margin:20px 0}.features{grid-template-columns:1fr 1fr}.document-footer{font-size:8px}.legal-clause .pre{font-size:10px}}
@media print{body{line-height:1.65}.masthead{padding:14px 20px}.content{padding-top:16px}h1{font-size:23px;margin:6px 0}.subtitle{margin-bottom:12px}.status{margin:12px 0;padding:7px 12px}.parties{margin:12px 0;gap:12px}.party{padding:10px 14px}.party h3{margin:3px 0}.party div{font-size:10px;line-height:1.6}.commercial{margin:16px 0}.commercial-heading{padding:10px 16px}.price-summary{padding:12px 16px}.price{font-size:26px;line-height:1.4}.setup{font-size:21px}td{padding:6px 16px;font-size:10px}.commercial-notes{padding:9px 16px;font-size:9px}.commercial-notes p{margin:3px 0}.clause,.legal-clause{break-inside:avoid}}
</style></head><body><article class="document"><header class="masthead"><div><div class="brand">Luxury<span>Tech</span></div><div style="font-size:10px;color:#aeb8c5;margin-top:4px">טכנולוגיה שעובדת בשביל העסק שלך</div></div><div class="masthead-meta">הצעה אישית והסכם שירות<br>גרסה ${esc(s.version)} · ${esc(new Date(s.createdAt).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" }))}</div><img class="logo" alt="Luxury Tech" src="data:image/png;base64,${logo.toString("base64")}"></header><main class="content"><span class="eyebrow">הצעה מסחרית / הסכם התקשרות</span><h1>${esc(s.title)}</h1><p class="subtitle">${esc(product)} · מסלול ${esc(q.tier)} · ${q.months} חודשי שירות</p>
${signing?.mode === "test" ? '<div class="status">מסמך לבדיקה בלבד - אינו הסכם מחייב. הנוסח טעון אישור משפטי.</div>' : !signing ? '<div class="status">לעיון לפני חתימה · המחירים והתנאים המפורטים במסמך הם חלק מההצעה האישית.</div>' : '<div class="status">עותק חתום · ההסכם והבחירה המסחרית נשמרו במועד החתימה.</div>'}
<div class="parties">${party("הספק", s.supplier.name || "Luxury Tech", [s.supplier.id ? "מספר עוסק: " + s.supplier.id : "", s.supplier.address, s.supplier.email])}${party("הלקוח", signing?.signer.businessName || signing?.signer.fullName || s.clientName || "הלקוח המיועד בהצעה", signing ? [signing.signer.fullName, signing.email, signing.signer.phone, signing.signer.registrationId ? "מספר זיהוי: " + signing.signer.registrationId : "", signing.signer.company ? "תפקיד והרשאת חתימה: " + signing.signer.role : "לקוח פרטי"] : ["הפרטים המלאים יתווספו בעת אימות וחתימה."])}</div>
<div class="commercial"><div class="commercial-heading"><h2>ההשקעה בפרויקט</h2><span class="pill">${esc(q.tier)} / ${q.months} חודשים</span></div><div class="price-summary"><div><small>שירות חודשי</small>${q.discountBps ? `<div><del class="original">${money(q.originalMonthly)}</del><span class="discount">${q.discountBps / 100}% הנחה</span></div>` : ""}<strong class="price">${money(q.monthly)}</strong><div class="price-note">${esc(taxText)}</div></div><div><small>הקמה ופיתוח · חד-פעמי</small><strong class="setup">${money(q.setup)}</strong><div class="price-note">${s.discountSetup ? "כולל הנחת התחייבות שאושרה במפורש" : "ללא הנחת התחייבות"}</div></div></div><table><tbody>${rows.map(([label, value]) => `<tr><td>${esc(label)}</td><td><bdi>${esc(value)}</bdi></td></tr>`).join("")}</tbody></table><div class="commercial-notes"><p>${esc(taxText)}. שיעור המס שנקבע: ${s.tax.bps / 100}%.</p><p>ההנחה תקפה לכל ${q.months} חודשי ההתחייבות. ${s.discountSetup ? "ההנחה אושרה גם לדמי ההקמה." : "ההנחה חלה על החיוב החודשי בלבד."}</p><p>הסכום הכולל כולל הקמה ותוספות חד-פעמיות כמפורט בטבלה. החיסכון מוצג לפני מס נוסף.</p></div></div>
${block("מה בונים יחד", s.description)}${block("היקף העבודה והדרישות המיוחדות", s.scope)}<section class="clause"><h2><span>${String(++section).padStart(2, "0")}</span>מה כלול במסלול ${esc(q.tier)}</h2><ul class="features">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></section>${block("כמויות, תיקונים ומגבלות", p.limits)}${block("מחוץ להיקף ההצעה", p.exclusions)}${block("שלבי העבודה", s.milestones)}${block("לוחות זמנים ומסירה", s.delivery)}${block("תשלומים והפעלת השירות", s.paymentTerms)}${block("שירות, תמיכה ותחזוקה", p.support)}${block("שירותים ועלויות צד שלישי", s.thirdPartyCosts)}${block("תוספות שהוזמנו", s.addons.map((a) => a.label + ": " + money(a.amount)).join("\n"))}${block("תקופת ההנחה וחידוש", s.renewal)}${block("ביטול וסיום התקשרות", s.cancellation)}${block("קניין רוחני ורישיון שימוש", s.ipTerms)}${block("מידע ויצוא בסיום השירות", s.dataExit)}${block("אחריות וסעדים", s.liability)}${block("דין ויישוב מחלוקות", s.jurisdiction)}${block("נספחים מצורפים", (s.attachments || []).map((a) => a.label + "\nSHA-256: " + a.digest).join("\n\n"))}
<div class="legal-heading"><h2>${esc(p.legal.title)}</h2><p>תנאים כלליים · גרסת תבנית ${esc(p.legal.version)} · חלק בלתי נפרד מההסכם</p></div>${legalSections}${block("פרטיות ושימוש במידע", s.privacyNotice)}
${signing ? `<section class="signature-box"><h2>אישור ההסכם וחתימת הלקוח</h2><p>החותם קרא ואישר בנפרד את ההסכם ואת הודעת הפרטיות והצהיר על כוונתו לחתום${signing.signer.company ? " ועל סמכותו להתחייב בשם החברה" : ""}.</p><img class="signature" alt="חתימת הלקוח" src="${esc(signing.signer.signature)}"><div class="evidence">${esc(signing.signer.fullName)} · חתימה: ${esc(signing.at)} UTC<br>דוא״ל אומת בקוד חד-פעמי: ${esc(signing.verifiedAt)}<br>מזהה הסכם: <bdi>${esc(signing.id)}</bdi></div><div class="digest">Agreement SHA-256: ${agreementDigest(s, q)}<br>Evidence SHA-256: ${esc(signing.evidenceDigest)}</div></section>` : `<section class="signature-box"><h2>השלב הבא: אישור וחתימה</h2><p>פרטי החותם, אימות הדוא״ל והחתימה יתווספו לעותק הסופי. חתימה תתאפשר לאחר עיון במסמך ואישור נפרד של ההסכם ושל הודעת הפרטיות.</p></section>`}
<div class="document-footer"><span>Luxury Tech · הצעה אישית והסכם שירות</span><span>גרסה ${esc(s.version)}</span></div><div class="digest">Snapshot SHA-256: ${esc(s.digest)}</div></main></article></body></html>`;
}
