import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCb);
export const id = () => randomBytes(18).toString("hex");
export const token = () => randomBytes(32).toString("hex");
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const digest = (value) => hash(JSON.stringify(value));
export function secret(config) {
  if (
    !config.DATA_ENCRYPTION_KEY ||
    !/^[a-f0-9]{64}$/i.test(config.DATA_ENCRYPTION_KEY)
  )
    throw Error("DATA_ENCRYPTION_KEY must be 32-byte hex");
  return Buffer.from(config.DATA_ENCRYPTION_KEY, "hex");
}
export function seal(value, config) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", secret(config), iv);
  const data = Buffer.concat([
    cipher.update(
      Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value)),
    ),
    cipher.final(),
  ]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}
export function unseal(value, config, raw = false) {
  const d = createDecipheriv(
    "aes-256-gcm",
    secret(config),
    Buffer.from(value.iv, "base64"),
  );
  d.setAuthTag(Buffer.from(value.tag, "base64"));
  const b = Buffer.concat([
    d.update(Buffer.from(value.data, "base64")),
    d.final(),
  ]);
  return raw ? b : JSON.parse(b.toString());
}
export const otpHash = (code, challenge, config) =>
  createHmac("sha256", secret(config))
    .update(challenge + ":" + code)
    .digest("hex");
export async function checkPassword(password, encoded) {
  const [salt, key] = (encoded || "").split(":");
  if (!salt || !key || typeof password !== "string" || password.length > 256)
    return false;
  const expected = Buffer.from(key, "hex"),
    actual = await scrypt(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const requireValue = (
  condition,
  message = "בקשה לא תקינה",
  status = 400,
) => {
  if (!condition) throw new HttpError(status, message);
};
export const email = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
export const validEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function text(value, max = 2000) {
  requireValue(typeof value === "string" && value.length <= max);
  return value.trim();
}
export const cookieOptions = (config) => ({
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: 8 * 3600000,
});
