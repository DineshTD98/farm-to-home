import axios from 'axios';
import { API_BASE } from './config';
const BASE = `${API_BASE}/admin`;

export const getAdminStats = async () => {
    try {
        const response = await axios.get(`${BASE}/stats`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
};

export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${BASE}/orders`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
};

export const getAllFarmers = async () => {
    try {
        const response = await axios.get(`${BASE}/farmers`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch farmers');
    }
};

export const getAllBuyers = async () => {
    try {
        const response = await axios.get(`${BASE}/buyers`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch buyers');
    }
};

export const getAllPayouts = async () => {
    try {
        const response = await axios.get(`${BASE}/payouts`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payouts');
    }
};

export const markPayoutPaid = async (payoutId, transactionReference) => {
    try {
        const response = await axios.put(`${BASE}/payouts/${payoutId}/pay`, { transactionReference });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark payout as paid');
    }
};

export const verifyFarmerBankDetails = async (farmerId) => {
    try {
        const response = await axios.put(`${BASE}/farmers/${farmerId}/verify-bank`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to verify bank details');
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const response = await axios.put(`${BASE}/users/${userId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${BASE}/users/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
};

export const sendUserNotification = async (userId, message, type) => {
    try {
        const response = await axios.post(`${BASE}/users/${userId}/notify`, { message, type });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
};

export const updateAdminOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.put(`${BASE}/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
};
