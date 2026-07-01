const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM Staff', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách nhân viên' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Name, Position, Phone, Email, Employment_date, Is_active } = req.body;
  const query = 'INSERT INTO Staff (Name, Position, Phone, Email, Employment_date, Is_active) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [Name, Position, Phone, Email, Employment_date, Is_active], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm nhân viên' });
    res.json({ message: 'Thêm nhân viên thành công', insertId: result.insertId });
  });
});


router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Name, Position, Phone, Email, Employment_date, Is_active } = req.body;
  const query = 'UPDATE Staff SET Name = ?, Position = ?, Phone = ?, Email = ?, Employment_date = ?, Is_active = ? WHERE StaffID = ?';
  db.query(query, [Name, Position, Phone, Email, Employment_date, Is_active, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật nhân viên' });
    res.json({ message: 'Cập nhật nhân viên thành công' });
  });
});


router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Staff WHERE StaffID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá nhân viên' });
    res.json({ message: 'Xoá nhân viên thành công' });
  });
});

module.exports = router;
