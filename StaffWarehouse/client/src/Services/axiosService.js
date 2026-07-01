import axios from "axios";

const BASE_URL = 'http://localhost:3002/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('token ht: ', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('request header: ', config.headers);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Bạn có thể thêm redirect nếu muốn: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
