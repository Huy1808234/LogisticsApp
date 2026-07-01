const vehicleService = require("../service/vehicleService");
const db = require("../utils/db");

// Lấy danh sách tất cả xe đang hoạt động
exports.getVehiclesController = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehiclesService();
    res.status(200).json(vehicles);
  } catch (err) {
    console.error(" Lỗi khi lấy danh sách xe:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách xe" });
  }
};

// Lấy danh sách xe phù hợp với đơn hàng (theo mã đơn)
exports.getVehicleByOrderController = async (req, res) => {
  try {
    const { code } = req.params;
    const vehicles = await vehicleService.getVehicleByOrderService(code);
    res.status(200).json(vehicles);
  } catch (error) {
    console.error(" Lỗi khi lấy xe theo đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server khi tìm xe phù hợp" });
  }
};

// Lấy danh sách đơn hàng đã được gán cho một xe
exports.getOrdersByVehicleController = async (req, res) => {
  try {
    const { vehicleID } = req.params;
    const orders = await vehicleService.getOrdersByVehicleService(vehicleID);
    res.status(200).json(orders);
  } catch (err) {
    console.error(" Lỗi khi lấy đơn hàng theo xe:", err);
    res.status(500).json({ error: "Lỗi server khi lấy đơn hàng" });
  }
};

// Cập nhật vị trí của xe và trạng thái đơn hàng đang chở
exports.updateVehicleLocation = async (req, res) => {
  const { vehicleID } = req.params;
  const staffID = req.user?.id;
  const warehouseID = req.user?.warehouseID;

  // Log debug thêm nếu cần
  console.log("▶️ vehicleID:", vehicleID);
  console.log("▶️ req.user:", req.user);

  if (!vehicleID || !warehouseID || !staffID) {
    return res.status(400).json({
      error: "Thiếu thông tin: vehicleID, warehouseID hoặc staffID",
    });
  }

  try {
    // Kiểm tra xe tồn tại
    const [vehicleExists] = await db.execute(
      `SELECT VehicleID FROM Vehicle WHERE VehicleID = ?`,
      [vehicleID]
    );

    if (!vehicleExists.length) {
      return res.status(404).json({ error: "Không tìm thấy xe" });
    }

    // Gọi service cập nhật vị trí
    const result = await vehicleService.updateLocationAndOrders(
      vehicleID,
      warehouseID,
      staffID
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật vị trí và trạng thái đơn thành công",
      data: result,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật vị trí xe:", err);
    return res.status(500).json({
      error: "Lỗi server khi cập nhật vị trí xe và trạng thái đơn",
    });
  }
};
