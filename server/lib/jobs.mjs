import { id, digest } from "./security.mjs";
import { whatsappConfigured } from "./meta.mjs";
export async function audit(db, actor, action, subject, detail = {}, session) {
  const record = { _id: id(), actor, action, subject, detail, at: new Date() };
  record.digest = digest(record);
  await db.collection("audit").insertOne(record, { session });
}
export async function enqueue(db, contract, settings, config, session) {
  const jobs = [
    { channel: "email", recipient: contract.email, kind: "customer" },
    { channel: "email", recipient: settings.adminEmail, kind: "admin" },
    { channel: "whatsapp", recipient: settings.adminPhone, kind: "admin" },
  ];
  for (const job of jobs) {
    const configured =
      job.channel === "email"
        ? !!(config.MAIL_USER && config.MAIL_PASS && job.recipient)
        : whatsappConfigured(config) && settings.whatsappConsent;
    await db.collection("jobs").insertOne(
      {
        _id: id(),
        key: contract._id + ":" + job.channel + ":" + job.kind,
        contractId: contract._id,
        mode: contract.mode,
        ...job,
        status: configured ? "pending" : "not_configured",
        attempts: 0,
        nextAt: new Date(),
        createdAt: new Date(),
      },
      { session },
    );
  }
}
export async function processJobs(db, providers, config, max = 10) {
  let processed = 0;
  for (let i = 0; i < max; i++) {
    const owner = id(),
      now = new Date();
    const job = await db.collection("jobs").findOneAndUpdate(
      {
        $or: [
          { status: { $in: ["pending", "retry"] }, nextAt: { $lte: now } },
          { status: "sending", leaseUntil: { $lt: now } },
        ],
      },
      {
        $set: {
          status: "sending",
          leaseUntil: new Date(Date.now() + 120000),
          owner,
        },
        $inc: { attempts: 1 },
      },
      { returnDocument: "after", sort: { nextAt: 1 } },
    );
    if (!job) break;
    try {
      const origin = config.APP_ORIGIN;
      const label = job.mode === "test" ? "מסמך בדיקה" : "הסכם";
      let providerId;
      if (job.channel === "email") {
        const text =
          job.kind === "customer"
            ? `${label} נשמר בהצלחה. להורדת העתק מאומת יש להיכנס ולאמת דוא״ל: ${origin}/contract-access/${job.contractId}`
            : `נחתם ${label} ${job.contractId}. לצפייה מאובטחת: ${origin}/admin/contracts`;
        providerId = await providers.email({
          to: job.recipient,
          subject: `Luxury Tech — אישור ${label}`,
          text,
          messageId: `<${job.key}@luxurytech.org>`,
        });
      } else {
        const settings = await db
          .collection("settings")
          .findOne({ _id: "main" });
        if (
          !settings.whatsappConsent ||
          config.META_SEND_ENABLED !== "true" ||
          job.mode === "test"
        )
          throw Object.assign(Error("WhatsApp disabled"), { status: 503 });
        providerId = await providers.whatsapp({
          to: job.recipient,
          contractId: job.contractId,
        });
      }
      await db.collection("jobs").updateOne(
        { _id: job._id, owner },
        {
          $set: { status: "accepted", providerId, acceptedAt: new Date() },
          $unset: { owner: "", leaseUntil: "", lastError: "" },
        },
      );
    } catch (e) {
      await db.collection("jobs").updateOne(
        { _id: job._id, owner },
        {
          $set: {
            status:
              e.status === 503
                ? "not_configured"
                : job.attempts >= 6
                  ? "failed"
                  : "retry",
            lastError: e.status === 503 ? "not_configured" : "provider_error",
            nextAt: new Date(
              Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts),
            ),
          },
          $unset: { owner: "", leaseUntil: "" },
        },
      );
    }
    processed++;
  }
  return processed;
}
