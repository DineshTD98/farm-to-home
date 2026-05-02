import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllOrders } from '../../api/admin';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                setOrders(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <AdminLayout title="All Orders" subtitle="Platform Order History">
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-6 font-black">Order ID</th>
                                    <th className="p-6 font-black">Date</th>
                                    <th className="p-6 font-black">Buyer</th>
                                    <th className="p-6 font-black">Amount</th>
                                    <th className="p-6 font-black">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {orders.map(order => (
                                    <tr key={order._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="p-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <div className="font-bold">{order.buyerId?.firstName} {order.buyerId?.lastName}</div>
                                            <div className="text-[10px] text-gray-500">{order.buyerId?.phone}</div>
                                        </td>
                                        <td className="p-6 font-black text-amber-600">₹{order.totalAmount}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr><td colSpan="5" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No orders found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Orders;
