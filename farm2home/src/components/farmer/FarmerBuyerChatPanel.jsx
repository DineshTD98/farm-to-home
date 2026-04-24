import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getOrCreateConversation,
    getChatMessages,
    sendChatMessage,
} from '../../api/chat';

const FarmerBuyerChatPanel = ({ buyer, farmerId, onClose, accentClass = 'bg-green-600' }) => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const buyerId = buyer?._id || buyer;

    useEffect(() => {
        let cancelled = false;
        const boot = async () => {
            if (!buyerId || !farmerId) return;
            setLoading(true);
            setError('');
            try {
                // api expects (buyerId, farmerId)
                const conv = await getOrCreateConversation(buyerId, farmerId);
                if (cancelled) return;
                setConversation(conv);
            } catch (e) {
                if (!cancelled) setError(e.message || 'Could not start chat');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        boot();
        return () => {
            cancelled = true;
        };
    }, [buyerId, farmerId]);

    const refreshMessages = useCallback(async () => {
        if (!conversation?._id || !farmerId) return;
        try {
            // fetching messages for this conversation as the farmer
            const data = await getChatMessages(conversation._id, farmerId);
            setMessages(data);
        } catch {
            /* keep existing */
        }
    }, [conversation?._id, farmerId]);

    useEffect(() => {
        if (!conversation?._id) return;
        refreshMessages();
        const t = setInterval(refreshMessages, 3500);
        return () => clearInterval(t);
    }, [conversation?._id, refreshMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || !conversation?._id || sending) return;
        setSending(true);
        try {
            await sendChatMessage(conversation._id, farmerId, trimmed);
            setText('');
            await refreshMessages();
        } catch (err) {
            setError(err.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const buyerName = buyer?.firstName
        ? `${buyer.firstName} ${buyer.lastName || ''}`.trim()
        : 'Buyer';

    return (
        <div className="fixed inset-0 z-[120] flex justify-end">
            <button
                type="button"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                aria-label="Close chat"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-[#111111] border-l border-gray-100 dark:border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div
                    className={`px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between ${accentClass} text-white`}
                >
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Chat with Buyer</div>
                        <div className="text-lg font-black tracking-tight">{buyerName}</div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg font-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading && (
                        <p className="text-center text-gray-400 text-sm font-medium py-12">Opening conversation…</p>
                    )}
                    {error && !loading && (
                        <p className="text-center text-red-500 text-sm font-medium px-4">{error}</p>
                    )}
                    {!loading &&
                        messages.map((m) => {
                            const sid = m.senderId?._id || m.senderId;
                            // Check if the current sender ID matches the farmer ID
                            const mine = String(sid) === String(farmerId);
                            return (
                                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                                            mine
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Reply to the buyer..."
                        disabled={loading || !conversation}
                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                    <button
                        type="submit"
                        disabled={sending || loading || !conversation}
                        className="px-5 rounded-2xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FarmerBuyerChatPanel;
