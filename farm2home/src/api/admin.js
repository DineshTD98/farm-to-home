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

export const getAllPayouts = async () => {
    try {
        const response = await axios.get(`${BASE}/payouts`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payouts');
    }
};

export const markPayoutPaid = async (id, transactionReference) => {
    try {
        const response = await axios.put(`${BASE}/payouts/${id}/pay`, { transactionReference });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark payout as paid');
    }
};
