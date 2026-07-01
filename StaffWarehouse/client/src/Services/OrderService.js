import axiosInstance from './axiosService';

// lấy tất cả đơn hàng (Xem đơn hàng)
export const getAllOrders = async () => {
    try {
        console.log('Calling API endpoint...');
        const response = await axiosInstance.get('/order');
        console.log('Success!');
        return response.data;
    } catch (error) {
        console.log('Full request URL:', error.config?.url);
        console.log('Full error:', error);
        throw error;
    }
};

// Lấy chi tiết đơn hàng (Tìm đơn hàng)
export const getOrderDetail = async (order_code) => {
    try {
        const response = await axiosInstance.get(`/order/detail/${order_code}`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        console.error(error);
        throw error;
    }
};

// Gửi đơn hàng
export const createShipment = async (orderCode, vehicleId) => {
    try {
        const response = await axiosInstance.post(`/order/createShipment`, {
            orderCode,
            vehicleId
        });
        alert("Gửi đơn thành công!");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gửi shipment:", error);
        throw error; // để phía component có thể xử lý tiếp
    }
}
