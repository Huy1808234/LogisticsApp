// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Token decoded:", decoded); 
    req.user = { userId: decoded.userId }; 
    next();
  } catch (err) {
    console.error("❌ Token verify failed:", err);
    return res.status(403).json({ error: "Token hết hạn hoặc không hợp lệ" });
  }
}

module.exports = verifyToken;
