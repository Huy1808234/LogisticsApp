const db = require("../utils/db");

// Gán đơn hàng cho shipper
exports.createDeliveryService = async (orderId, shipperId, staffId, warehouseId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Ghi lại tracking: nhân viên thao tác đã giao cho shipper
        await connection.execute(
            `INSERT INTO Tracking (Order_id, Staff_id, Status, Current_Warehouse_id, Timestamp)
             VALUES (?, ?, 'Cần lấy', ?, NOW())`,
            [orderId, shipperId, warehouseId]
        );

        // 2. Ghi nhận shipper phụ trách đơn hàng
        await connection.execute(
            `INSERT INTO DeliveryAssignment (OrderID, DriverID)
             VALUES (?, ?)`,
            [orderId, shipperId]
        );

        // 3. Đánh dấu shipment đã được xử lý
        const [updateResult] = await connection.execute(
            `UPDATE Shipment SET IsAssigned = FALSE WHERE Order_id = ?`,
            [orderId]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error("Không tìm thấy shipment để cập nhật IsAssigned.");
        }

        await connection.execute(
            `UPDATE \`Order\` SET Order_status = 'Đã giao cho shipper', Updated_at = NOW() WHERE OrderID = ?`,
            [orderId]
        );

        await connection.commit();

        return {
            success: true,
            message: `Đã giao đơn hàng cho shipper (StaffID: ${shipperId}), cập nhật trạng thái thành công.`
        };
    } catch (err) {
        await connection.rollback();
        console.error("Lỗi gán đơn cho shipper:", err);
        throw err;
    } finally {
        connection.release();
    }
};
