// 🐨 Todo: Exercise #5
// สร้าง Middleware ขึ้นมา 1 อันชื่อ Function ว่า `protect`
// เพื่อเอาไว้ตรวจสอบว่า Client แนบ Token มาใน Header ของ Request หรือไม่
import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");


    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const secret = process.env.SECRET_KEY;
    if (!secret) {
      console.error("SECRET_KEY is missing in .env");
      return res.status(500).json({ message: "Internal server error" });
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
}