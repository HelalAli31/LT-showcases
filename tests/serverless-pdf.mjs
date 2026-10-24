import assert from "node:assert/strict";
import { pdfFromHtml } from "../server/lib/documents.mjs";
if (process.platform !== "linux") {
  console.log("Bundled Linux Chromium smoke test runs on the Linux CI runner.");
} else {
  const pdf = await pdfFromHtml(
    "<html><body><h1>Luxury Tech bundled serverless PDF</h1></body></html>",
    { VERCEL: "1" },
  );
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  console.log(
    "Bundled serverless Chromium generated a real PDF without an external pack URL.",
  );
}
