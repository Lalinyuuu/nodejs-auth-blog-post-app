import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../utils/db.js";

const authRouter = Router();

// โค้ดนี้อยู่ในไฟล์ server/apps/auth.js

authRouter.post("/register", async (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  const salt = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  user.password = await bcrypt.hash(user.password, salt);

  const collection = db.collection("users");
  await collection.insertOne(user);

  return res.json({
    message: "User has been created successfully",
  });
});

export default authRouter;
