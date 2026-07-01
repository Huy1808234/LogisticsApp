const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const query = `
    SELECT p.*, 
           o.Order_code, 
           s.Name AS SenderName, 
           r.Name AS ReceiverName, 
           sv.Service_name, 
           w.Name AS CurrentWarehouse
    FROM Package p
    LEFT JOIN \`Order\` o ON p.Order_id = o.OrderID
    LEFT JOIN Customer s ON p.Sender_id = s.CustomerID
    LEFT JOIN Customer r ON p.Receiver_id = r.CustomerID
    LEFT JOIN Service sv ON p.Service_id = sv.Service_id
    LEFT JOIN Warehouse w ON p.Current_Warehouse_id = w.WarehouseID
    ORDER BY p.Created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách kiện hàng' });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const {
    Order_id, Sender_id, Receiver_id, Service_id,
    Weight, Dimensions, Description, Value,
    Current_Warehouse_id, Status, Estimated_delivery, Is_fragile
  } = req.body;

  const query = `
    INSERT INTO Package (
      Order_id, Sender_id, Receiver_id, Service_id,
      Weight, Dimensions, Description, Value,
      Current_Warehouse_id, Status, Estimated_delivery, Is_fragile
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    Order_id, Sender_id, Receiver_id, Service_id,
    Weight, Dimensions, Description, Value,
    Current_Warehouse_id, Status, Estimated_delivery, Is_fragile
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi thêm kiện hàng' });
    res.json({ message: 'Thêm kiện hàng thành công', insertId: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const {
    Order_id, Sender_id, Receiver_id, Service_id,
    Weight, Dimensions, Description, Value,
    Current_Warehouse_id, Status, Estimated_delivery, Is_fragile
  } = req.body;

  const query = `
    UPDATE Package
    SET Order_id = ?, Sender_id = ?, Receiver_id = ?, Service_id = ?,
        Weight = ?, Dimensions = ?, Description = ?, Value = ?,
        Current_Warehouse_id = ?, Status = ?, Estimated_delivery = ?, Is_fragile = ?
    WHERE PackageID = ?
  `;

  db.query(query, [
    Order_id, Sender_id, Receiver_id, Service_id,
    Weight, Dimensions, Description, Value,
    Current_Warehouse_id, Status, Estimated_delivery, Is_fragile,
    id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật kiện hàng' });
    res.json({ message: 'Cập nhật kiện hàng thành công' });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Package WHERE PackageID = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi xoá kiện hàng' });
    res.json({ message: 'Xoá kiện hàng thành công' });
  });
});

module.exports = router;
