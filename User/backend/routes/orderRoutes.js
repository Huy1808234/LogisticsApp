const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middlewares/authMiddleware");
const db = require("../utils/db"); // THIẾT YẾU để truy vấn MySQL

// Routes bảo vệ
router.post("/orders", verifyToken, orderController.createOrder);
router.get("/orders/history", verifyToken, orderController.getCustomerOrders);
router.get("/orders/:code/detail", verifyToken, orderController.getOrderDetail);

// Không cần token
router.get("/orders", orderController.getAllOrders);
router.get("/orders/:id", orderController.getOrderById);
router.get("/track/:orderCode", orderController.trackOrder);
router.post("/chatbot/create", orderController.createOrderFromChatbot);
router.put("/orders/cancel/:code", orderController.cancelOrder);

router.get("/orders/:code/status", async (req, res) => {
  const { code } = req.params;

  try {
    const [[order]] = await db.query(
      `
      SELECT o.Order_code, o.Order_status, o.Payment_status,
             t.Status AS TrackingStatus, t.Staff_id, s.Name AS ShipperName
      FROM \`order\` o
      LEFT JOIN tracking t ON t.Order_id = o.OrderID
      LEFT JOIN staff s ON s.StaffID = t.Staff_id
      WHERE o.Order_code = ?
      ORDER BY t.Timestamp DESC
      LIMIT 1
    `,
      [code]
    );

    if (!order)
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    res.json(order);
  } catch (err) {
    console.error("Lỗi truy vấn trạng thái đơn:", err);
    res.status(500).json({ error: "Lỗi truy vấn trạng thái" });
  }
});

router.post("/feedback", async (req, res) => {
  const { orderId, staffId, rating, comment } = req.body;

  if (!orderId || !staffId || !rating) {
    return res.status(400).json({ error: "Thiếu thông tin đánh giá" });
  }

  try {
    // 🔍 Truy vấn lấy OrderID thật
    const [[orderRow]] = await db.query(
      `SELECT OrderID FROM \`Order\` WHERE Order_code = ? LIMIT 1`,
      [orderId]
    );

    if (!orderRow) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    const numericOrderId = orderRow.OrderID;

    // ✅ Insert đánh giá
    await db.query(
      `INSERT INTO ShipperFeedback (Order_id, Staff_id, Rating, Comment)
       VALUES (?, ?, ?, ?)`,
      [numericOrderId, staffId, rating, comment || null]
    );

    res.json({ message: "Gửi đánh giá thành công" });
  } catch (err) {
    console.error("Lỗi ghi đánh giá:", err);
    res
      .status(500)
      .json({ error: "Lỗi khi gửi đánh giá", detail: err.message });
  }
});

module.exports = router;
