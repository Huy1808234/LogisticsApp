const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = 'SELECT * FROM Service';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách dịch vụ' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Service_name, Description, Price, Delivery_time_min, Delivery_time_max, Is_active } = req.body;
  const query = `
    INSERT INTO Service (Service_name, Description, Price, Delivery_time_min, Delivery_time_max, Is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Service_name, Description, Price, Delivery_time_min, Delivery_time_max, Is_active], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm dịch vụ' });
    res.json({ message: 'Thêm dịch vụ thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Service_name, Description, Price, Delivery_time_min, Delivery_time_max, Is_active } = req.body;
  const query = `
    UPDATE Service
    SET Service_name = ?, Description = ?, Price = ?, Delivery_time_min = ?, Delivery_time_max = ?, Is_active = ?
    WHERE Service_id = ?
  `;
  db.query(query, [Service_name, Description, Price, Delivery_time_min, Delivery_time_max, Is_active, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật dịch vụ' });
    res.json({ message: 'Cập nhật dịch vụ thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM Service WHERE Service_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá dịch vụ' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
    }
    res.json({ message: 'Xoá dịch vụ thành công' });
  });
});

module.exports = router;
