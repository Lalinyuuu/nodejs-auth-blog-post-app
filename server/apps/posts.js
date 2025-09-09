import { ObjectId } from "mongodb";
import { Router } from "express";
import { db } from "../utils/db.js";
import { protect } from "../middlewares/protect.js";

const postRouter = Router();
postRouter.use(protect);

postRouter.get("/", async (req, res) => {
  const status = (req.query.status || "").trim();
  const keywords = (req.query.keywords || "").trim();
  const page = Math.max(1, parseInt(req.query.page || "1", 10));

  const PAGE_SIZE = 5;
  const skip = PAGE_SIZE * (page - 1);

  const query = {};
  if (status) query.status = status;               
  if (keywords) query.title = new RegExp(`${keywords}`, "i");

  const col = db.collection("posts");
  const [posts, count] = await Promise.all([
    col.find(query).sort({ published_at: -1, _id: -1 }).skip(skip).limit(PAGE_SIZE).toArray(),
    col.countDocuments(query),
  ]);

  return res.json({ data: posts, total_pages: Math.max(1, Math.ceil(count / PAGE_SIZE)) });
});


postRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "invalid id" });

  const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
  if (!post) return res.status(404).json({ error: "not found" });
  return res.json({ data: post });
});


postRouter.post("/", async (req, res) => {
  const { title, content, status = "draft" } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: "title & content required" });
  if (!["draft", "published"].includes(status)) return res.status(400).json({ error: "bad status" });

  const now = new Date();
  const doc = {
    title,
    content,
    status,
    created_at: now,
    updated_at: now,
    published_at: status === "published" ? now : null,
  };

  const result = await db.collection("posts").insertOne(doc);
  const created = await db.collection("posts").findOne({ _id: result.insertedId });
  return res.status(201).json({ data: created });
});


postRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "invalid id" });

  const { title, content, status } = req.body || {};
  const update = { $set: { updated_at: new Date() } };
  if (title !== undefined) update.$set.title = title;
  if (content !== undefined) update.$set.content = content;
  if (status !== undefined) {
    if (!["draft", "published"].includes(status)) return res.status(400).json({ error: "bad status" });
    update.$set.status = status;
    update.$set.published_at = status === "published" ? new Date() : null;
  }

  const col = db.collection("posts");
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    update,
    { returnDocument: "after" }
  );
  if (!result.value) return res.status(404).json({ error: "not found" });
  return res.json({ data: result.value });
});


postRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "invalid id" });

  const del = await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
  if (!del.deletedCount) return res.status(404).json({ error: "not found" });
  return res.status(204).end();
});

export default postRouter;