const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT v.*, w.Name AS CurrentWarehouse
    FROM Vehicle v
    LEFT JOIN Warehouse w ON v.Current_wh_id = w.WarehouseID
    ORDER BY v.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách phương tiện' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Vehicle_type, License_plate, capacity_weight, Current_wh_id, Status, Last_maintenance } = req.body;
  const query = `
    INSERT INTO Vehicle (Vehicle_type, License_plate, capacity_weight, Current_wh_id, Status, Last_maintenance)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Vehicle_type, License_plate, capacity_weight, Current_wh_id, Status, Last_maintenance], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm phương tiện' });
    res.json({ message: 'Thêm phương tiện thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Vehicle_type, License_plate, capacity_weight, Current_wh_id, Status, Last_maintenance } = req.body;
  const query = `
    UPDATE Vehicle
    SET Vehicle_type = ?, License_plate = ?, capacity_weight = ?, Current_wh_id = ?, Status = ?, Last_maintenance = ?
    WHERE VehicleID = ?
  `;
  db.query(query, [Vehicle_type, License_plate, capacity_weight, Current_wh_id, Status, Last_maintenance, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật phương tiện' });
    res.json({ message: 'Cập nhật phương tiện thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const deleteRoutePointQuery = `
    DELETE FROM route_point 
    WHERE Route_id IN (
      SELECT RouteID FROM route WHERE Vehicle_id = ?
    )
  `;

  db.query(deleteRoutePointQuery, [id], (err) => {
    if (err) {
      console.error('Lỗi khi xoá điểm tuyến đường:', err);
      return res.status(500).json({ error: 'Lỗi khi xoá điểm tuyến đường', details: err });
    }
    const deleteRouteQuery = 'DELETE FROM route WHERE Vehicle_id = ?';
    db.query(deleteRouteQuery, [id], (err) => {
      if (err) {
        console.error('Lỗi khi xoá tuyến đường:', err);
        return res.status(500).json({ error: 'Lỗi khi xoá tuyến đường', details: err });
      }
      const deleteVehicleQuery = 'DELETE FROM Vehicle WHERE VehicleID = ?';
      db.query(deleteVehicleQuery, [id], (err) => {
        if (err) {
          console.error('Lỗi khi xoá phương tiện:', err);
          return res.status(500).json({ error: 'Lỗi khi xoá phương tiện', details: err });
        }

        res.json({ message: 'Xoá phương tiện thành công' });
      });
    });
  });
});

module.exports = router;
