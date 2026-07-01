const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT w.*, s.Name AS ManagerName
    FROM Warehouse w
    LEFT JOIN Staff s ON w.Manager_id = s.StaffID
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách kho' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { Name, Street, Ward, District, City, Manager_id } = req.body;
  const query = `
    INSERT INTO Warehouse (Name, Street, Ward, District, City, Manager_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [Name, Street, Ward, District, City, Manager_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm kho' });
    res.json({ message: 'Thêm kho thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { Name, Street, Ward, District, City, Manager_id } = req.body;
  const query = `
    UPDATE Warehouse
    SET Name = ?, Street = ?, Ward = ?, District = ?, City = ?, Manager_id = ?
    WHERE WarehouseID = ?
  `;
  db.query(query, [Name, Street, Ward, District, City, Manager_id, id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật kho' });
    res.json({ message: 'Cập nhật kho thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Warehouse WHERE WarehouseID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá kho' });
    res.json({ message: 'Xoá kho thành công' });
  });
});

module.exports = router;
