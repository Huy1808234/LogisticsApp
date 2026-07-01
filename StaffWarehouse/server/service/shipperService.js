const db = require("../utils/db");

exports.getShipperService = async (orderId, warehouseId) => {
  const connection = await db.getConnection();

  try {
    // 1. Lấy khu vực (Ward) từ người nhận
    const [[order]] = await connection.execute(
      `SELECT c.Ward
       FROM \`Order\` o
       JOIN Customer c ON o.Receiver_id = c.CustomerID
       WHERE o.OrderID = ?`,
      [orderId]
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng hoặc người nhận");
    }

    const ward = order.Ward;

    // 2. Lấy shipper theo khu vực + kho + trung bình rating
    const [shippers] = await connection.execute(
      `SELECT 
         s.StaffID,
         s.Name,
         s.Phone,
         COALESCE(AVG(f.Rating), 0) AS avg_rating
       FROM Staff s
       LEFT JOIN shipperfeedback f ON s.StaffID = f.Staff_id
       WHERE s.Position = 'Nhân viên giao nhận'
         AND s.Area = ?
         AND s.Warehouse_id = ?
         AND s.Is_active = 1
       GROUP BY s.StaffID
       ORDER BY avg_rating DESC`,
      [ward, warehouseId]
    );

    return {
      success: true,
      data: shippers,
    };
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách shipper:", err);
    throw err;
  } finally {
    connection.release();
  }
};
