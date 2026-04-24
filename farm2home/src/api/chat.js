import axios from 'axios';
import { API_BASE } from './config';

const BASE = `${API_BASE}/chat`;

export const getOrCreateConversation = async (buyerId, farmerId) => {
    const response = await axios.post(`${BASE}/conversations`, { buyerId, farmerId });
    return response.data;
};

export const listConversations = async (userId) => {
    const response = await axios.get(`${BASE}/conversations`, { params: { userId } });
    return response.data;
};

export const getChatMessages = async (conversationId, userId) => {
    const response = await axios.get(`${BASE}/conversations/${conversationId}/messages`, {
        params: { userId },
    });
    return response.data;
};

export const sendChatMessage = async (conversationId, userId, text) => {
    const response = await axios.post(`${BASE}/conversations/${conversationId}/messages`, {
        userId,
        text,
    });
    return response.data;
};

export const getUnreadMessagesCount = async (userId) => {
    const response = await axios.get(`${BASE}/unread-count`, { params: { userId } });
    return response.data;
};
