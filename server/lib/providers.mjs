import nodemailer from "nodemailer";
import { HttpError } from "./security.mjs";
import { whatsappConfigured, whatsappToken, whatsappConfig } from "./meta.mjs";
export function providers(config, request = fetch) {
  const mailReady = !!(config.MAIL_USER && config.MAIL_PASS);
  const smtp = mailReady
    ? nodemailer.createTransport({
        host: config.SMTP_HOST || "smtp.gmail.com",
        port: Number(config.SMTP_PORT || 465),
        secure: config.SMTP_SECURE !== "false",
        auth: { user: config.MAIL_USER, pass: config.MAIL_PASS },
        connectionTimeout: 10000,
        socketTimeout: 20000,
      })
    : null;
  return {
    mailReady,
    whatsappReady: whatsappConfigured(config),
    async email({ to, subject, text, messageId }) {
      if (!smtp) throw new HttpError(503, "שירות הדוא״ל אינו מוגדר");
      const result = await smtp.sendMail({
        from: config.MAIL_FROM || config.MAIL_USER,
        to,
        subject,
        text,
        messageId,
      });
      if (!result.accepted?.length || result.rejected?.length)
        throw Error("Email rejected");
      return result.messageId;
    },
    async whatsapp({ to, contractId, settings }) {
      const effective = whatsappConfig(config, settings);
      if (!whatsappConfigured(effective))
        throw new HttpError(503, "WhatsApp not configured");
      const version = effective.META_GRAPH_VERSION || "v25.0";
      if (
        !/^v\d+\.\d+$/.test(version) ||
        !/^\d+$/.test(effective.META_PHONE_NUMBER_ID)
      )
        throw Error("Invalid Meta configuration");
      const response = await request(
        `https://graph.facebook.com/${version}/${effective.META_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken(effective)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace(/\D/g, ""),
            type: "template",
            template: {
              name: effective.META_TEMPLATE_NAME,
              language: { code: effective.META_TEMPLATE_LANGUAGE },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: contractId }],
                },
              ],
            },
          }),
          signal: AbortSignal.timeout(20000),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.messages?.[0]?.id) {
        const providerCode = Number(data.error?.code);
        throw Object.assign(Error("WhatsApp provider rejected notification"), {
          code:
            Number.isInteger(providerCode) && providerCode > 0
              ? `META_${providerCode}`
              : "META_REJECTED",
        });
      }
      return data.messages[0].id;
    },
  };
}
