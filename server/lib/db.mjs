import { MongoClient } from "mongodb";
import { catalog, templates, initialSettings } from "./catalog.mjs";
let connection;
export async function connect(config = process.env) {
  if (!config.MONGODB_URI) throw Error("MONGODB_URI is required");
  connection ??= new MongoClient(config.MONGODB_URI, {
    maxPoolSize: 8,
    serverSelectionTimeoutMS: 10000,
  })
    .connect()
    .catch((error) => {
      connection = undefined;
      throw error;
    });
  const client = await connection,
    db = client.db(config.MONGODB_DB || "LT_Proposals");
  return { client, db };
}
export async function initialize(db) {
  await Promise.all([
    db
      .collection("sessions")
      .createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("challenges")
      .createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("limits")
      .createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("offers")
      .createIndex({ tokenHash: 1 }, { unique: true, sparse: true }),
    db.collection("offers").createIndex({ createdAt: -1 }),
    db.collection("contracts").createIndex({ offerId: 1 }, { unique: true }),
    db.collection("jobs").createIndex({ key: 1 }, { unique: true }),
    db.collection("jobs").createIndex({ status: 1, nextAt: 1 }),
    db.collection("audit").createIndex({ subject: 1, at: -1 }),
  ]);
  await db
    .collection("settings")
    .updateOne(
      { _id: "main" },
      { $setOnInsert: initialSettings },
      { upsert: true },
    );
  for (const c of catalog)
    await db
      .collection("catalog")
      .updateOne({ _id: c._id }, { $setOnInsert: c }, { upsert: true });
  for (const t of templates)
    await db
      .collection("templates")
      .updateOne({ _id: t._id }, { $setOnInsert: t }, { upsert: true });
}
export async function transaction(client, fn) {
  const session = client.startSession();
  try {
    return await session.withTransaction(() => fn(session), {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
    });
  } finally {
    await session.endSession();
  }
}
