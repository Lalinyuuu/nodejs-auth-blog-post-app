import { ObjectId } from "mongodb";
import { Router } from "express";
import { db } from "../utils/db.js";
import { protect } from "../middlewares/protect.js"; // ⬅️ เพิ่มบรรทัดนี้

const postRouter = Router();


postRouter.use(protect); 

postRouter.get("/", async (req, res) => {
  const status = req.query.status;
  const keywords = req.query.keywords;
  const page = Number(req.query.page || 1);

  const PAGE_SIZE = 5;
  const skip = PAGE_SIZE * (page - 1);

  const query = {};
  if (status) query.status = status;
  if (keywords) query.title = new RegExp(`${keywords}`, "i");

  const collection = db.collection("posts");
  const posts = await collection
    .find(query)
    .sort({ published_at: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .toArray();

  const count = await collection.countDocuments(query);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return res.json({ data: posts, total_pages: totalPages });
});

// ... ที่เหลือตามเดิม (GET/:id, POST, PUT, DELETE)
export default postRouter;