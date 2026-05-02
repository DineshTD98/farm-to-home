import axios from 'axios';
import { API_BASE } from './config';
const BASE = `${API_BASE}/auth`;

export const signupUser = async (userData) => {
    try {
        const response = await axios.post(`${BASE}/signup`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Signup failed');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${BASE}/login`, credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const getProfile = async (userId) => {
    try {
        const response = await axios.get(`${BASE}/profile/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
};

export const updateProfile = async (userId, profileData) => {
    try {
        const response = await axios.put(`${BASE}/profile/${userId}`, profileData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Profile update failed');
    }
};

export const deleteAccount = async (userId, password) => {
    try {
        const response = await axios.delete(`${BASE}/profile/${userId}`, {
            data: { password }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Account deletion failed');
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${BASE}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Forgot password request failed');
    }
};

export const resetPassword = async (token, password, code) => {
    try {
        const urlToken = token || 'otp';
        const response = await axios.post(`${BASE}/reset-password/${urlToken}`, { password, code });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Password reset failed');
    }
};
