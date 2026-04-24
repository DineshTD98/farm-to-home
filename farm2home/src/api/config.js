// Set the backend URL based on the environment (development vs production)
const IS_PROD = import.meta.env.PROD;
export const BACKEND_URL = import.meta.env.VITE_API_URL || 
    (IS_PROD ? 'https://farm2home-rp60.onrender.com' : 'http://localhost:5008');
export const API_BASE = `${BACKEND_URL}/api`;
export const UPLOADS_BASE = `${BACKEND_URL}/uploads`;
