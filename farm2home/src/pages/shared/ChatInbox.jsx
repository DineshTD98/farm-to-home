import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { setUnreadCount } from '../../redux/slices/chatSlice';
import { getUnreadMessagesCount } from '../../api/chat';
import { useTheme } from '../../context/ThemeContext';
import { listConversations, getChatMessages, sendChatMessage } from '../../api/chat';
import { toast } from 'react-hot-toast';

const ChatInbox = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser) || {};
    const { isDarkMode } = useTheme();
    const userId = user.id || user._id;
    const isBuyer = user.role === 'buyer';
    const isFarmer = user.role === 'farmer';

    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loadingList, setLoadingList] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const portalPath = isFarmer ? '/farmer-portal' : '/buyer-portal';

    const loadConversations = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await listConversations(userId);
            setConversations(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingList(false);
        }
    }, [userId]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const refreshMessages = useCallback(
        async (convId) => {
            if (!convId || !userId) return;
            try {
                const data = await getChatMessages(convId, userId);
                setMessages(data);
                
                // Update global unread count after reading
                const { count } = await getUnreadMessagesCount(userId);
                dispatch(setUnreadCount(count));
                
                // Also update local conversations list to clear that unread marker
                setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c));
            } catch {
                /* noop */
            }
        },
        [userId, dispatch]
    );

    useEffect(() => {
        if (!selected?._id) {
            setMessages([]);
            return;
        }
        refreshMessages(selected._id);
        const t = setInterval(() => refreshMessages(selected._id), 4000);
        return () => clearInterval(t);
    }, [selected?._id, refreshMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const peerName = (conv) => {
        if (isBuyer) {
            const f = conv.farmerId;
            return f?.firstName ? `${f.firstName} ${f.lastName || ''}`.trim() : 'Farmer';
        }
        const b = conv.buyerId;
        return b?.firstName ? `${b.firstName} ${b.lastName || ''}`.trim() : 'Buyer';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || !selected?._id || sending) return;
        setSending(true);
        try {
            await sendChatMessage(selected._id, userId, trimmed);
            setText('');
            await refreshMessages(selected._id);
            await loadConversations();
        } catch (err) {
            toast.error(err.message || 'Send failed');
        } finally {
            setSending(false);
        }
    };

    if (!isBuyer && !isFarmer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
                <p className="font-medium">Messages are only available for buyers and farmers.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col text-gray-900 dark:text-white">
            <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
                <button
                    type="button"
                    onClick={() => navigate(portalPath)}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#fbbc05]"
                >
                    ← Portal
                </button>
                <div className="text-lg font-black tracking-tighter uppercase">
                    💬 Messages
                </div>
            </nav>

            <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto">
                <aside className="lg:w-[320px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#111111] lg:min-h-[calc(100vh-73px)] max-h-[40vh] lg:max-h-none overflow-y-auto">
                    <div className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {isBuyer ? 'Farmers' : 'Buyers'}
                    </div>
                    {loadingList ? (
                        <div className="p-6 text-gray-400 text-sm">Loading…</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 text-gray-400 text-sm">No conversations yet. Open a product and tap “Message farmer”.</div>
                    ) : (
                        <ul>
                            {conversations.map((c) => (
                                <li key={c._id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(c)}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-white/5 transition-colors flex items-center justify-between ${
                                            selected?._id === c._id
                                                ? 'bg-amber-50 dark:bg-amber-400/10'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                {peerName(c)}
                                                {c.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                            </div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                {new Date(c.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {c.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                                {c.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                <section className="flex-1 flex flex-col min-h-[50vh] lg:min-h-[calc(100vh-73px)]">
                    {!selected ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium p-8">
                            Select a conversation
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#111111]">
                                <div className="font-black text-lg">{peerName(selected)}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    {isBuyer ? 'Farmer' : 'Buyer'} chat
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0a0a0a]">
                                {messages.map((m) => {
                                    const sid = m.senderId?._id || m.senderId;
                                    const mine = String(sid) === String(userId);
                                    return (
                                        <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                                                    mine
                                                        ? 'bg-gray-900 text-white dark:bg-[#fbbc05] dark:text-black'
                                                        : 'bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10'
                                                }`}
                                            >
                                                {m.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form
                                onSubmit={handleSend}
                                className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#111111] flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type a message…"
                                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="px-6 rounded-2xl bg-gray-900 dark:bg-[#fbbc05] text-white dark:text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ChatInbox;
