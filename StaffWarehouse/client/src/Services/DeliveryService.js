import axiosInstance from "./axiosService";

// sau khi gán shipper
export const createDelivery = async (orderId, shipperId) => {
    try {
        const response = await axiosInstance.post("/delivery", {
            orderId,
            shipperId
        });

        console.log("Gán shipper thành công:", response.data, response.status);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gán shipper:", error.response?.data || error.message);
        throw error;
    }
};
