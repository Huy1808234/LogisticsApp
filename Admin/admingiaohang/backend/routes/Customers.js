const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {
  db.query('SELECT * FROM Customer', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách khách hàng' });
    res.json(results);
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Customer_type, Name, Phone, Street, Ward, District, City } = req.body;
  const query = 'UPDATE Customer SET Customer_type = ?, Name = ?, Phone = ?, Street = ?, Ward = ?, District = ?, City = ? WHERE CustomerID = ?';
  db.query(query, [Customer_type, Name, Phone, Street, Ward, District, City, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật khách hàng' });
    res.json({ message: 'Cập nhật khách hàng thành công' });
  });
});

module.exports = router;
