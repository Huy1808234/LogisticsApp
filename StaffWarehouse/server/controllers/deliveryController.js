const deliveryService = require("../service/deliveryService");

// Gán đơn hàng cho shipper
exports.createDeliveryController = async (req, res) => {
    const { orderId, shipperId } = req.body;
    const staffId = req.user?.id;
    const warehouseId = req.user?.warehouseID;

    // Kiểm tra dữ liệu đầu vào
    if (!orderId || !shipperId || !staffId || !warehouseId) {
        return res.status(400).json({
            error: "Thiếu thông tin: orderId, shipperId, staffId hoặc warehouseId"
        });
    }

    try {
        const result = await deliveryService.createDeliveryService(
            orderId,
            shipperId,
            staffId,
            warehouseId
        );

        res.status(200).json(result);
    } catch (err) {
        console.error("Lỗi controller khi cập nhật shipment:", err);
        res.status(500).json({
            error: err.message || "Lỗi server khi gán đơn hàng cho shipper"
        });
    }
};
