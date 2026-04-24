import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'cartItems';

const loadCartItems = () => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(item => item?.product?._id).map(item => ({
            ...item,
            quantity: Math.max(0.01, Number(item.quantity) || 1),
        }));
    } catch (error) {
        console.error('Failed to load cart from storage:', error);
        return [];
    }
};

const persistCartItems = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to persist cart items:', error);
    }
};

const initialState = {
    items: loadCartItems(),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity, farmerId, price } = action.payload; // quantity is now a number
            const existingItem = state.items.find(item => item.product._id === product._id);
            const safeQuantity = Math.max(0.01, Number(quantity) || 1);

            if (existingItem) {
                existingItem.quantity = safeQuantity;
            } else {
                state.items.push({ product, quantity: safeQuantity, farmerId, price });
            }
            persistCartItems(state.items);
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find(item => item.product._id === productId);
            if (item) {
                item.quantity = Math.max(0.01, quantity);
                persistCartItems(state.items);
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.product._id !== action.payload);
            persistCartItems(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem(CART_STORAGE_KEY);
        },
    },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
    state.cart.items.reduce((total, item) => total + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
