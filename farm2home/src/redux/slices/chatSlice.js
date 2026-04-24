import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        unreadCount: 0,
    },
    reducers: {
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
    },
});

export const { setUnreadCount } = chatSlice.actions;

export const selectUnreadCount = (state) => state.chat.unreadCount;

export default chatSlice.reducer;
