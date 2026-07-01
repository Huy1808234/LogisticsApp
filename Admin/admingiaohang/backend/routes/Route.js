const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT r.*, v.Vehicle_type, v.License_plate, 
           s.Name AS DriverName,
           w1.Name AS StartWarehouse,
           w2.Name AS EndWarehouse
    FROM Route r
    LEFT JOIN Vehicle v ON r.Vehicle_id = v.VehicleID
    LEFT JOIN Staff s ON r.Driver_id = s.StaffID
    LEFT JOIN Warehouse w1 ON r.Start_wh_id = w1.WarehouseID
    LEFT JOIN Warehouse w2 ON r.End_wh_id = w2.WarehouseID
    ORDER BY r.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy lộ trình' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const {
    Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
    Departure_time, Estimated_time, Actual_time, Status
  } = req.body;

  const query = `
    INSERT INTO Route (Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
      Departure_time, Estimated_time, Actual_time, Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
    Departure_time, Estimated_time, Actual_time, Status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi tạo lộ trình' });
    res.json({ message: 'Tạo lộ trình thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {
    Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
    Departure_time, Estimated_time, Actual_time, Status
  } = req.body;

  const query = `
    UPDATE Route
    SET Route_code = ?, Vehicle_id = ?, Driver_id = ?, Start_wh_id = ?, End_wh_id = ?,
        Departure_time = ?, Estimated_time = ?, Actual_time = ?, Status = ?
    WHERE RouteID = ?
  `;

  db.query(query, [Route_code, Vehicle_id, Driver_id, Start_wh_id, End_wh_id,
    Departure_time, Estimated_time, Actual_time, Status, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật lộ trình' });
    res.json({ message: 'Cập nhật lộ trình thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Route WHERE RouteID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá lộ trình' });
    res.json({ message: 'Xoá lộ trình thành công' });
  });
});

module.exports = router;
