import { test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import {
  setup,
  input,
  post,
  put,
  publish,
  verify,
  signing,
  origin,
} from "./helpers/fixture.mjs";
import { unseal, digest } from "../server/lib/security.mjs";
import { createHmac } from "node:crypto";
test("complete secured offer, immutable pricing, idempotent signing, private PDF and delivery failure", async (t) => {
  const f = await setup();
  t.after(() => f.close());
  await t.test("authorization and CSRF", async () => {
    assert.equal((await supertest(f.app).get("/api/admin/offers")).status, 401);
    assert.equal(
      (
        await f.admin
          .post("/api/admin/offers")
          .set("Origin", "https://evil.test")
          .send(input())
      ).status,
      403,
    );
  });
  const o = await publish(f);
  assert.equal(o.snapshot.quotes.find((q) => q.months === 24).total, 1002840);
  await t.test("OTP and private access", async () => {
    assert.equal((await f.customer.get("/api/offers/" + o.token)).status, 200);
    assert.equal(
      (
        await post(f.customer, `offers/${o.token}/otp`, {
          email: "attacker@example.test",
        })
      ).status,
      200,
    );
    assert.equal(f.messages.length, 0);
    const code = await verify(f, o);
    assert.equal(
      (
        await post(f.customer, `offers/${o.token}/verify`, {
          email: "client@example.test",
          code,
        })
      ).status,
      401,
    );
    const visible = await f.customer.get("/api/offers/" + o.token);
    assert.equal(visible.status, 200);
    assert.ok(!JSON.stringify(visible.body).includes("INTERNAL-NEVER-PUBLIC"));
  });
  await t.test("snapshot and published terms cannot be edited", async () => {
    await put(f.admin, "admin/rules", { rules: [{ months: 24, bps: 5000 }] });
    assert.equal(
      (await put(f.admin, "admin/offers/" + o.id, input())).status,
      409,
    );
    const visible = await f.customer.get("/api/offers/" + o.token);
    assert.equal(
      visible.body.snapshot.quotes.find((q) => q.months === 24).monthly,
      31410,
    );
    assert.equal(
      (
        await f.customer.get(
          `/api/offers/${o.token}/agreement?tier=CUSTOM&months=24`,
        )
      ).status,
      400,
    );
  });
  const data = await signing(f.customer, o);
  await t.test("tampered amounts and agreement digest rejected", async () => {
    assert.equal(
      (
        await post(f.customer, `offers/${o.token}/sign`, {
          ...data,
          monthly: 1,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await post(f.customer, `offers/${o.token}/sign`, {
          ...data,
          agreementDigest: "a".repeat(64),
        })
      ).status,
      409,
    );
  });
  let contractId;
  await t.test(
    "concurrent retries produce exactly one contract and audit",
    async () => {
      const [a, b] = await Promise.all([
        post(f.customer, `offers/${o.token}/sign`, data),
        post(f.customer, `offers/${o.token}/sign`, data),
      ]);
      assert.ok([200, 201].includes(a.status), JSON.stringify(a.body));
      assert.ok([200, 201].includes(b.status), JSON.stringify(b.body));
      assert.equal(a.body.contractId, b.body.contractId);
      contractId = a.body.contractId;
      assert.equal(await f.db.collection("contracts").countDocuments(), 1);
      assert.equal(
        await f.db
          .collection("audit")
          .countDocuments({ action: "contract_signed" }),
        1,
      );
      assert.equal(await f.db.collection("jobs").countDocuments(), 3);
    },
  );
  await t.test(
    "private immutable artifacts and separate payment state",
    async () => {
      assert.equal(
        (
          await supertest(f.app).get(
            `/api/customer/contracts/${contractId}/pdf`,
          )
        ).status,
        401,
      );
      const pdf = await f.customer.get(
        `/api/customer/contracts/${contractId}/pdf`,
      );
      assert.equal(pdf.status, 200);
      assert.ok(pdf.body.subarray(0, 5).toString() === "%PDF-");
      const c = await f.db.collection("contracts").findOne({ _id: contractId });
      assert.equal(unseal(c.payload, f.config).quote.monthly, 31410);
      assert.equal(digest(c.evidence), c.evidenceDigest);
      assert.equal(c.artifact.driver, "mongo");
      const before = c.artifact.digest;
      await post(f.admin, `admin/contracts/${contractId}/payment`, {
        payment: "paid",
        service: "active",
      });
      assert.equal(
        (await f.db.collection("contracts").findOne({ _id: contractId }))
          .artifact.digest,
        before,
      );
      assert.equal(
        (await post(f.admin, `admin/offers/${o.id}/revoke`)).status,
        409,
      );
    },
  );
  await t.test(
    "notification failure never loses contract; test WhatsApp stays disabled",
    async () => {
      await Promise.allSettled(f.deferred);
      assert.equal(await f.db.collection("contracts").countDocuments(), 1);
      assert.equal(
        (await f.db.collection("jobs").findOne({ channel: "whatsapp" })).status,
        "not_configured",
      );
    },
  );
  await t.test(
    "raw contract access remains isolated; legacy recovery uses fresh OTP",
    async () => {
      const other = await publish(f, {
        ...input(),
        recipientEmail: "other@example.test",
      });
      const agent = supertest.agent(f.app);
      await verify(f, other, agent, "other@example.test");
      assert.equal((await agent.get("/api/offers/" + o.token)).status, 200);
      assert.equal(
        (await agent.get(`/api/customer/contracts/${contractId}/pdf`)).status,
        404,
      );
      const portal = supertest.agent(f.app);
      await post(portal, `contract-access/${contractId}/otp`, {
        email: "client@example.test",
      });
      const code = f.messages.at(-1).text.match(/\b\d{6}\b/)[0];
      assert.equal(
        (
          await post(portal, `contract-access/${contractId}/verify`, {
            email: "client@example.test",
            code,
          })
        ).status,
        200,
      );
      assert.equal(
        (await portal.get(`/api/customer/contracts/${contractId}/pdf`)).status,
        200,
      );
    },
  );
  await t.test("revoked and expired offers cannot be opened", async () => {
    const revoked = await publish(f);
    await post(f.admin, `admin/offers/${revoked.id}/revoke`);
    assert.equal(
      (await f.customer.get(`/api/offers/${revoked.token}/access`)).status,
      410,
    );
    const expired = await publish(f);
    await f.db
      .collection("offers")
      .updateOne({ _id: expired.id }, { $set: { expires: new Date(0) } });
    assert.equal(
      (await f.customer.get(`/api/offers/${expired.token}/access`)).status,
      410,
    );
  });
  await t.test("webhooks require authenticity", async () => {
    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                statuses: [
                  {
                    id: "wa-test-id",
                    status: "delivered",
                    timestamp: String(Math.floor(Date.now() / 1000)),
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    await f.db.collection("jobs").insertOne({
      _id: "webhook-job",
      key: "webhook-job",
      providerId: "wa-test-id",
      channel: "whatsapp",
      status: "accepted",
    });
    assert.equal(
      (await supertest(f.app).post("/api/webhooks/whatsapp").send(body)).status,
      401,
    );
    const signature =
      "sha256=" +
      createHmac("sha256", f.config.META_APP_SECRET)
        .update(JSON.stringify(body))
        .digest("hex");
    assert.equal(
      (
        await supertest(f.app)
          .post("/api/webhooks/whatsapp")
          .set("x-hub-signature-256", signature)
          .send(body)
      ).status,
      200,
    );
    assert.equal(
      (await f.db.collection("jobs").findOne({ _id: "webhook-job" })).status,
      "delivered",
    );
  });
});
test("PDF generation failure rolls back signing; production legal gate rejects unapproved template", async (t) => {
  const f = await setup({
    makePdf: async () => {
      throw Error("PDF unavailable");
    },
  });
  t.after(() => f.close());
  const o = await publish(f);
  await verify(f, o);
  const data = await signing(f.customer, o);
  assert.equal(
    (await post(f.customer, `offers/${o.token}/sign`, data)).status,
    500,
  );
  assert.equal(await f.db.collection("contracts").countDocuments(), 0);
  assert.ok(
    !(await f.db.collection("offers").findOne({ _id: o.id })).contractId,
  );
  f.config.BINDING_SIGNATURES_ENABLED = "true";
  assert.equal(
    (await post(f.customer, `offers/${o.token}/sign`, data)).status,
    403,
  );
});
