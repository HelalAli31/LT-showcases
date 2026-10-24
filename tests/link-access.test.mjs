import { test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import { setup, publish, signing, post, input } from "./helpers/fixture.mjs";
import { unseal } from "../server/lib/security.mjs";

test("private link supports viewing, signing and repeat PDF downloads without cookies, OTP or SMTP", async (t) => {
  const f = await setup({
    config: { MAIL_USER: "", MAIL_PASS: "" },
    providers: { mailReady: false },
  });
  t.after(() => f.close());
  const o = await publish(f);
  const guest = supertest(f.app);
  assert.equal((await guest.get(`/api/offers/${o.token}`)).status, 200);
  assert.equal(
    (await guest.get(`/api/offers/${o.token}/access`)).body
      .requiresVerification,
    false,
  );
  assert.equal(f.messages.length, 0);
  const body = await signing(guest, o);
  const result = await post(guest, `offers/${o.token}/sign`, body);
  assert.equal(result.status, 201, JSON.stringify(result.body));
  const contract = await f.db
    .collection("contracts")
    .findOne({ _id: result.body.contractId });
  assert.equal(contract.evidence.accessMethod, "offer_link");
  assert.equal(contract.evidence.emailVerified, false);
  assert.equal(contract.evidence.verifiedAt, null);
  assert.equal(contract.evidence.verifiedEmail, null);
  const payload = unseal(contract.payload, f.config);
  assert.ok(payload.html.includes("כתובת הדוא״ל לא אומתה בקוד"));
  assert.ok(!payload.html.includes("דוא״ל אומת בקוד חד-פעמי:"));
  await f.db
    .collection("offers")
    .updateOne({ _id: o.id }, { $set: { expires: new Date(0) } });
  const reopened = await supertest(f.app).get(`/api/offers/${o.token}`);
  assert.equal(reopened.body.contractId, contract._id);
  assert.equal(
    (await guest.get(`/api/offers/${o.token}/contract`)).body._id,
    contract._id,
  );
  const pdf = await supertest(f.app).get(`/api/offers/${o.token}/contract/pdf`);
  assert.equal(pdf.status, 200);
  assert.equal(pdf.body.subarray(0, 5).toString(), "%PDF-");
  assert.equal(
    (await guest.get(`/api/customer/contracts/${contract._id}/pdf`)).status,
    401,
  );
  const other = await publish(f, {
    ...input(),
    recipientEmail: "other@example.test",
  });
  assert.equal(
    (await guest.get(`/api/offers/${other.token}/contract`)).status,
    404,
  );
  assert.equal(
    (await guest.get(`/api/offers/${"0".repeat(64)}/contract/pdf`)).status,
    404,
  );
  assert.equal((await guest.get("/api/admin/offers")).status, 401);
});

test("link access still enforces expiry, revocation and origin checks", async (t) => {
  const f = await setup();
  t.after(() => f.close());
  const expired = await publish(f);
  await f.db
    .collection("offers")
    .updateOne({ _id: expired.id }, { $set: { expires: new Date(0) } });
  assert.equal(
    (await f.customer.get(`/api/offers/${expired.token}`)).status,
    410,
  );
  const revoked = await publish(f);
  await post(f.admin, `admin/offers/${revoked.id}/revoke`);
  assert.equal(
    (
      await f.customer.get(
        `/api/offers/${revoked.token}/agreement?tier=PRO&months=24`,
      )
    ).status,
    410,
  );
  const open = await publish(f);
  assert.equal(
    (
      await supertest(f.app)
        .post(`/api/offers/${open.token}/sign`)
        .set("Origin", "https://other.example")
        .send({})
    ).status,
    403,
  );
});
