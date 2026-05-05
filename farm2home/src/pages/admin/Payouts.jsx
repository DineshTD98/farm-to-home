import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllPayouts, markPayoutPaid } from '../../api/admin';

const Payouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayouts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllPayouts();
            setPayouts(data);
        } catch (err) {
            console.error(err);
            setError('Failed to sync settlements. Please refresh or try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [reference, setReference] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredPayouts = payouts.filter(payout => {
        const matchesSearch = 
            payout.farmerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payout.farmerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payout.farmerId?.phone?.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleConfirmPaid = async () => {
        if (!reference.trim()) {
            alert('Please enter a transaction reference');
            return;
        }
        try {
            await markPayoutPaid(selectedPayout._id, reference);
            setPayouts(payouts.map(p => p._id === selectedPayout._id ? { ...p, status: 'Paid', paidAt: new Date().toISOString(), transactionReference: reference } : p));
            setShowModal(false);
        } catch (err) {
            console.error('Error marking paid', err);
            alert('Failed to mark as paid');
        }
    };

    return (
        <AdminLayout title="Payouts" subtitle="Farmer Settlements">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-1 max-w-2xl gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text"
                            placeholder="Search by Farmer name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                        <option value="all">All Payouts</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Paid">Paid Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-12 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-red-600 mb-2">Sync Error</h3>
                    <p className="text-sm text-red-500/80 mb-8 max-w-md mx-auto font-bold">{error}</p>
                    <button 
                        onClick={fetchPayouts}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        Try Resync
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-6 font-black">Date</th>
                                    <th className="p-6 font-black">Farmer</th>
                                    <th className="p-6 font-black">Order ID</th>
                                    <th className="p-6 font-black">Buyer Payment</th>
                                    <th className="p-6 font-black">Amount</th>
                                    <th className="p-6 font-black">Status</th>
                                    <th className="p-6 font-black text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredPayouts.map(payout => (
                                    <tr key={payout._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-6 text-gray-500">{new Date(payout.createdAt).toLocaleDateString()}</td>
                                        <td className="p-6 font-bold">{payout.farmerId?.firstName} {payout.farmerId?.lastName}</td>
                                        <td className="p-6 text-gray-400">#{payout.orderId?._id?.slice(-6).toUpperCase()}</td>
                                        <td className="p-6">
                                            <div className="font-bold">{payout.orderId?.paymentMethod || 'COD'}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{payout.orderId?.status}</div>
                                        </td>
                                        <td className="p-6 font-black text-amber-600">₹{payout.amount}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                payout.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {payout.status}
                                            </span>
                                            {payout.status === 'Paid' && payout.paidAt && (
                                                <div className="text-[10px] text-gray-400 mt-1.5 font-bold">
                                                    {new Date(payout.paidAt).toLocaleDateString()} {new Date(payout.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {payout.status === 'Pending' ? (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setReference('');
                                                        setShowModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                            ) : (
                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                    Ref: {payout.transactionReference || 'N/A'}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayouts.length === 0 && (
                                    <tr><td colSpan="7" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No payouts found matching your search</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Confirm Payout</h3>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-8">Enter transaction reference (UTR/IMPS)</p>
                        
                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Reference ID</label>
                            <input 
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g. UTR123456789"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmPaid}
                                className="flex-1 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                            >
                                Confirm Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Payouts;
