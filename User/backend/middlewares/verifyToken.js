const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ 'Bearer ...'

  if (!token) {
    return res.status(401).json({ error: "Không có token được cung cấp" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token không hợp lệ" });
    }

    // Đảm bảo token phải chứa userId
    req.user = { userId: decoded.userId };
    next();
  });
};

module.exports = verifyToken;
