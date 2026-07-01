const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT p.*, o.Order_code
    FROM Payment p
    LEFT JOIN \`Order\` o ON p.Order_id = o.OrderID
    ORDER BY p.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách thanh toán' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Order_id, Payment_method, Amount, Payment_date, Transaction_id, Notes } = req.body;
  const query = `
    INSERT INTO Payment (Order_id, Payment_method, Amount, Payment_date, Transaction_id, Notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Order_id, Payment_method, Amount, Payment_date, Transaction_id, Notes], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm thanh toán' });
    res.json({ message: 'Thêm thanh toán thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Order_id, Payment_method, Amount, Payment_date, Transaction_id, Notes } = req.body;
  const query = `
    UPDATE Payment
    SET Order_id = ?, Payment_method = ?, Amount = ?, Payment_date = ?, Transaction_id = ?, Notes = ?
    WHERE PaymentID = ?
  `;
  db.query(query, [Order_id, Payment_method, Amount, Payment_date, Transaction_id, Notes, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật thanh toán' });
    res.json({ message: 'Cập nhật thanh toán thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Payment WHERE PaymentID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá thanh toán' });
    res.json({ message: 'Xoá thanh toán thành công' });
  });
});

module.exports = router;
