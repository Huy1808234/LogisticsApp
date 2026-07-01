import axiosInstance from "./axiosService";

export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(`/auth/login`, {
            email: email,
            password: password
        });

        const token = response.data.accessToken;
        console.log('token', token)
        if (token) {
            localStorage.setItem('token', token);
            console.log('Saved token:', token);
            alert('Đăng nhập thành công!');
        } else {
            console.error('Không nhận được token từ server');
        }

        return response.data;
    } catch (error) {
        console.error('Error logging in:', error.response?.data || error.message);
        return null;
    }
};
