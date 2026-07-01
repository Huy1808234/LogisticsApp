const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:routeId/points', (req, res) => {
  const routeId = req.params.routeId;
  const query = `
    SELECT rp.*, w.Name AS WarehouseName
    FROM Route_point rp
    LEFT JOIN Warehouse w ON rp.Warehouse_id = w.WarehouseID
    WHERE rp.Route_id = ?
    ORDER BY rp.Sequence_number ASC
  `;
  db.query(query, [routeId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy điểm dừng' });
    res.json(results);
  });
});

router.post('/:routeId/points', (req, res) => {
  const routeId = req.params.routeId;
  const { Warehouse_id, Sequence_number, Estimated_arrival, Actual_arrival, Status } = req.body;
  const query = `
    INSERT INTO Route_point (Route_id, Warehouse_id, Sequence_number, Estimated_arrival, Actual_arrival, Status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [routeId, Warehouse_id, Sequence_number, Estimated_arrival, Actual_arrival, Status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm điểm dừng' });
    res.json({ message: 'Thêm điểm dừng thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Sequence_number, Estimated_arrival, Actual_arrival, Status } = req.body;
  const query = `
    UPDATE Route_point
    SET Sequence_number = ?, Estimated_arrival = ?, Actual_arrival = ?, Status = ?
    WHERE Route_pointID = ?
  `;
  db.query(query, [Sequence_number, Estimated_arrival, Actual_arrival, Status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật điểm dừng' });
    res.json({ message: 'Cập nhật điểm dừng thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Route_point WHERE Route_pointID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá điểm dừng' });
    res.json({ message: 'Xoá điểm dừng thành công' });
  });
});

module.exports = router;
