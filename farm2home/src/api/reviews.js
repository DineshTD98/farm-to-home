import axios from 'axios';
import { API_BASE } from './config';
const BASE = `${API_BASE}/reviews`;

export const submitReview = async (reviewData) => {
    try {
        const response = await axios.post(`${BASE}`, reviewData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
};

export const getFarmerReviews = async (farmerId) => {
    try {
        const response = await axios.get(`${BASE}/farmer/${farmerId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
};

export const getBuyerReviews = async (buyerId) => {
    try {
        const response = await axios.get(`${BASE}/buyer/${buyerId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch your reviews');
    }
};
