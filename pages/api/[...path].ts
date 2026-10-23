import { connect, initialize } from "../../server/lib/db.mjs";
import { createApi } from "../../server/app.mjs";
import { waitUntil } from "@vercel/functions";
let handler;
export const config = {
  api: { bodyParser: false, responseLimit: "12mb", externalResolver: true },
  maxDuration: 60,
};
export default async function api(req, res) {
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
