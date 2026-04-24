import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UPLOADS_BASE } from '../../api/products';
import { getUserAvatarUrl } from '../../utils/avatarUrl';
import {
    toggleFarmPostLike,
    getFarmPostComments,
    addFarmPostComment,
} from '../../api/farmPosts';
// test change for git hub
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_BASE}${imagePath.replace('/uploads', '')}`;
};

const relTime = (iso) => {
    if (!iso) return '';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function HeartIcon({ filled, className = '' }) {
    return (
        <svg
            className={`w-[26px] h-[26px] transition-transform active:scale-90 ${className}`}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={filled ? 0 : 1.8}
            aria-hidden
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

const FarmFeedStream = ({
    posts,
    loading,
    emptyHint,
    viewerId,
    onRefresh,
    onDeletePost,
    accent = 'amber',
}) => {
    const { t } = useTranslation();
    const vid = useMemo(
        () => (viewerId != null && viewerId !== '' ? String(viewerId) : ''),
        [viewerId]
    );
    const [actionError, setActionError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [commentsByPost, setCommentsByPost] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [draft, setDraft] = useState({});
    const [submitting, setSubmitting] = useState({});
    const [likeBusy, setLikeBusy] = useState({});

    const accentText = accent === 'green' ? 'text-green-600 dark:text-green-400' : 'text-[#fbbc05]';
    const accentFill = accent === 'green' ? 'text-green-600' : 'text-red-500';

    const ensureComments = useCallback(
        async (postId) => {
            if (commentsByPost[postId]) return;
            setLoadingComments((m) => ({ ...m, [postId]: true }));
            try {
                const data = await getFarmPostComments(postId);
                setCommentsByPost((m) => ({ ...m, [postId]: data }));
            } catch {
                setCommentsByPost((m) => ({ ...m, [postId]: [] }));
            } finally {
                setLoadingComments((m) => ({ ...m, [postId]: false }));
            }
        },
        [commentsByPost]
    );

    const toggleExpand = (postId) => {
        setExpanded((m) => {
            const nextOpen = !m[postId];
            if (nextOpen) {
                setTimeout(() => ensureComments(postId), 0);
            }
            return { ...m, [postId]: nextOpen };
        });
    };

    const handleLike = async (postId) => {
        if (!vid || likeBusy[postId]) return;
        setActionError('');
        setLikeBusy((m) => ({ ...m, [postId]: true }));
        try {
            await toggleFarmPostLike(postId, vid);
            onRefresh?.();
        } catch (e) {
            const msg =
                e.response?.data?.message ||
                e.message ||
                t('feed.actionFailed');
            setActionError(msg);
            console.error(e);
        } finally {
            setLikeBusy((m) => ({ ...m, [postId]: false }));
        }
    };

    const handleSendComment = async (postId) => {
        const text = (draft[postId] || '').trim();
        if (!text || !vid || submitting[postId]) return;
        setActionError('');
        setSubmitting((m) => ({ ...m, [postId]: true }));
        try {
            const created = await addFarmPostComment(postId, vid, text);
            setDraft((m) => ({ ...m, [postId]: '' }));
            setCommentsByPost((m) => ({
                ...m,
                [postId]: [...(m[postId] || []), created],
            }));
            onRefresh?.();
        } catch (e) {
            const msg =
                e.response?.data?.message ||
                e.message ||
                t('feed.actionFailed');
            setActionError(msg);
            console.error(e);
        } finally {
            setSubmitting((m) => ({ ...m, [postId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 max-w-md mx-auto px-1">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-[#161616] border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm animate-pulse"
                    >
                        <div className="flex items-center gap-3 p-3.5">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
                                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded w-16" />
                            </div>
                        </div>
                        <div className="aspect-square bg-gray-100 dark:bg-white/5" />
                        <div className="p-4 space-y-2">
                            <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!posts?.length) {
        return (
            <div className="text-center py-16 px-6 max-w-md mx-auto rounded-3xl border border-dashed border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-500/5 dark:to-transparent">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100/80 dark:bg-amber-500/10 text-3xl mb-5 shadow-inner">
                    🌾
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-10 pb-24 px-1">
            {actionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                    {actionError}
                    <button
                        type="button"
                        className="ml-2 font-black underline"
                        onClick={() => setActionError('')}
                    >
                        {t('feed.dismiss')}
                    </button>
                </div>
            )}
            {posts.map((post) => {
                const f = post.farmerId;
                const name = f?.firstName ? `${f.firstName} ${f.lastName || ''}`.trim() : 'Farmer';
                const farmerAvatarSrc = f && getUserAvatarUrl(f);
                const likeCount = post.likeCount ?? 0;
                const commentCount = post.commentCount ?? 0;
                const liked = Boolean(post.liked);
                const comments = commentsByPost[post._id] || [];
                const isOpen = expanded[post._id];

                return (
                    <article
                        key={post._id}
                        className="bg-white dark:bg-[#161616] border border-gray-200/90 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-gray-100/80 dark:border-white/5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-black shadow-md ring-2 ring-white/20 dark:ring-white/10 ${
                                        farmerAvatarSrc
                                            ? ''
                                            : accent === 'green'
                                              ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                                              : 'bg-gradient-to-br from-amber-400 to-orange-500'
                                    }`}
                                >
                                    {farmerAvatarSrc ? (
                                        <img
                                            src={farmerAvatarSrc}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                        {name}
                                    </div>
                                    <div className="text-[11px] text-gray-400 font-semibold">
                                        {relTime(post.createdAt)}
                                    </div>
                                </div>
                            </div>
                            {onDeletePost && (
                                <button
                                    type="button"
                                    onClick={() => onDeletePost(post._id)}
                                    className="text-[11px] font-black uppercase tracking-widest text-red-500/90 hover:text-red-600 px-2 py-1"
                                >
                                    {t('feed.delete')}
                                </button>
                            )}
                        </div>

                        {/* Media */}
                        {post.image ? (
                            <div className="bg-black/5 dark:bg-black/40">
                                <img
                                    src={getImageUrl(post.image)}
                                    alt=""
                                    className="w-full aspect-[4/5] sm:aspect-square object-cover"
                                />
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-white/5 dark:to-white/[0.02] px-4 py-6 border-y border-gray-100/80 dark:border-white/5">
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {post.content}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="px-3 pt-3 pb-1">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleLike(post._id)}
                                    disabled={!vid || likeBusy[post._id]}
                                    className={`p-0.5 rounded-full hover:opacity-90 disabled:opacity-40 -ml-0.5 ${
                                        liked ? accentFill : 'text-gray-900 dark:text-white'
                                    }`}
                                    title={t('feed.like', 'Like')}
                                >
                                    <HeartIcon filled={liked} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExpanded((m) => ({ ...m, [post._id]: true }));
                                        ensureComments(post._id);
                                        requestAnimationFrame(() => {
                                            const el = document.getElementById(`comment-input-${post._id}`);
                                            el?.focus();
                                        });
                                    }}
                                    className="p-0.5 text-gray-900 dark:text-white hover:opacity-70"
                                    title={t('feed.comment', 'Comment')}
                                >
                                    <svg
                                        className="w-[24px] h-[24px]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden
                                    >
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                </button>
                            </div>

                            {likeCount > 0 && (
                                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                                    {likeCount === 1
                                        ? t('feed.oneLike')
                                        : t('feed.nLikes', { count: likeCount })}
                                </p>
                            )}
                            {post.likerNames && post.likerNames.length > 0 && (
                                <p className="mt-1.5 text-[13px] text-gray-600 dark:text-gray-400 leading-snug">
                                    <span className="font-semibold text-gray-800 dark:text-gray-300">
                                        {t('feed.likedByLabel')}{' '}
                                    </span>
                                    {post.likerNames.join(', ')}
                                </p>
                            )}

                            {post.image && (
                                <p className="mt-1.5 text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                                    <span className="font-bold mr-1.5">{name.split(' ')[0]}</span>
                                    <span className="font-normal whitespace-pre-wrap">{post.content}</span>
                                </p>
                            )}

                            {commentCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(post._id)}
                                    className="mt-2 text-[13px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                                >
                                    {isOpen
                                        ? t('feed.hideComments', 'Hide comments')
                                        : t('feed.viewAllComments', 'View all {{count}} comments', {
                                              count: commentCount,
                                          })}
                                </button>
                            )}

                            {isOpen && (
                                <div className="mt-3 space-y-2.5 border-t border-gray-100 dark:border-white/5 pt-3">
                                    {loadingComments[post._id] && !comments.length ? (
                                        <p className="text-xs text-gray-400">{t('common.loading')}</p>
                                    ) : (
                                        comments.map((c) => {
                                            const u = c.userId;
                                            const uname = u?.firstName
                                                ? `${u.firstName} ${u.lastName || ''}`.trim()
                                                : 'User';
                                            return (
                                                <div key={c._id} className="text-sm">
                                                    <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                                                        {uname.split(' ')[0]}
                                                    </span>
                                                    <span className="text-gray-800 dark:text-gray-200">
                                                        {c.text}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {vid && (
                                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 dark:border-white/5 pt-3">
                                    <input
                                        id={`comment-input-${post._id}`}
                                        type="text"
                                        value={draft[post._id] || ''}
                                        onChange={(e) =>
                                            setDraft((m) => ({ ...m, [post._id]: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSendComment(post._id);
                                            }
                                        }}
                                        placeholder={t('feed.addCommentPlaceholder', 'Add a comment…')}
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none min-w-0"
                                    />
                                    <button
                                        type="button"
                                        disabled={!((draft[post._id] || '').trim()) || submitting[post._id]}
                                        onClick={() => handleSendComment(post._id)}
                                        className={`text-sm font-bold ${accentText} disabled:opacity-30`}
                                    >
                                        {t('feed.post', 'Post')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default FarmFeedStream;
