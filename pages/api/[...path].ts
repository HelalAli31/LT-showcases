import { connect, initialize } from "../../server/lib/db.mjs";
import { createApi } from "../../server/app.mjs";
import { waitUntil } from "@vercel/functions";
import { verificationResponse } from "../../server/lib/meta.mjs";
let handler;
export const config = {
  api: { bodyParser: false, responseLimit: "4mb", externalResolver: true },
  maxDuration: 60,
};
export default async function api(req, res) {
  // Callback verification must also work while the database is being configured.
  if (
    req.method === "GET" &&
    new URL(req.url, "http://localhost").pathname === "/api/webhooks/whatsapp"
  ) {
    const result = verificationResponse(req.query, process.env);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(result.status).end(result.body);
  }
  try {
    if (!handler) {
      const { db, client } = await connect();
      await initialize(db);
      handler = createApi({
        db,
        client,
        defer: (promise) => waitUntil(promise),
      });
    }
    return await new Promise<void>((resolve) => {
      res.once("finish", resolve);
      res.once("close", resolve);
      handler(req, res);
    });
  } catch {
    res
      .status(503)
      .json({ error: "השירות אינו מוגדר או אינו זמין. פנו למנהל." });
  }
}
