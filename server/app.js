import "dotenv/config";
import express from "express";
import cors from "cors";
import { client } from "./utils/db.js";

import authRouter from "./apps/auth.js";
import postRouter from "./apps/posts.js"; 

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/posts", postRouter);   

app.get("/", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
(async () => {
  await client.connect();
  console.log("✅ Connected to MongoDB");
  app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
})();