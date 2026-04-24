import { UPLOADS_BASE } from '../api/config';

/** Returns full URL for a user's avatar path from the API, or null if none. */
export function getUserAvatarUrl(user) {
    if (!user?.avatar) return null;
    const path = user.avatar;
    if (typeof path === 'string' && path.startsWith('http')) return path;
    if (typeof path !== 'string' || !path) return null;
    return `${UPLOADS_BASE}${path.replace('/uploads', '')}`;
}
