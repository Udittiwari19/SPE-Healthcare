import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// JWT interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Medicines
export const getMedicines = () => api.get('/medicines');
export const getMedicineById = (id) => api.get(`/medicines/${id}`);
export const searchMedicines = (name) => api.get(`/medicines/search?name=${name}`);
export const addMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

// Orders
export const placeOrder = (data) => api.post('/orders', data);
export const getUserOrders = () => api.get('/orders');
export const getAllOrders = () => api.get('/orders/all');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const cancelUserOrder = (id) => api.put(`/orders/${id}/cancel`);

export default api;
