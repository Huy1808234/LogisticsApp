// vehicleService.js
const db = require("../utils/db");

// 1. Lấy danh sách tất cả xe đang hoạt động
exports.getVehiclesService = async () => {
  const [rows] = await db.execute(`
    SELECT
      v.VehicleID,
      v.Vehicle_type,
      v.License_plate,
      v.Status AS status,
      w.Name AS Warehouse
    FROM Vehicle v
    LEFT JOIN Warehouse w ON v.Current_Wh_id = w.WarehouseID
    WHERE v.Status = 'Hoạt động'
  `);
  return rows;
};

// 2. Lấy danh sách xe phù hợp với đơn hàng (theo Order_code)
exports.getVehicleByOrderService = async (orderCode) => {
  try {
    const [orders] = await db.execute(
      `SELECT Start_Warehouse_id, Total_weight FROM \`Order\` WHERE Order_code = ?`,
      [orderCode]
    );

    if (!orders.length) throw new Error("Không tìm thấy đơn hàng");

    const { Start_Warehouse_id, Total_weight } = orders[0];
    const requiredWeight = Total_weight * 1000;

    const [vehicles] = await db.execute(
      `SELECT v.VehicleID, v.Vehicle_type, v.License_plate, v.capacity_weight,
              st.Name AS driverName, st.Phone AS driverPhone
       FROM Vehicle v
       LEFT JOIN Staff st ON v.Driver_id = st.StaffID
       WHERE v.Current_wh_id = ?
         AND v.Status = 'Hoạt động'
         AND v.capacity_weight >= ?
       ORDER BY v.capacity_weight ASC`,
      [Start_Warehouse_id, requiredWeight]
    );

    return vehicles;
  } catch (error) {
    console.error("\u274c Lỗi getVehicleByOrder:", error);
    throw error;
  }
};

// 3. Gán đơn hàng vào xe phù hợp
exports.assignVehicleToOrder = async (orderCode) => {
  const connection = await db.getConnection();
  try {
    const [[order]] = await connection.execute(
      `SELECT OrderID, Start_Warehouse_id, Total_weight FROM \`Order\` WHERE Order_code = ?`,
      [orderCode]
    );

    if (!order) throw new Error("Không tìm thấy đơn hàng");

    const { OrderID, Start_Warehouse_id, Total_weight } = order;
    const requiredWeight = Total_weight * 1000;

    const [[vehicle]] = await connection.execute(
      `SELECT VehicleID FROM Vehicle
       WHERE Current_wh_id = ?
         AND Status = 'Hoạt động'
         AND capacity_weight >= ?
       ORDER BY capacity_weight ASC LIMIT 1`,
      [Start_Warehouse_id, requiredWeight]
    );

    if (!vehicle) {
      return { success: false, message: "Không có xe phù hợp tại kho gửi" };
    }

    await connection.execute(
      `INSERT INTO Shipment (Order_id, Vehicle_id, IsAssigned) VALUES (?, ?, TRUE)`,
      [OrderID, vehicle.VehicleID]
    );

    return {
      success: true,
      vehicleId: vehicle.VehicleID,
      message: "Gán đơn vào xe thành công",
    };
  } catch (err) {
    console.error("\u274c Lỗi assignVehicleToOrder:", err);
    return { success: false, message: "Lỗi khi gán đơn vào xe" };
  } finally {
    connection.release();
  }
};

// 4. Lấy danh sách đơn đã gán cho xe
exports.getOrdersByVehicleService = async (vehicleID) => {
  const [rows] = await db.execute(
    `SELECT o.OrderID, o.Order_code AS orderCode, c.Name AS customerName,
            ws.Name AS startWarehouse, we.Name AS endWarehouse,
            o.Order_status AS status, o.Created_at AS createdAt,
            o.Total_weight AS weight, o.Ship_cost AS totalAmount
     FROM Shipment s
     JOIN \`Order\` o ON s.Order_id = o.OrderID
     JOIN Customer c ON o.Sender_id = c.CustomerID
     LEFT JOIN Warehouse ws ON o.Start_Warehouse_id = ws.WarehouseID
     LEFT JOIN Warehouse we ON o.End_Warehouse_id = we.WarehouseID
     WHERE s.Vehicle_id = ? AND s.IsAssigned = TRUE`,
    [vehicleID]
  );
  return rows;
};

// Cập nhật location cho xe
exports.updateLocationAndOrders = async (vehicleID, warehouseID, staffID = null) => {
    const now = new Date();
    const connection = await db.getConnection();

    try {
        // Bắt đầu transaction
        await connection.beginTransaction();

        // 1. Ghi lịch sử theo dõi xe
        await connection.execute(
            `INSERT INTO VehicleTracking (Vehicle_id, Warehouse_id, Timestamp) VALUES (?, ?, ?)` ,
            [vehicleID, warehouseID, now]
        );

        // 2. Cập nhật kho hiện tại của xe
        await connection.execute(
            `UPDATE Vehicle
             SET
                Current_wh_id = ?,
                Update_at = NOW()
            WHERE VehicleID = ?`,
            [warehouseID, vehicleID]
        );

        // 3. Lấy tên kho mới
        const [whRows] = await connection.execute(
            `SELECT Name FROM Warehouse WHERE WarehouseID = ?`,
            [warehouseID]
        );
        const warehouseName = whRows[0]?.Name || 'không xác định';

        // 4. Lấy các đơn hàng thuộc xe
        const [orders] = await connection.execute(
            `SELECT Order_id FROM Shipment WHERE Vehicle_id = ?`,
            [vehicleID]
        );

        const updatedOrders = [];
        // 5. Cập nhật từng đơn hàng và ghi lịch sử
        for (const { Order_id } of orders) {
            const newStatus = `Đã chuyển tới ${warehouseName}`;
            await connection.execute(
                `UPDATE \`Order\` SET Order_status = ? WHERE OrderID = ?`,
                [newStatus, Order_id]
            );

            await connection.execute(
                `INSERT INTO Tracking (Order_id, Staff_id, Status, Current_Warehouse_id, Timestamp, Notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    Order_id,
                    staffID,
                    newStatus,
                    warehouseID,
                    now,
                    `Xe ${vehicleID} cập nhật tới kho ${warehouseName}`
                ]
            );

            updatedOrders.push(Order_id);
        }

        // Commit nếu mọi thứ thành công
        await connection.commit();
        return { updatedOrders, warehouseName };
    } catch (err) {
        // Rollback khi có lỗi
        await connection.rollback();
        console.error('Lỗi trong transaction updateLocationAndOrders:', err);
        throw err;
    } finally {
        // Giải phóng connection
        connection.release();
    }
};