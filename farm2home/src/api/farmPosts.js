import axios from 'axios';
import { API_BASE } from './config';

const BASE = `${API_BASE}/farm-posts`;

export const createFarmPost = async (formData) => {
    const response = await axios.post(`${BASE}`, formData);
    return response.data;
};

export const getFarmFeed = async (viewerId) => {
    const params = {};
    if (viewerId) params.userId = viewerId;
    const response = await axios.get(`${BASE}/feed`, { params });
    return response.data;
};

export const getFarmerFarmPosts = async (farmerId, viewerId) => {
    const params = {};
    if (viewerId) params.userId = viewerId;
    const response = await axios.get(`${BASE}/farmer/${farmerId}`, { params });
    return response.data;
};

export const deleteFarmPost = async (postId, farmerId) => {
    const response = await axios.delete(`${BASE}/${postId}`, { data: { farmerId } });
    return response.data;
};

export const toggleFarmPostLike = async (postId, userId) => {
    const response = await axios.post(`${BASE}/${postId}/like`, { userId });
    return response.data;
};

export const getFarmPostComments = async (postId) => {
    const response = await axios.get(`${BASE}/${postId}/comments`);
    return response.data;
};

export const addFarmPostComment = async (postId, userId, text) => {
    const response = await axios.post(`${BASE}/${postId}/comments`, { userId, text });
    return response.data;
};
