const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = "your_secret_key";

// ========== LOGIN ==========
router.post("/login", (req, res) => {
  const { Username, Password } = req.body;

  const query = "SELECT * FROM Account WHERE Username = ?";
  db.query(query, [Username], (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const user = results[0];

    if (user.Role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Tài khoản không có quyền truy cập trang admin" });
    }

    bcrypt.compare(Password, user.Password, (err, result) => {
      if (err)
        return res.status(500).json({ error: "Lỗi khi so sánh mật khẩu" });

      if (!result) {
        return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
      }

      const token = jwt.sign(
        { id: user.AccountID, username: user.Username, role: user.Role },
        SECRET_KEY,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Đăng nhập thành công",
        token,
        role: user.Role,
        username: user.Username,
      });
    });
  });
});

// ========== VERIFY TOKEN ==========
router.get("/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    res.json({ message: "Token hợp lệ", user });
  });
});

// ========== GET ALL ACCOUNTS ==========
router.get("/", (req, res) => {
  const query = `
    SELECT a.*, c.Name AS CustomerName, s.Name AS StaffName
    FROM Account a
    LEFT JOIN Customer c ON a.Customer_id = c.CustomerID
    LEFT JOIN Staff s ON a.Staff_id = s.StaffID
  `;
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Lỗi khi lấy danh sách tài khoản" });
    res.json(results);
  });
});

// ========== CREATE ACCOUNT ==========
router.post("/", (req, res) => {
  const {
    Username,
    Password,
    Role,
    Balance = 0,
    Customer_id = null,
    Staff_id = null,
  } = req.body;

  const saltRounds = 10;
  bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: "Lỗi khi mã hóa mật khẩu" });

    const query = `
      INSERT INTO Account (Username, Password, Role, Balance, Customer_id, Staff_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [Username, hashedPassword, Role, Balance, Customer_id, Staff_id],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Lỗi khi tạo tài khoản" });
        res.json({
          message: "Tạo tài khoản thành công",
          insertId: result.insertId,
        });
      }
    );
  });
});

// ========== UPDATE ACCOUNT ==========
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { Username, Password, Role, Balance, Customer_id, Staff_id } = req.body;

  const saltRounds = 10;
  bcrypt.hash(Password, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: "Lỗi khi mã hóa mật khẩu" });

    const query = `
      UPDATE Account
      SET Username = ?, Password = ?, Role = ?, Balance = ?, Customer_id = ?, Staff_id = ?
      WHERE AccountID = ?
    `;
    db.query(
      query,
      [Username, hashedPassword, Role, Balance, Customer_id, Staff_id, id],
      (err) => {
        if (err)
          return res.status(500).json({ error: "Lỗi khi cập nhật tài khoản" });
        res.json({ message: "Cập nhật tài khoản thành công" });
      }
    );
  });
});

// ========== DELETE ACCOUNT ==========
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM Account WHERE AccountID = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xoá tài khoản" });
    res.json({ message: "Xoá tài khoản thành công" });
  });
});

module.exports = router;
