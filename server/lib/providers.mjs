import nodemailer from "nodemailer";
import { HttpError } from "./security.mjs";
export function providers(config) {
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
    whatsappReady: !!(
      config.META_SEND_ENABLED === "true" &&
      config.META_TOKEN &&
      config.META_PHONE_NUMBER_ID &&
      config.META_TEMPLATE_NAME &&
      config.META_TEMPLATE_LANGUAGE
    ),
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
    async whatsapp({ to, contractId }) {
      if (!this.whatsappReady)
        throw new HttpError(503, "WhatsApp not configured");
      const version = config.META_GRAPH_VERSION || "v23.0";
      if (
        !/^v\d+\.\d+$/.test(version) ||
        !/^\d+$/.test(config.META_PHONE_NUMBER_ID)
      )
        throw Error("Invalid Meta configuration");
      const response = await fetch(
        `https://graph.facebook.com/${version}/${config.META_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.META_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace(/\D/g, ""),
            type: "template",
            template: {
              name: config.META_TEMPLATE_NAME,
              language: { code: config.META_TEMPLATE_LANGUAGE },
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
      if (!response.ok || !data.messages?.[0]?.id)
        throw Error("WhatsApp provider rejected notification");
      return data.messages[0].id;
    },
  };
}
