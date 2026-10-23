import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { agreementDigest } from "./domain.mjs";
export const esc = (s) =>
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
let font;
export async function renderAgreement(s, q, signing) {
  font ??= await readFile(
    join(process.cwd(), "public/fonts/NotoSansHebrew.ttf"),
  );
  const p = s.tiers.find((p) => p.name === q.tier);
  const block = (title, value) =>
    `<section><h2>${esc(title)}</h2><div class="pre">${esc(value)}</div></section>`;
  const rows = [
    ["מסלול", q.tier],
    ["משך התחייבות", q.months + " חודשים"],
    ["מחיר חודשי מקורי", money(q.originalMonthly)],
    ["הנחה", q.discountBps / 100 + "%"],
    ["חיוב חודשי לאחר הנחה", money(q.monthly)],
    ["דמי הקמה מקוריים", money(q.originalSetup)],
    ["דמי הקמה לתשלום", money(q.setup)],
    ["תוספות חד־פעמיות", money(q.addons || 0)],
    ["סכום לתקופה לפני מס נוסף", money(q.subtotal)],
    ["מס נוסף", money(q.tax)],
    ["סך התחייבות לתקופה", money(q.total)],
    ["חיסכון לתקופה לפני מס נוסף", money(q.savings)],
  ];
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>Luxury Tech — הסכם</title><style>@font-face{font-family:Hebrew;src:url(data:font/ttf;base64,${font.toString("base64")})}*{box-sizing:border-box}body{font-family:Hebrew,Arial;font-size:11px;line-height:1.8;color:#181521;margin:0}h1{font-size:25px;color:#73542a}h2{font-size:15px;margin:18px 0 7px}header{border-bottom:2px solid #b58b4b;padding-bottom:15px}.pre{white-space:pre-wrap;overflow-wrap:anywhere}section{display:flow-root;margin-top:16px}h2{line-height:1.5;break-after:avoid;margin-bottom:10px}tr,img{break-inside:avoid}table{border-collapse:collapse;width:100%;margin-top:15px}td{padding:6px 10px;border-bottom:1px solid #ddd}td:last-child{direction:rtl}.notice{background:#f6f0e5;padding:12px}.digest{direction:ltr;text-align:left;font-size:8px;overflow-wrap:anywhere}.signature{width:240px;height:100px;object-fit:contain;border-bottom:1px solid #555}</style></head><body><header><h1>Luxury Tech</h1><h2>${esc(s.title)}</h2><p>הצעה גרסה ${s.version} · ${esc(s.createdAt)} · ${esc(s.product)}</p></header>${!signing || signing.mode === "test" ? '<p class="notice">מסמך לבדיקה בלבד — אינו הסכם מחייב. הנוסח טעון אישור משפטי.</p>' : ""}${block("הספק", `${s.supplier.name}\n${s.supplier.id}\n${s.supplier.address}\n${s.supplier.email}`)}${signing ? block("הלקוח והחותם", `${signing.signer.fullName}\n${signing.signer.businessName}\n${signing.email}\n${signing.signer.phone}\n${signing.signer.registrationId || ""}\nתפקיד: ${signing.signer.role || "לקוח פרטי"}\nהרשאת חתימה בחברה: ${signing.signer.company ? "אושרה במפורש" : "לא חל"}`) : ""}<h2>נספח מסחרי</h2><table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table><p>ההנחה תקפה לכל תקופת ההתחייבות. ${s.discountSetup ? "ההנחה חלה גם על ההקמה." : "ההנחה חלה על החיוב החודשי בלבד."}</p><p>מיסוי: ${esc({ inclusive: "המחירים כוללים מס", exclusive: "מס נוסף למחירים", exempt: "פטור ממס" }[s.tax.mode])}; שיעור ${s.tax.bps / 100}%.</p>${block("חידוש", s.renewal)}${block("תיאור הפרויקט", s.description)}${block("היקף ותוצרים", s.scope)}${block("רכיבי המסלול", p.features.join("\n"))}${block("כמויות ומגבלות", p.limits)}${block("החרגות", p.exclusions)}${block("אבני דרך ומסירה", s.milestones + "\n" + s.delivery)}${block("תשלום וביטול", s.paymentTerms + "\n" + s.cancellation)}${block("תמיכה ועלויות צד שלישי", p.support + "\n" + s.thirdPartyCosts)}${block("תוספות", s.addons.map((a) => a.label + ": " + money(a.amount)).join("\n"))}${block("קניין רוחני ורישיון", s.ipTerms)}${block("מידע ויצוא בסיום", s.dataExit)}${block("אחריות וסמכות שיפוט", s.liability + "\n" + s.jurisdiction)}${block(p.legal.title + " · גרסה " + p.legal.version, p.legal.body)}${block("הודעת פרטיות והסכמה", s.privacyNotice)}${signing ? `<section><h2>חתימה ורישום הסכמה</h2><p>החותם אישר בנפרד את ההסכם ואת הודעת הפרטיות, והצהיר על כוונתו לחתום.</p><p>דוא״ל אומת בקוד חד־פעמי ב־${esc(signing.verifiedAt)}. חתימה: ${esc(signing.at)} UTC.</p><p>מזהה חוזה: ${esc(signing.id)}</p><img alt="חתימת הלקוח" class="signature" src="${signing.signer.signature}"><p class="digest">Agreement SHA-256: ${agreementDigest(s, q)}<br>Evidence SHA-256: ${esc(signing.evidenceDigest)}</p></section>` : ""}<p class="digest">Snapshot SHA-256: ${s.digest}</p></body></html>`;
}
let running = 0;
export async function pdfFromHtml(html, config = process.env) {
  if (running >= 2) throw Error("PDF capacity reached; retry");
  running++;
  let browser;
  try {
    const { chromium } = await import("playwright-core");
    if (config.VERCEL) {
      const { default: binary } = await import("@sparticuz/chromium-min");
      if (!config.CHROMIUM_PACK_URL)
        throw Error("CHROMIUM_PACK_URL required on Vercel");
      browser = await chromium.launch({
        args: binary.args,
        executablePath: await binary.executablePath(config.CHROMIUM_PACK_URL),
        headless: true,
      });
    } else {
      const { chromium: local } = await import("playwright");
      browser = await local.launch({ headless: true });
    }
    const page = await browser.newPage();
    await page.route("**/*", (route) => route.abort());
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="font-family:Arial;font-size:9px;text-align:center;width:100%;color:#777">Luxury Tech · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: "18mm", left: "17mm", right: "17mm", bottom: "23mm" },
    });
  } finally {
    await browser?.close();
    running--;
  }
}
