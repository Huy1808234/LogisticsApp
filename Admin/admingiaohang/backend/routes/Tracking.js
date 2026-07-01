const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT t.*, s.Name AS StaffName
    FROM Tracking t
    LEFT JOIN Staff s ON t.Staff_id = s.StaffID
    ORDER BY t.Timestamp ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy toàn bộ tracking' });
    res.json(results);
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Status } = req.body;
  const query = `UPDATE Tracking SET Status = ? WHERE TrackingID = ?`;
  db.query(query, [Status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
    res.json({ message: 'Cập nhật trạng thái thành công' });
  });
});

module.exports = router;
