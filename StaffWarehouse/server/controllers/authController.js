const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../utils/db");
require("dotenv").config();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // Đặt thành true nếu dùng HTTPS
    sameSite: "Lax",
};
// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Email and password are required" });

    try {
        const [users] = await db.execute(
            `SELECT
             s.StaffID AS id,
             s.email,
             s.name AS username,
             s.Warehouse_id AS warehouseID,
             a.password,
             a.Role AS role
           FROM Staff s
           JOIN account a ON s.StaffID = a.Staff_id
           WHERE s.email = ?`,
                [email]
        );

        const user = users[0];
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        // Truy vấn role từ bảng account
        const [accounts] = await db.execute(
            "SELECT Role FROM account WHERE Customer_id = ? OR Staff_id = ?",
            [user.id, user.id]
        );
        const role = accounts.length > 0 ? accounts[0].Role : "unknown";

        const accessToken = jwt.sign({ userId: user.id, role, warehouseID: user.warehouseID }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ userId: user.id, role, warehouseID: user.warehouseID }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role,
                warehouseID: user.warehouseID
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
};

// Refresh Token
exports.refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ error: "No refresh token provided" });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 15 * 60 * 1000,
        });
        res.json({ message: "Access token refreshed" });
    } catch (err) {
        console.error("Refresh token error:", err);
        res.status(403).json({ error: "Invalid refresh token" });
    }
};

// Logout
exports.logout = (req, res) => {
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ message: "Logged out successfully" });
};
