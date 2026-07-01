const orderService = require("../service/orderService");
const db = require("../utils/db");

// Xem tât cả đơn hàng
exports.getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderService.getAllOrdersService();
        res.status(200).json(orders);
    } catch (err) {
        console.error("Lỗi truy vấn orders: ", err);
        res.status(500).json({ message: "Lỗi máy chủ truy vấn lấy all đơn hàng" });
    }
};

// Chi tiết đơn hàng
exports.getOrderDetailController = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const orderDetail = await orderService.getOrderDetailService(orderCode);

        if (!orderDetail) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.status(200).json(orderDetail);
    } catch (err) {
        console.error('Lỗi truy vấn:', err);
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};

// Gửi đơn hàng
exports.createFullShipmentController = async (req, res) => {
    // Dùng camelCase nhất quán cho các biến
    const { orderCode, vehicleId } = req.body;
    const staffId = req.user?.id;
    const warehouseId = req.user?.warehouseID;

    if (!orderCode || !vehicleId || !staffId || !warehouseId) {
        return res.status(400).json({
            error: 'Thiếu thông tin cần thiết: orderCode, vehicleId, staffId hoặc warehouseId'
        });
    }

    try {
        const result = await orderService.createFullShipmentService(
            orderCode,
            vehicleId,
            staffId,
            warehouseId
        );

        res.json({ success: true, message: 'Gửi đơn hàng thành công!', data: result });
    } catch (err) {
        console.error('Lỗi controller:', err);
        res.status(500).json({ error: 'Lỗi server khi gửi đơn hàng' });
    }
};

