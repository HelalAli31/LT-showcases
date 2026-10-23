import { randomBytes, scryptSync } from "node:crypto";
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 14)
  throw Error(
    "Set ADMIN_PASSWORD to at least 14 characters in the process environment",
  );
const salt = randomBytes(16).toString("hex");
console.log(salt + ":" + scryptSync(password, salt, 64).toString("hex"));
