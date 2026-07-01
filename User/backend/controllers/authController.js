const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../utils/db");
require("dotenv").config();

// Đăng ký tài khoản
exports.register = async (req, res) => {
  const { email, username, password, phone, street, ward, district, city } =
    req.body;

  if (
    !email?.trim() ||
    !username?.trim() ||
    !password?.trim() ||
    !phone?.trim()
  ) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
  }

  try {
    const [emailCheck] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: "Email đã được đăng ký" });
    }

    const [usernameCheck] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (usernameCheck.length > 0) {
      return res.status(400).json({ error: "Tên người dùng đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      `INSERT INTO users (email, username, password, phone, street, ward, district, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, username, hashedPassword, phone, street, ward, district, city]
    );

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Lỗi đăng ký" });
  }
};

// Đăng nhập trả về accessToken + refreshToken
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];
    if (!user)
      return res.status(401).json({ error: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Sai email hoặc mật khẩu" });

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Lỗi đăng nhập" });
  }
};

// Làm mới accessToken từ refreshToken
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Không có refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({ error: "Refresh token không hợp lệ" });
  }
};

// Đăng xuất (client chỉ cần xoá token)
exports.logout = (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};

// Quên mật khẩu - gửi link email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập email" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    if (!user) {
      return res.json({
        message:
          "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await db.execute(
      "UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE id = ?",
      [token, expire, user.id]
    );

    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để tiếp tục:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Đã gửi email đặt lại mật khẩu" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Lỗi gửi email" });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Thiếu token hoặc mật khẩu mới" });
  }

  try {
    const [users] = await db.execute(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > NOW()",
      [token]
    );

    const user = users[0];
    if (!user) {
      return res
        .status(400)
        .json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Không thể đặt lại mật khẩu" });
  }
};
