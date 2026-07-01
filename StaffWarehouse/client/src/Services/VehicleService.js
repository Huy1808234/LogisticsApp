import axiosInstance from './axiosService';

//Xem danh sach xe
export const getVehicle = async () => {
    try {
        const response = await axiosInstance.get(`/vehicle`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
// Lấy danh sách đơn hàng theo xe
export const getOrdersByVehicle = async (vehicle_id) => {
    try {
        const response = await axiosInstance.get(`/vehicle/orders/${vehicle_id}`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

// Lấy xe theo mã đơn hàng (Gửi đơn)
export const getVehicleByOrder = async (code) => {
    try {
        const response = await axiosInstance.get(`/vehicle/byOrder/${code}`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle by order:', error);
        throw error;
    }
};

// cập nhật location cho xe
export const updateLocation = async (vehicle_id) => {
    try {
        const response = await axiosInstance.put(`/vehicle/updateLocation/${vehicle_id}`);
        const warehouseName = response.data?.result?.warehouseName || 'kho không xác định';
        alert(`Đã cập nhật xe tới ${warehouseName}`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error("loi cap nhat location", error);
    }
}