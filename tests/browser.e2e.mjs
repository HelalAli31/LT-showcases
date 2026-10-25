import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { SMTPServer } from "smtp-server";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { setup, post, input } from "./helpers/fixture.mjs";
import { unseal } from "../server/lib/security.mjs";
const f = await setup();
const mailbox = [];
const smtp = new SMTPServer({
  secure: false,
  disabledCommands: ["STARTTLS"],
  onAuth(auth, session, cb) {
    if (
      auth.username === "sender@example.test" &&
      auth.password === "test-only"
    )
      cb(null, { user: "test" });
    else cb(Error("Authentication failed"));
  },
  onData(stream, session, cb) {
    let raw = "";
    stream.on("data", (chunk) => (raw += chunk));
    stream.on("end", () => {
      const offset = raw.indexOf("\r\n\r\n"),
        headers = raw.slice(0, offset),
        body = raw.slice(offset + 4);
      mailbox.push(
        /Content-Transfer-Encoding: base64/i.test(headers)
          ? Buffer.from(body.replace(/\s/g, ""), "base64").toString()
          : body,
      );
      cb();
    });
  },
});
await new Promise((r) => smtp.listen(2526, "127.0.0.1", r));
const origin = "http://localhost:8090";
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", "8090"],
  {
    env: {
      ...process.env,
      ...f.config,
      APP_ORIGIN: origin,
      MONGODB_URI: f.uri,
      MONGODB_DB: "LT_tests",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "2526",
      SMTP_SECURE: "false",
      MAIL_USER: "",
      MAIL_PASS: "",
      META_SEND_ENABLED: "false",
      BINDING_SIGNATURES_ENABLED: "false",
      NODE_ENV: "production",
      VERCEL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
child.stdout.on("data", (c) => (logs += c));
child.stderr.on("data", (c) => (logs += c));
let browser;
const errors = [];
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(origin + "/api/health");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  assert.ok(ready, "Next server did not start: " + logs.slice(-1500));
  browser = await chromium.launch();
  const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("private-data/qa", { recursive: true });
  await page.goto(origin);
  await page.locator("header img").first().waitFor();
  assert.ok((await page.locator("body").innerText()).includes("Luxury"));
  assert.equal(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('img[src^="/assets"]')).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    ),
    true,
  );
  await page.screenshot({
    path: "private-data/qa/public-desktop.png",
    fullPage: true,
  });
  for (const route of [
    "/services",
    "/services/crm",
    "/services/digital-stores",
    "/services/landing-pages",
    "/portfolio",
    "/blog",
    "/blog/signs-your-business-needs-a-crm",
    "/about",
    "/contact",
  ]) {
    const response = await page.goto(origin + route);
    assert.equal(response.status(), 200);
    await page.locator("main").waitFor();
    assert.ok((await page.locator("main").innerText()).length > 100);
  }
  await page.goto(origin);
  await page.goto(origin + "/admin");
  await page.getByLabel("סיסמת מנהל").fill("test-password-long");
  await page.getByRole("button", { name: "כניסה מאובטחת" }).click();
  await page.getByRole("heading", { name: "סקירה כללית" }).waitFor();
  await page.getByRole("link", { name: "הצעה חדשה", exact: true }).click();
  await page.getByLabel("שם הלקוח או העסק").fill("לקוח QA");
  await page.getByLabel("דוא״ל הנמען").fill("client@example.test");
  await page.getByLabel("תוקף הצעה").fill("2099-01-01T12:00");
  await page
    .locator(".lt-tier-editor")
    .filter({ hasText: "PRO" })
    .getByRole("checkbox")
    .first()
    .check();
  await page
    .getByLabel("מה הפרויקט צריך לעשות?")
    .fill("חנות מקצועית למותג בגדים עם ניהול הזמנות");
  await page
    .getByLabel("דרישות מיוחדות ודברים שחשוב לכלול")
    .fill("חיבור למלאי קיים לאחר קבלת גישת API");
  await page.getByLabel("מחיר חודשי PRO ₪").fill("156");
  assert.equal(
    await page.getByLabel("מחיר חודשי PRO ₪").getAttribute("step"),
    "1",
  );
  await page
    .locator(".lt-tier-editor")
    .filter({ has: page.getByText("PRO", { exact: true }) })
    .getByRole("button", { name: /עיגול מחירים/ })
    .click();
  assert.equal(await page.getByLabel("מחיר חודשי PRO ₪").inputValue(), "159");
  assert.equal(await page.getByLabel("דמי הקמה PRO ₪").inputValue(), "2499");
  await page.getByLabel("דמי הקמה PRO ₪").fill("2490");
  await page
    .getByRole("button", { name: "הוספת עמוד / מסך", exact: true })
    .click();
  await page.getByLabel("שם עמוד 1", { exact: true }).fill("עמוד בית מפורט");
  await page.getByLabel("כתובת עמוד 1 (אופציונלי)", { exact: true }).fill("/");
  await page
    .getByLabel("מה יכלול עמוד 1", { exact: true })
    .fill("אזור פתיחה, קטגוריות ומוצרים נבחרים");
  await page
    .getByRole("button", { name: "הוספת עמוד / מסך", exact: true })
    .click();
  await page.getByLabel("שם עמוד 2", { exact: true }).fill("עמוד דוחות מפורט");
  await page
    .getByLabel("מה יכלול עמוד 2", { exact: true })
    .fill("נתוני מכירות וניתוח הזמנות לפי טווח תאריכים");
  await page
    .getByRole("checkbox", { name: "עמוד 2 כלול ב-STARTER", exact: true })
    .uncheck();
  await page
    .getByRole("checkbox", { name: "עמוד 2 כלול ב-CUSTOM", exact: true })
    .uncheck();
  await page
    .getByLabel("עיצוב וחוויית שימוש", { exact: true })
    .fill("עיצוב מותאם למיתוג העסק ולמובייל");
  await page.getByLabel("מחיר חודשי PRO ₪").fill("349.00");
  await page
    .getByRole("button", { name: "הוספת מסכי ניהול לפי מסלול", exact: true })
    .click();
  assert.equal(await page.locator(".lt-page-editor").count(), 10);
  await page
    .getByRole("button", { name: "הוספת מסכי ניהול לפי מסלול", exact: true })
    .click();
  assert.equal(await page.locator(".lt-page-editor").count(), 10);
  for (const tier of ["STARTER", "CUSTOM"]) {
    await page
      .locator(".lt-tier-editor")
      .filter({ has: page.getByText(tier, { exact: true }) })
      .getByRole("checkbox")
      .first()
      .check();
  }
  await page
    .getByRole("checkbox", {
      name: "אישרתי את המחיר ואת היקף CUSTOM עבור לקוח זה",
    })
    .check();
  await page.getByLabel("טיפול במס", { exact: true }).selectOption("inclusive");
  await page.getByLabel("שיעור מס %", { exact: true }).fill("18");
  await page.screenshot({
    path: "private-data/qa/guided-builder.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: "private-data/qa/guided-builder-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "יצירת הצעה והסכם אוטומטית" }).click();
  await page.getByRole("heading", { name: "ההצעה מוכנה לבדיקה" }).waitFor();
  for (const tier of ["STARTER", "PRO", "CUSTOM"]) {
    assert.equal(
      await page
        .getByRole("button", { name: `בחירת מסלול ${tier}`, exact: true })
        .count(),
      1,
    );
  }
  await page
    .getByRole("button", { name: "בחירת מסלול STARTER", exact: true })
    .click();
  await page.getByRole("radio", { name: "24 חודשים", exact: true }).check();
  assert.ok((await page.locator(".lt-quote").innerText()).includes("4,208.40"));
  await page
    .getByRole("button", { name: "בחירת מסלול CUSTOM", exact: true })
    .click();
  assert.ok((await page.locator(".lt-price").innerText()).includes("359.10"));
  await page
    .getByRole("button", { name: "בחירת מסלול PRO", exact: true })
    .click();
  const draftForPreview = await f.db
    .collection("offers")
    .findOne({ "input.clientLabel": "לקוח QA" });
  const interactivePreview = await ctx.newPage();
  interactivePreview.on("pageerror", (e) => errors.push(e.message));
  await interactivePreview.goto(
    `${origin}/api/admin/offers/${draftForPreview._id}/preview?tier=PRO&months=12`,
  );
  await interactivePreview
    .getByRole("button", { name: "בחירת מסלול STARTER", exact: true })
    .waitFor();
  assert.ok(
    interactivePreview
      .url()
      .includes(`/admin/offers/${draftForPreview._id}/preview`),
  );
  await interactivePreview
    .getByRole("button", { name: "בחירת מסלול STARTER", exact: true })
    .click();
  await interactivePreview
    .getByRole("radio", { name: "24 חודשים", exact: true })
    .check();
  assert.equal(
    await interactivePreview
      .locator(".lt-project-scope")
      .getByRole("heading", { name: "ניהול מוצרים", exact: true })
      .count(),
    1,
  );
  assert.equal(
    await interactivePreview
      .locator(".lt-project-scope")
      .getByRole("heading", { name: "ניהול קופונים", exact: true })
      .count(),
    0,
  );
  assert.ok(
    (await interactivePreview.locator(".lt-quote").innerText()).includes(
      "4,208.40",
    ),
  );
  await interactivePreview
    .frameLocator("iframe")
    .getByText("ההשקעה בפרויקט")
    .waitFor();
  assert.ok(
    (
      await interactivePreview
        .frameLocator("iframe")
        .locator("body")
        .innerText()
    ).includes("STARTER"),
  );
  await interactivePreview
    .getByRole("button", { name: "בחירת מסלול CUSTOM", exact: true })
    .click();
  assert.equal(
    await interactivePreview
      .locator(".lt-project-scope")
      .getByRole("heading", { name: "ניהול קופונים", exact: true })
      .count(),
    1,
  );
  assert.ok(
    (await interactivePreview.locator(".lt-price").innerText()).includes(
      "359.10",
    ),
  );
  await interactivePreview.screenshot({
    path: "private-data/qa/interactive-customer-preview.png",
    fullPage: true,
  });
  await interactivePreview.close();
  const previewFrame = page.frameLocator(
    'iframe[title="תצוגה מקדימה של ההסכם"]',
  );
  await previewFrame.getByText("ההשקעה בפרויקט").waitFor();
  assert.ok(
    (await previewFrame.locator("body").innerText()).includes("10,028.40"),
  );
  assert.ok(
    (await previewFrame.locator("body").innerText()).includes(
      "עמוד דוחות מפורט",
    ),
  );
  assert.ok(
    (await previewFrame.locator("body").innerText()).includes(
      "חיבור למלאי קיים",
    ),
  );
  assert.equal(
    await previewFrame
      .locator("body")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
    false,
  );
  await page.screenshot({
    path: "private-data/qa/admin-builder.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "אישור ויצירת קישור ללקוח" }).click();
  const linkInput = page.getByLabel("קישור ללקוח — בחירת מסלול וחתימה", {
    exact: true,
  });
  await linkInput.waitFor();
  const link = await linkInput.inputValue();
  assert.ok(link.includes("/offer/"));
  const customerContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    customer = await customerContext.newPage();
  customer.on("pageerror", (e) => errors.push(e.message));
  await customer.goto(link);
  await customer
    .getByRole("heading", { name: "המסלול שמתאים לעסק שלך" })
    .waitFor();
  assert.equal(
    await customer.getByRole("button", { name: "שליחת קוד אימות" }).count(),
    0,
  );
  assert.equal(
    mailbox.length,
    0,
    "Opening a private offer must not send an OTP",
  );
  assert.equal(await customer.getByRole("radio").count(), 3);
  const tierBounds = await customer
    .locator(".lt-tier-grid .lt-tier")
    .evaluateAll((elements) =>
      elements.map((el) => el.getBoundingClientRect().top),
    );
  assert.ok(
    tierBounds.every((top) => Math.abs(top - tierBounds[0]) < 2),
    "All packages must stay side by side on mobile",
  );
  const durationBounds = await customer
    .locator(".lt-commitment-option")
    .evaluateAll((elements) =>
      elements.map((el) => el.getBoundingClientRect().top),
    );
  assert.ok(
    durationBounds.every((top) => Math.abs(top - durationBounds[0]) < 2),
    "Commitment choices must stay in one row on mobile",
  );
  await customer.evaluate(() => window.scrollTo(0, 0));
  const nextBounds = await customer.locator(".lt-customer-next").boundingBox();
  assert.ok(
    nextBounds.y >= 0 && nextBounds.y + nextBounds.height <= 844,
    "Continue must be visible without scrolling",
  );
  assert.equal(
    await customer.locator(".lt-more-details").getAttribute("open"),
    null,
  );
  for (const tier of ["STARTER", "PRO", "CUSTOM"]) {
    assert.equal(
      await customer
        .getByRole("button", { name: `בחירת מסלול ${tier}`, exact: true })
        .count(),
      1,
    );
  }
  await customer
    .getByRole("button", { name: "בחירת מסלול STARTER", exact: true })
    .click();
  assert.equal(
    await customer
      .locator(".lt-project-scope")
      .getByText("עמוד דוחות מפורט", { exact: true })
      .count(),
    0,
  );
  await customer.getByRole("radio", { name: "24 חודשים", exact: true }).check();
  assert.ok(
    (await customer.locator(".lt-quote").innerText()).includes("4,208.40"),
  );
  await customer
    .getByRole("button", { name: "בחירת מסלול CUSTOM", exact: true })
    .click();
  assert.ok(
    (await customer.locator(".lt-price").innerText()).includes("359.10"),
  );
  await customer
    .getByRole("button", { name: "בחירת מסלול PRO", exact: true })
    .click();
  assert.equal(
    await customer
      .locator(".lt-project-scope")
      .getByText("עמוד דוחות מפורט", { exact: true })
      .count(),
    1,
  );
  await customer.getByRole("radio", { name: "24 חודשים", exact: true }).check();
  assert.ok(
    (await customer.locator(".lt-quote").innerText()).includes("10,028.40"),
  );
  assert.ok(
    (await customer.locator(".lt-price").innerText()).includes("314.10"),
  );
  assert.equal(
    await customer.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await customer.screenshot({
    path: "private-data/qa/customer-mobile.png",
    fullPage: true,
  });
  await customer
    .getByRole("button", { name: "עיון בהסכם המלא והמשך לחתימה" })
    .click();
  await customer.locator("iframe").waitFor();
  await customer.waitForFunction(
    () => document.activeElement?.id === "agreement-heading",
  );
  await customer
    .getByRole("checkbox", { name: "קראתי את ההסכם המלא ואת נספחי ההצעה" })
    .check();
  await customer.getByLabel("שם מלא", { exact: true }).fill("לקוח בדיקה");
  await customer.getByLabel("טלפון", { exact: true }).fill("0501234567");
  await customer
    .getByRole("checkbox", { name: "אני חותם בשם חברה", exact: true })
    .check();
  await customer.getByLabel("שם החברה", { exact: true }).fill("חברת בדיקה QA");
  assert.equal(await customer.getByLabel("תפקיד", { exact: true }).count(), 0);
  assert.equal(
    await customer
      .getByLabel("מספר רישום חברה (אם נדרש להסכם)", { exact: true })
      .count(),
    0,
  );
  await customer
    .getByRole("checkbox", {
      name: "אני מוסמך לחתום ולחייב את החברה",
      exact: true,
    })
    .check();
  await customer.getByRole("checkbox", { name: "אני מקבל במפורש" }).check();
  await customer
    .getByRole("checkbox", { name: "קראתי ומאשר את הודעת הפרטיות" })
    .check();
  const canvas = customer.locator("canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await customer.mouse.move(box.x + 40, box.y + 100);
  await customer.mouse.down();
  for (let i = 0; i < 30; i++)
    await customer.mouse.move(
      box.x + 40 + i * 6,
      box.y + 80 + Math.sin(i / 3) * 35,
    );
  await customer.mouse.up();
  await customer.getByRole("checkbox", { name: "זו חתימתי" }).check();
  await customer
    .getByRole("button", { name: "המשך לאישור חתימת בדיקה" })
    .click();
  await customer
    .getByRole("button", { name: "אני מאשר וחותם", exact: true })
    .click();
  await customer
    .getByRole("heading", { name: "חתימת הבדיקה הושלמה" })
    .waitFor({ timeout: 60000 });
  const downloadPromise = customer.waitForEvent("download");
  await customer.getByRole("link", { name: "הורדת העתק ההסכם" }).click();
  const download = await downloadPromise;
  await download.saveAs("private-data/qa/signed-test.pdf");
  const contract = await f.db.collection("contracts").findOne();
  assert.ok(contract);
  assert.ok(
    unseal(contract.payload, f.config).html.includes("מורשה חתימה מטעם החברה"),
  );
  assert.equal(contract.monthly, 31410);
  assert.equal(contract.total, 1002840);
  await customer.screenshot({
    path: "private-data/qa/signed-success.png",
    fullPage: true,
  });
  await page.goto(origin + "/admin/contracts");
  await page.getByRole("link", { name: "לקוח QA", exact: true }).waitFor();
  await page.getByRole("link", { name: "לקוח QA", exact: true }).click();
  await page.getByRole("heading", { name: "התראות", exact: true }).waitFor();
  await page.screenshot({
    path: "private-data/qa/admin-contract.png",
    fullPage: true,
  });
  const legacy = await post(f.admin, "admin/offers", input());
  assert.equal(legacy.status, 201);
  await page.goto(origin + "/admin/offers/" + legacy.body._id);
  await page.getByRole("button", { name: "שמירת טיוטה ותצוגה מקדימה" }).click();
  const publishButton = page.getByRole("button", {
    name: "פרסום הצעה קפואה ויצירת קישור",
  });
  await publishButton.waitFor();
  await publishButton.scrollIntoViewIfNeeded();
  const footer = await publishButton.boundingBox();
  const quoteBounds = await page.locator(".lt-quote").boundingBox();
  assert.ok(
    footer.y >= quoteBounds.y + quoteBounds.height,
    "Publish actions overlap the quote",
  );
  const center = {
    x: footer.x + footer.width / 2,
    y: footer.y + footer.height / 2,
  };
  assert.ok(
    await publishButton.evaluate(
      (el, point) => el.contains(document.elementFromPoint(point.x, point.y)),
      center,
    ),
    "Publish button is covered by another element",
  );
  await page.screenshot({
    path: "private-data/qa/advanced-preview-actions.png",
    fullPage: true,
  });
  assert.deepEqual(errors, [], "Browser JavaScript errors");
  const quickPage = await ctx.newPage();
  await quickPage.goto(origin + "/admin/offers/new");
  await quickPage
    .getByLabel("שם לקוח להצעה מהירה", { exact: true })
    .fill("לקוח מהיר QA");
  await quickPage
    .getByRole("button", { name: "יצירת הצעת ברירת מחדל וקישור", exact: true })
    .click();
  const quickLink = quickPage.getByLabel("קישור ההצעה המהירה", { exact: true });
  await quickLink.waitFor();
  await quickPage.waitForFunction(
    () => document.activeElement?.id === "quick-offer-result",
  );
  const linkBounds = await quickLink.boundingBox();
  assert.ok(
    linkBounds.y >= 0 && linkBounds.y + linkBounds.height <= 1000,
    "Created link must be brought into view",
  );
  const quickCustomer = await browser.newPage();
  await quickCustomer.goto(await quickLink.inputValue());
  await quickCustomer
    .getByRole("button", { name: "בחירת מסלול STARTER", exact: true })
    .waitFor();
  await quickCustomer
    .getByRole("button", { name: "בחירת מסלול PRO", exact: true })
    .waitFor();
  assert.equal(
    await quickCustomer
      .getByRole("button", { name: "בחירת מסלול CUSTOM", exact: true })
      .count(),
    0,
  );
  await quickCustomer.locator(".lt-more-details > summary").click();
  assert.equal(
    await quickCustomer
      .locator(".lt-project-scope")
      .getByRole("heading", { name: "ניהול הזמנות", exact: true })
      .count(),
    1,
  );
  await quickCustomer.close();
  await quickPage.close();
  console.log(
    "Browser E2E passed: public site, admin builder/publication, private-link access without SMTP or OTP, mobile exact pricing, full agreement, canvas signing, encrypted PDF download and contract dashboard.",
  );
} catch (e) {
  if (browser) {
    const pages = browser.contexts().flatMap((c) => c.pages());
    for (let i = 0; i < pages.length; i++)
      await pages[i]
        .screenshot({
          path: `private-data/qa/failure-${i}.png`,
          fullPage: true,
        })
        .catch(() => {});
  }
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill();
  await new Promise((r) => child.once("exit", r));
  await new Promise((r) => smtp.close(r));
  await f.close();
}
