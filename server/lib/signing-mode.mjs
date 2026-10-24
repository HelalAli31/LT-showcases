import { digest } from "./security.mjs";
export const bindingEnabled = (config, settings) =>
  settings?.signingMode
    ? settings.signingMode === "production"
    : config.BINDING_SIGNATURES_ENABLED === "true";

export async function exactLegalApproval(db, frozen) {
  if (frozen.approved) return frozen;
  const current = await db
    .collection("templates")
    .findOne({ _id: frozen._id, approved: true });
  const contentDigest = (value) =>
    digest({ title: value.title, body: value.body, version: value.version });
  return current &&
    current.product === frozen.product &&
    current.tier === frozen.tier &&
    current.approvalDigest === contentDigest(frozen) &&
    contentDigest(current) === contentDigest(frozen)
    ? current
    : null;
}
