
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "blogdb";

export const client = new MongoClient(uri);
export const db = client.db(dbName);