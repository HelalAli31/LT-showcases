export { renderAgreement } from "./agreement.mjs";
let running = 0;
export async function pdfFromHtml(html, config = process.env) {
  if (running >= 2) throw Error("PDF capacity reached; retry");
  running++;
  let browser;
  try {
    const { chromium } = await import("playwright-core");
    if (config.VERCEL) {
      const { default: binary } = await import("@sparticuz/chromium");
      browser = await chromium.launch({
        args: binary.args,
        executablePath: await binary.executablePath(),
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
  } catch (cause) {
    throw Object.assign(Error("Agreement PDF generation failed", { cause }), {
      code: "PDF_GENERATION_FAILED",
    });
  } finally {
    await browser?.close();
    running--;
  }
}
