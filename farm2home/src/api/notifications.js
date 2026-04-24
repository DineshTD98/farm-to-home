import axios from 'axios';
import { API_BASE } from './config';
const BASE = `${API_BASE}/notifications`;

export const getNotifications = async (userId) => {
    try {
        const response = await axios.get(`${BASE}/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
};

export const markNotificationRead = async (id) => {
    try {
        const response = await axios.put(`${BASE}/${id}/read`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update notification');
    }
};
