const shipperService = require("../service/shipperService");

exports.getShippersByOrderController = async (req, res) => {
  const { orderID } = req.params;
  const warehouseId = req.user?.warehouseID;

  if (!orderID || !warehouseId) {
    return res.status(400).json({ error: "Thiếu orderId hoặc warehouseId" });
  }

  try {
    const result = await shipperService.getShipperService(orderID, warehouseId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Lỗi server khi lấy danh sách shipper" });
  }
};
