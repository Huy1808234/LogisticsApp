const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách tất cả giao dịch
router.get('/', (req, res) => {
  const query = `
    SELECT t.*, c.Name AS CustomerName, o.Order_code
    FROM Transactions t
    LEFT JOIN Customer c ON t.Customer_id = c.CustomerID
    LEFT JOIN \`Order\` o ON t.Order_id = o.OrderID
    ORDER BY t.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy giao dịch' });
    res.json(results);
  });
});

// Tạo giao dịch mới
router.post('/', (req, res) => {
  const { Customer_id, Order_id, Amount, Transansaction_type, Status, Description } = req.body;
  const query = `
    INSERT INTO Transactions (Customer_id, Order_id, Amount, Transansaction_type, Status, Description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Customer_id, Order_id, Amount, Transansaction_type, Status, Description], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm giao dịch' });
    res.json({ message: 'Thêm giao dịch thành công', insertId: result.insertId });
  });
});

// Cập nhật giao dịch
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Amount, Transansaction_type, Status, Description } = req.body;
  const query = `
    UPDATE Transactions
    SET Amount = ?, Transansaction_type = ?, Status = ?, Description = ?
    WHERE Transaction_id = ?
  `;
  db.query(query, [Amount, Transansaction_type, Status, Description, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật giao dịch' });
    res.json({ message: 'Cập nhật giao dịch thành công' });
  });
});

// API: Tổng quan doanh thu & đơn hàng
router.get('/revenue/summary', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(DISTINCT OrderID) FROM \`Order\`) AS totalOrders,
      (SELECT SUM(Amount) FROM Payment) AS totalRevenue,
      (SELECT COUNT(DISTINCT Driver_id) FROM Vehicle) AS totalDrivers,
      (SELECT COUNT(DISTINCT o.Sender_id) FROM \`Order\` o) AS totalCustomers
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('[ERROR] /revenue/summary:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results[0]);
  });
});

// API: Doanh thu theo ngày
router.get('/revenue/by-day', (req, res) => {
  const query = `
    SELECT 
      DATE(Created_at) AS RevenueDate,
      SUM(Amount) AS TotalRevenue
    FROM Payment
    GROUP BY DATE(Created_at)
    ORDER BY RevenueDate DESC
  `;
  db.query(query, (err, rows) => {
    if (err) {
      console.error('[ERROR] /revenue/by-day:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

// API: Doanh thu theo tháng
router.get('/revenue/by-month', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(Created_at, '%Y-%m') AS Month,
      SUM(Amount) AS TotalRevenue
    FROM Payment
    GROUP BY Month
    ORDER BY Month DESC
  `;
  db.query(query, (err, rows) => {
    if (err) {
      console.error('[ERROR] /revenue/by-month:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

// API: Doanh thu theo phương thức thanh toán
router.get('/revenue/by-method', (req, res) => {
  const query = `
    SELECT 
      Payment_method,
      COUNT(*) AS TotalPayments,
      SUM(Amount) AS TotalRevenue
    FROM Payment
    GROUP BY Payment_method
    ORDER BY TotalRevenue DESC
  `;
  db.query(query, (err, rows) => {
    if (err) {
      console.error('[ERROR] /revenue/by-method:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

module.exports = router;
