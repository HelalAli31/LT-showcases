import { test } from "node:test";
import assert from "node:assert/strict";
import {
  verificationResponse,
  whatsappToken,
  whatsappConfigured,
} from "../server/lib/meta.mjs";
import { providers } from "../server/lib/providers.mjs";
const query = {
  "hub.mode": "subscribe",
  "hub.verify_token": "test-verify-token",
  "hub.challenge": "123456789",
};
test("Meta callback accepts the supplied verify-token name without database initialization", () => {
  assert.deepEqual(
    verificationResponse(query, { META_VERIFY_TOKEN: "test-verify-token" }),
    { status: 200, body: "123456789" },
  );
});
test("legacy verify-token name remains supported with deterministic precedence", () => {
  assert.equal(
    verificationResponse(query, {
      META_WEBHOOK_VERIFY_TOKEN: "test-verify-token",
    }).status,
    200,
  );
  assert.equal(
    verificationResponse(query, {
      META_VERIFY_TOKEN: "different-token",
      META_WEBHOOK_VERIFY_TOKEN: "test-verify-token",
    }).status,
    403,
  );
});
test("Meta verification fails closed for invalid, missing, and repeated query parameters", () => {
  for (const q of [
    { ...query, "hub.mode": "other" },
    { ...query, "hub.verify_token": "wrong" },
    { ...query, "hub.challenge": "" },
    { ...query, "hub.challenge": ["a", "b"] },
  ])
    assert.equal(
      verificationResponse(q, { META_VERIFY_TOKEN: "test-verify-token" })
        .status,
      403,
    );
  assert.equal(verificationResponse(query, {}).status, 403);
});
test("Facebook Page credentials alone never enable WhatsApp sends", () => {
  const c = {
    META_SEND_ENABLED: "true",
    META_PAGE_ACCESS_TOKEN: "test-page-token",
    META_PAGE_ID: "123",
    META_PHONE_NUMBER_ID: "456",
    META_TEMPLATE_NAME: "test_template",
    META_TEMPLATE_LANGUAGE: "he",
  };
  assert.equal(whatsappConfigured(c), false);
  assert.equal(whatsappToken(c), undefined);
});
test("explicit WhatsApp token takes precedence and still requires sender/template configuration", () => {
  const c = {
    META_SEND_ENABLED: "true",
    META_WHATSAPP_ACCESS_TOKEN: "test-wa-token",
    META_TOKEN: "legacy-test-token",
    META_PHONE_NUMBER_ID: "456",
    META_TEMPLATE_NAME: "test_template",
    META_TEMPLATE_LANGUAGE: "he",
  };
  assert.equal(whatsappToken(c), "test-wa-token");
  assert.equal(whatsappConfigured(c), true);
  assert.equal(whatsappConfigured({ ...c, META_SEND_ENABLED: "false" }), false);
  assert.equal(whatsappConfigured({ ...c, META_PHONE_NUMBER_ID: "" }), false);
});
test("WhatsApp provider uses Graph v25, the WhatsApp sender, and the exact approved template", async () => {
  let captured;
  const config = {
    META_SEND_ENABLED: "true",
    META_WHATSAPP_ACCESS_TOKEN: "test-wa-token",
    META_PHONE_NUMBER_ID: "456",
    META_TEMPLATE_NAME: "contract_notice",
    META_TEMPLATE_LANGUAGE: "he",
    META_GRAPH_VERSION: "v25.0",
  };
  const p = providers(config, async (url, request) => {
    captured = { url, request };
    return {
      ok: true,
      json: async () => ({ messages: [{ id: "test-message-id" }] }),
    };
  });
  assert.equal(
    await p.whatsapp({ to: "+972543596761", contractId: "test-contract" }),
    "test-message-id",
  );
  assert.equal(captured.url, "https://graph.facebook.com/v25.0/456/messages");
  assert.equal(captured.request.headers.Authorization, "Bearer test-wa-token");
  const body = JSON.parse(captured.request.body);
  assert.equal(body.messaging_product, "whatsapp");
  assert.equal(body.template.name, "contract_notice");
  assert.equal(body.template.components[0].parameters[0].text, "test-contract");
});
test("WhatsApp provider reports rejection without exposing credentials", async () => {
  const config = {
    META_SEND_ENABLED: "true",
    META_TOKEN: "test-only-token",
    META_PHONE_NUMBER_ID: "456",
    META_TEMPLATE_NAME: "contract_notice",
    META_TEMPLATE_LANGUAGE: "he",
  };
  const p = providers(config, async () => ({
    ok: false,
    json: async () => ({ error: { code: 190, message: "provider error" } }),
  }));
  await assert.rejects(
    () => p.whatsapp({ to: "+972543596761", contractId: "test-contract" }),
    /provider rejected/,
  );
});
