import { createSlice } from '@reduxjs/toolkit';

// Initial state, trying to load from localStorage
const initialState = {
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    token: sessionStorage.getItem('token') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),
    role: JSON.parse(sessionStorage.getItem('user'))?.role || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            const id = user?.id || user?._id;
            const normalizedUser = user
                ? { ...user, id, _id: user._id || user.id }
                : null;
            state.user = normalizedUser;
            state.token = token;
            state.isAuthenticated = true;
            state.role = normalizedUser?.role;

            // Persistence
            if (normalizedUser) {
                sessionStorage.setItem('user', JSON.stringify(normalizedUser));
            }
            sessionStorage.setItem('token', token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.role = null;

            // Persistence
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.role;
