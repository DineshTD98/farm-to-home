import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllPayouts, markPayoutPaid } from '../../api/admin';

const Payouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const data = await getAllPayouts();
                setPayouts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayouts();
    }, []);

    const handleMarkPaid = async (id) => {
        try {
            await markPayoutPaid(id, `MANUAL_PAY_${Date.now()}`);
            setPayouts(payouts.map(p => p._id === id ? { ...p, status: 'Paid', paidAt: new Date().toISOString() } : p));
        } catch (err) {
            console.error('Error marking paid', err);
            alert('Failed to mark as paid');
        }
    };

    return (
        <AdminLayout title="Payouts" subtitle="Farmer Settlements">
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
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
                                {payouts.map(payout => (
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
                                        </td>
                                        <td className="p-6 text-right">
                                            {payout.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleMarkPaid(payout._id)}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr><td colSpan="6" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No payouts found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Payouts;
