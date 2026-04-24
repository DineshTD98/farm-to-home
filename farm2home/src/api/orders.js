import axios from 'axios';
import { API_BASE } from './config';
const BASE = `${API_BASE}/orders`;

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${BASE}`, orderData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to place order');
    }
};

export const getBuyerOrders = async (buyerId) => {
    try {
        const response = await axios.get(`${BASE}/buyer/${buyerId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
    }
};

export const getFarmerOrders = async (farmerId) => {
    try {
        const response = await axios.get(`${BASE}/farmer/${farmerId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch farmer orders');
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.put(`${BASE}/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
};

export const createRazorpayOrder = async (amount) => {
    try {
        const response = await axios.post(`${BASE}/razorpay`, { amount });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
};

export const verifyRazorpayPayment = async (verificationData) => {
    try {
        const response = await axios.post(`${BASE}/razorpay/verify`, verificationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
};
