// A Facebook Page token is never implicitly used as a WhatsApp sender token.
export const whatsappToken = (config) =>
  config.META_WHATSAPP_ACCESS_TOKEN || config.META_TOKEN;
export const whatsappConfigured = (config) =>
  !!(
    config.META_SEND_ENABLED === "true" &&
    whatsappToken(config) &&
    config.META_PHONE_NUMBER_ID &&
    config.META_TEMPLATE_NAME &&
    config.META_TEMPLATE_LANGUAGE
  );
export const whatsappConfig = (config, settings = {}) => ({
  ...config,
  META_SEND_ENABLED:
    settings.whatsappEnabled === undefined
      ? config.META_SEND_ENABLED
      : String(settings.whatsappEnabled),
  META_TEMPLATE_NAME:
    settings.whatsappTemplateName || config.META_TEMPLATE_NAME,
  META_TEMPLATE_LANGUAGE:
    settings.whatsappTemplateLanguage || config.META_TEMPLATE_LANGUAGE,
});

export function verificationResponse(query, config) {
  const token = config.META_VERIFY_TOKEN || config.META_WEBHOOK_VERIFY_TOKEN;
  const challenge = query["hub.challenge"];
  if (
    token &&
    query["hub.mode"] === "subscribe" &&
    query["hub.verify_token"] === token &&
    typeof challenge === "string" &&
    challenge.length > 0 &&
    challenge.length <= 1000
  )
    return { status: 200, body: challenge };
  return { status: 403, body: "Forbidden" };
}
