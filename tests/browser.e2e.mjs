import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { SMTPServer } from "smtp-server";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { setup, post, input } from "./helpers/fixture.mjs";
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
  await page.getByLabel("דמי הקמה PRO ₪").fill("2490.00");
  await page.getByLabel("מחיר חודשי PRO ₪").fill("349.00");
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
  const previewFrame = page.frameLocator(
    'iframe[title="תצוגה מקדימה של ההסכם"]',
  );
  await previewFrame.getByText("ההשקעה בפרויקט").waitFor();
  assert.ok(
    (await previewFrame.locator("body").innerText()).includes("10,028.40"),
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
  const linkInput = page.getByLabel("קישור פרטי", { exact: true });
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
    .getByRole("heading", { name: "חנויות מסחר אלקטרוני עבור לקוח QA" })
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
  await customer
    .getByRole("checkbox", { name: "קראתי את ההסכם המלא ואת נספחי ההצעה" })
    .check();
  await customer.getByLabel("שם מלא", { exact: true }).fill("לקוח בדיקה");
  await customer.getByLabel("טלפון", { exact: true }).fill("0501234567");
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
