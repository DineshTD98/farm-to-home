import axios from 'axios';
import { API_BASE, UPLOADS_BASE } from './config';
const BASE = `${API_BASE}/products`;
export { UPLOADS_BASE };

export const addProduct = async (formData) => {
    try {
        const response = await axios.post(`${BASE}`, formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to list product');
    }
};

export const getFarmerProducts = async (farmerId) => {
    try {
        const response = await axios.get(`${BASE}/farmer/${farmerId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
};

export const getAllProducts = async (params = {}) => {
    try {
        const response = await axios.get(`${BASE}`, { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
};

export const updateProduct = async (id, formData) => {
    try {
        const response = await axios.put(`${BASE}/${id}`, formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update product');
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${BASE}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
};
