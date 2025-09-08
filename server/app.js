import "dotenv/config";
import express from "express";
import cors from "cors";
import { client } from "./utils/db.js";
import authRouter from "./apps/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;

async function start() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (e) {
    console.error("Mongo connect error:", e);
    process.exit(1);
  }
}

start();