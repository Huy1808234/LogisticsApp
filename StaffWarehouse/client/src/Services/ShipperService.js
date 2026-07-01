  import axiosInstance from './axiosService';

  export const getShipperByArea = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/shipper/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách shipper:", error.response?.data || error.message);
      throw error;
    }
  };
