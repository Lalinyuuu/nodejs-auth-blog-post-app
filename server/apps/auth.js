// server/apps/auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../utils/db.js";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body || {};

    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const users = db.collection("users");


    const existed = await users.findOne({ username });
    if (existed) {
      return res.status(409).json({ message: "Username already exists" });
    }


    const hash = await bcrypt.hash(password, 10);

    await users.insertOne({
      username,
      password: hash,
      firstName,
      lastName,
      created_at: new Date(),
    });

    return res.status(201).json({
      message: "User has been created successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    const users = db.collection("users");
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid username or password" });
    }


    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });

    return res.json({
      message: "login successfully",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default authRouter;