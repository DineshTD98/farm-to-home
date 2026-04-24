import axios from 'axios';
import { API_BASE } from './config';

const BASE = `${API_BASE}/subscriptions`;

export const subscribeToProduct = async (userId, productId) => {
    try {
        const response = await axios.post(`${BASE}`, { userId, productId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to subscribe');
    }
};

export const unsubscribeFromProduct = async (userId, productId) => {
    try {
        const response = await axios.delete(`${BASE}/${userId}/${productId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to unsubscribe');
    }
};

export const checkProductSubscription = async (userId, productId) => {
    try {
        const response = await axios.get(`${BASE}/check/${userId}/${productId}`);
        return response.data.subscribed;
    } catch (error) {
        return false;
    }
};
