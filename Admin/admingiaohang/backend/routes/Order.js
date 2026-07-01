const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT o.*, c.Name AS SenderName, s.Service_name
    FROM \`Order\` o
    LEFT JOIN Customer c ON o.Sender_id = c.CustomerID
    LEFT JOIN Service s ON o.Service_id = s.Service_id
    ORDER BY o.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Order_code, Sender_id, Service_id, Total_package, Total_weight, Ship_cost, Payment_status, Order_status } = req.body;
  const query = `
    INSERT INTO \`Order\` (Order_code, Sender_id, Service_id, Total_package, Total_weight, Ship_cost, Payment_status, Order_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Order_code, Sender_id, Service_id, Total_package, Total_weight, Ship_cost, Payment_status, Order_status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi tạo đơn hàng' });
    res.json({ message: 'Thêm đơn hàng thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Order_code, Sender_id, Service_id, Total_package, Total_weight, Ship_cost, Payment_status, Order_status } = req.body;
  const query = `
    UPDATE \`Order\`
    SET Order_code = ?, Sender_id = ?, Service_id = ?, Total_package = ?, Total_weight = ?, Ship_cost = ?, Payment_status = ?, Order_status = ?
    WHERE OrderID = ?
  `;
  db.query(query, [Order_code, Sender_id, Service_id, Total_package, Total_weight, Ship_cost, Payment_status, Order_status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật đơn hàng' });
    res.json({ message: 'Cập nhật đơn hàng thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM `Order` WHERE OrderID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá đơn hàng' });
    res.json({ message: 'Xoá đơn hàng thành công' });
  });
});

module.exports = router;
