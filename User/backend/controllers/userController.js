const db = require("../utils/db"); 
exports.getProfile = async (req, res) => {
  const userId = req.user.userId;
  const [rows] = await db.execute(
    "SELECT id, email, username FROM users WHERE id = ?",
    [userId]
  );
  if (!rows.length) return res.status(404).json({ error: "Không tìm thấy người dùng" });
  res.json(rows[0]);
};
