import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllOrders, updateAdminOrderStatus } from '../../api/admin';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError('Could not load order history. The server might be temporarily unavailable.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.buyerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.buyerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedOrder) return;
        
        if (['Cancelled', 'Refunded'].includes(newStatus)) {
            if (!window.confirm(`Are you sure you want to mark this order as ${newStatus.toUpperCase()}? This action is critical.`)) return;
        }

        setUpdating(true);
        try {
            await updateAdminOrderStatus(selectedOrder._id, newStatus);
            setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
            setSelectedOrder({ ...selectedOrder, status: newStatus });
            alert('Status updated');
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <AdminLayout title="All Orders" subtitle="Platform Order History">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-1 max-w-2xl gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text"
                            placeholder="Search by Order ID or Buyer name..."
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
                        <option value="all">All Orders</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-12 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-red-600 mb-2">Fetch Error</h3>
                    <p className="text-sm text-red-500/80 mb-8 max-w-md mx-auto font-bold">{error}</p>
                    <button 
                        onClick={fetchOrders}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        Retry Load
                    </button>
                </div>
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
                                    <th className="p-6 font-black text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredOrders.map(order => (
                                    <tr 
                                        key={order._id} 
                                        className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                                    >
                                        <td className="p-6 font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="p-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <div className="font-bold">{order.buyerId?.firstName} {order.buyerId?.lastName}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{order.paymentMethod}</div>
                                        </td>
                                        <td className="p-6 font-black text-amber-600">₹{order.totalAmount}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr><td colSpan="6" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No orders found matching your search</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-1">Order Details</h3>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">#{selectedOrder._id.toUpperCase()}</p>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">✕</button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Buyer Information</div>
                                    <div className="font-bold text-gray-900 dark:text-white mb-1">{selectedOrder.buyerId?.firstName} {selectedOrder.buyerId?.lastName}</div>
                                    <div className="text-sm text-gray-500 mb-1">{selectedOrder.buyerId?.email}</div>
                                    <div className="text-sm text-gray-500">{selectedOrder.buyerId?.phone}</div>
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Address</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedOrder.shippingAddress || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Order Status Control</div>
                                    <div className="mb-6">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-purple-600 mb-2">Current Status</div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                            selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                            selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            selectedOrder.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Override Status</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(status => (
                                                <button 
                                                    key={status}
                                                    disabled={updating || selectedOrder.status === status}
                                                    onClick={() => handleStatusUpdate(status)}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        selectedOrder.status === status 
                                                        ? 'bg-gray-200 dark:bg-white/20 text-gray-400' 
                                                        : 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:border-purple-500'
                                                    }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Order Items</div>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-xl overflow-hidden border border-gray-100 dark:border-white/10">
                                                    {item.product?.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : '📦'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{item.product?.name || 'Product'}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.priceAtOrder}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-gray-900 dark:text-white">₹{item.quantity * item.priceAtOrder}</div>
                                                <div className="text-[9px] text-purple-600 font-bold uppercase tracking-widest">Farmer: {item.farmerId?.firstName || 'N/A'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-white/10">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Payment Method</div>
                                    <div className="font-black uppercase tracking-tighter text-gray-900 dark:text-white text-xl">{selectedOrder.paymentMethod}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 mr-1">Total Amount Paid</div>
                                    <div className="text-4xl font-black tracking-tighter text-amber-600">₹{selectedOrder.totalAmount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Orders;
