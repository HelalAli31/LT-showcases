import { connect, initialize } from "./lib/db.mjs";
import { createApi } from "./app.mjs";
const { db, client } = await connect();
await initialize(db);
createApi({ db, client }).listen(Number(process.env.PORT || 3001), "127.0.0.1");
