import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { seal, unseal, hash, requireValue } from "./security.mjs";
export function storage(config) {
  const s3 = config.S3_BUCKET
    ? new S3Client({
        region: config.S3_REGION || "auto",
        endpoint: config.S3_ENDPOINT || undefined,
        forcePathStyle: config.S3_FORCE_PATH_STYLE === "true",
        credentials: config.S3_ACCESS_KEY_ID
          ? {
              accessKeyId: config.S3_ACCESS_KEY_ID,
              secretAccessKey: config.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
      })
    : null;
  return {
    async put(pdf, key) {
      requireValue(
        pdf.length <= 4 * 1024 * 1024,
        "PDF exceeds the 4MB secure download limit",
      );
      const encrypted = seal(pdf, config);
      if (!s3) return { driver: "mongo", encrypted, digest: hash(pdf) };
      await s3.send(
        new PutObjectCommand({
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: JSON.stringify(encrypted),
          ContentType: "application/octet-stream",
          IfNoneMatch: "*",
        }),
      );
      return { driver: "s3", key, digest: hash(pdf) };
    },
    async get(ref) {
      const encrypted =
        ref.driver === "mongo"
          ? ref.encrypted
          : JSON.parse(
              await (
                await s3.send(
                  new GetObjectCommand({
                    Bucket: config.S3_BUCKET,
                    Key: ref.key,
                  }),
                )
              ).Body.transformToString(),
            );
      const pdf = unseal(encrypted, config, true);
      requireValue(
        hash(pdf) === ref.digest,
        "Document integrity check failed",
        500,
      );
      return pdf;
    },
  };
}
