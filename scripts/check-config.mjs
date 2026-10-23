import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const credentials = new Set([
  "MONGODB_URI",
  "ADMIN_PASSWORD_HASH",
  "DATA_ENCRYPTION_KEY",
  "CRON_SECRET",
  "MAIL_PASS",
  "META_TOKEN",
  "META_WHATSAPP_ACCESS_TOKEN",
  "META_PAGE_ACCESS_TOKEN",
  "META_VERIFY_TOKEN",
  "META_APP_SECRET",
  "META_WEBHOOK_VERIFY_TOKEN",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
]);
const problems = [];
for (const line of readFileSync(".env.example", "utf8")
  .replace(/^\uFEFF/, "")
  .split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index < 0) continue;
  const key = line.slice(0, index).trim();
  if (credentials.has(key) && line.slice(index + 1).trim())
    problems.push("Populated credential placeholder: " + key);
}
const paths = execFileSync(
  "git",
  ["ls-files", "--", "server", "src", "pages", "tests"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);
for (const path of paths) {
  const value = readFileSync(path, "utf8");
  if (
    /\bEAA[A-Za-z0-9]{40,}\b/.test(value) ||
    /mongodb\+srv:\/\/[^\s:@]+:[^\s@]+@/.test(value)
  )
    problems.push("Possible embedded service credential: " + path);
}
if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(
    "Use private hosting environment variables. Never commit credential values.",
  );
  process.exitCode = 1;
} else
  console.log(
    "Configuration template and application source credential checks passed.",
  );
