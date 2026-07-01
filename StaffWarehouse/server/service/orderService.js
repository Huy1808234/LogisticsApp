const db = require("../utils/db");

// Hàm lấy tất cả đơn hàng (Xem đơn hàng)
exports.getAllOrdersService = async () => {
  const [rows] = await db.execute(`
        SELECT o.OrderID      AS orderID,
               o.Order_code   AS orderCode,
               c.Name         AS customerName,
               ws.Name        AS startWarehouse,
               we.Name        AS endWarehouse,
               o.Order_status AS status,
               o.Created_at   AS createdAt,
               o.Total_weight AS weight,
               o.Ship_cost    AS totalAmount
        FROM \`Order\` o
                 INNER JOIN Customer c ON o.Sender_id = c.CustomerID
                 LEFT JOIN Warehouse ws ON o.Start_Warehouse_id = ws.WarehouseID
                 LEFT JOIN Warehouse we ON o.End_Warehouse_id = we.WarehouseID
        ORDER BY o.OrderID ASC;
    `);
  return rows;
};

// Lấy chi tiết đơn hàng (Tìm đơn hàng)
exports.getOrderDetailService = async (orderCode) => {
  // 1. Truy vấn đơn hàng
  const [orderRows] = await db.execute(
    `
        SELECT o.OrderID             AS id,
               o.Order_code          AS code,
               o.Order_status        AS status,
               o.Created_at          AS createdAt,
               p.Estimated_delivery  AS estimatedDelivery,
               o.Ship_cost + p.Value AS totalAmount,
               p.Value               AS codAmount,
               p.Weight              AS weight,
               p.Dimensions          AS dimensions,
               o.Start_Warehouse_id  AS startWarehouseID,
               ws.Name               AS startWarehouse,
               we.Name               AS endWarehouse
        FROM \`Order\` o
                 JOIN Package p ON o.OrderID = p.Order_id
                 LEFT JOIN Warehouse ws ON o.Start_Warehouse_id = ws.WarehouseID
                 LEFT JOIN Warehouse we ON o.End_Warehouse_id = we.WarehouseID
        WHERE o.Order_code = ?

    `,
    [orderCode]
  );

  if (orderRows.length === 0) {
    return null;
  }
  const order = orderRows[0];

  // 2. Người gửi & người nhận
  const [addressRows] = await db.execute(
    `
        SELECT 
            s.Name                                                          AS sender_name,
            s.Phone                                                         AS sender_phone,
            CONCAT(s.Street, ', ', s.Ward, ', ', s.District, ', ', s.City)  AS sender_address,
            r.Name                                                          AS receiver_name,
            r.Phone                                                         AS receiver_phone,
            CONCAT(r.Street, ', ', r.Ward, ', ', r.District, ', ', r.City)  AS receiver_address
        FROM \`Order\` o
        JOIN Customer s ON o.Sender_id = s.CustomerID
        JOIN Customer r ON o.Receiver_id = r.CustomerID
        WHERE o.Order_code = ?
    `,
    [orderCode]
  );

  const address = addressRows[0];

  // 3. Package
  const [packageRows] = await db.execute(
    `
        SELECT 
            p.Description   AS package_description,
            o.Total_package AS quantity,
            p.Value         AS value,
            p.Description   AS notes
        FROM \`Order\` o
        JOIN Package p ON o.OrderID = p.Order_id
        WHERE o.Order_code = ?
    `,
    [orderCode]
  );

  const packageData = packageRows[0];

  // 4. Tracking
  const [trackingRows] = await db.execute(
    `
        SELECT 
            t.TrackingID                    AS id,
            t.Status                        AS status,
            t.Status                        AS title,
            t.Notes                         AS description,
            t.Timestamp                     AS timestamp,
            CONCAT(w.City, ' - ', w.Name)   AS location,
            CASE 
                WHEN t.Timestamp <= NOW() THEN TRUE ELSE FALSE
            END AS completed,
            CASE 
                WHEN t.Status = 'Đang vận chuyển' THEN TRUE ELSE FALSE
            END AS current
        FROM Tracking t
        JOIN \`Order\` o ON t.Order_id = o.OrderID
        JOIN Warehouse w ON t.Current_Warehouse_id = w.WarehouseID
        WHERE o.Order_code = ?
        ORDER BY t.Timestamp
    `,
    [orderCode]
  );

  // 5. Driver
  const [driverRows] = await db.execute(
    `
        SELECT
            st.Name           AS driver_name,
            st.Phone          AS driver_phone,
            v.License_plate   AS vehicle,
            v.Vehicle_type    AS vehicleType
        FROM Shipment s
                 JOIN \`Order\` o ON s.Order_id = o.OrderID
                 JOIN Vehicle v ON s.Vehicle_id = v.VehicleID
                 JOIN Staff st ON v.Driver_id = st.StaffID
        WHERE o.Order_code = ?
    `,
    [orderCode]
  );

  const driver = driverRows[0];

  // 6. Shipper (người giao hàng cuối cùng tới tay người nhận)
  const [shipperRows] = await db.execute(
    `
        SELECT 
            st.Name        AS shipper_name,
            st.Phone       AS shipper_phon
        FROM DeliveryAssignment da
        JOIN \`Order\` o ON da.OrderID = o.OrderID
        JOIN Staff st ON da.DriverID = st.StaffID
        WHERE o.Order_code = ?
           AND st.Position = 'Shipper'
          
    `,
    [orderCode]
  );

  const shipper = shipperRows[0] || null;
  // Tổng hợp dữ liệu
  return {
    ...order,
    sender: {
      name: address.sender_name,
      phone: address.sender_phone,
      address: address.sender_address,
    },
    receiver: {
      name: address.receiver_name,
      phone: address.receiver_phone,
      address: address.receiver_address,
    },
    package: {
      description: packageData.package_description,
      quantity: packageData.quantity,
      value: packageData.value,
      notes: packageData.notes,

    },
    tracking: trackingRows,
    driver: driver,
    shipper: shipper,
  };
};

// Gửi đơn hàng
exports.createFullShipmentService = async (
  orderCode,
  vehicleId,
  staffId,
  warehouseId
) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lấy OrderID từ orderCode
    const [orders] = await connection.execute(
      `SELECT OrderID FROM ` + "`Order` WHERE Order_code = ?",
      [orderCode]
    );

    if (orders.length === 0) {
      throw new Error("Không tìm thấy đơn hàng với mã: " + orderCode);
    }

    const orderId = orders[0].OrderID;

    // 2. Chèn vào bảng Shipment
    await connection.execute(
      `INSERT INTO Shipment (Order_id, Vehicle_id) VALUES (?, ?)`,
      [orderId, vehicleId]
    );

    // 3. Chèn vào bảng Tracking
    await connection.execute(
      `INSERT INTO Tracking (Order_id, Staff_id, Status, Current_Warehouse_id, Timestamp)
             VALUES (?, ?, 'Đang vận chuyển', ?, NOW())`,
      [orderId, staffId, warehouseId]
    );

    // 4. Cập nhật trạng thái trong Order
    await connection.execute(
      `UPDATE ` +
        "`Order` SET Order_status = 'Đang vận chuyển' WHERE OrderID = ?",
      [orderId]
    );

    await connection.commit();
    return {
      success: true,
      message: "Thêm shipment, tracking và cập nhật trạng thái thành công",
    };
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi trong transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};
