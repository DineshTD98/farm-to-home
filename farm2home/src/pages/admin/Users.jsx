import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllFarmers, getAllBuyers, verifyFarmerBankDetails, updateUserStatus, deleteUser, sendUserNotification } from '../../api/admin';

const Users = () => {
    const [farmers, setFarmers] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [activeTab, setActiveTab] = useState('farmers');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filterUsers = (users) => {
        return users.filter(u => {
            const matchesSearch = 
                u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phone?.includes(searchTerm) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && (!u.status || u.status === 'active')) ||
                (statusFilter === 'suspended' && u.status === 'suspended');

            return matchesSearch && matchesStatus;
        });
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const [farmersData, buyersData] = await Promise.all([
                getAllFarmers(),
                getAllBuyers()
            ]);
            setFarmers(farmersData);
            setBuyers(buyersData);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch platform users. Please check your connection or try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');

    const handleVerify = async (id) => {
        if (!window.confirm('Are you sure you want to approve these bank details? This will allow payouts to be sent to this farmer.')) return;
        try {
            await verifyFarmerBankDetails(id);
            setFarmers(farmers.map(f => f._id === id ? { ...f, bankDetails: { ...f.bankDetails, verified: true } } : f));
        } catch (err) {
            console.error('Verify error', err);
            alert('Failed to verify bank details');
        }
    };

    const handleStatusUpdate = async (userId, newStatus) => {
        const action = newStatus === 'suspended' ? 'suspend' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await updateUserStatus(userId, newStatus);
            const updateFn = (list) => list.map(u => u._id === userId ? { ...u, status: newStatus } : u);
            setFarmers(updateFn(farmers));
            setBuyers(updateFn(buyers));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await deleteUser(userId);
            setFarmers(farmers.filter(u => u._id !== userId));
            setBuyers(buyers.filter(u => u._id !== userId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        try {
            await sendUserNotification(selectedUser._id, messageText);
            setShowMessageModal(false);
            setMessageText('');
            alert('Message sent successfully');
        } catch (err) {
            alert(err.message);
        }
    };

    const FarmersTable = ({ data }) => (
        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="p-6 font-black">Name</th>
                            <th className="p-6 font-black">Phone</th>
                            <th className="p-6 font-black">Payout Details</th>
                            <th className="p-6 font-black">Status</th>
                            <th className="p-6 font-black text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map(farmer => (
                            <tr key={farmer._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-6 font-bold flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black">
                                        {farmer.firstName?.[0]}{farmer.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{farmer.firstName} {farmer.lastName}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{farmer.email || 'No Email'}</div>
                                    </div>
                                </td>
                                <td className="p-6 font-medium">{farmer.phone}</td>
                                <td className="p-6">
                                    {farmer.bankDetails?.accountNumber ? (
                                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                                            <div className="font-bold text-gray-900 dark:text-white">{farmer.bankDetails.bankName || 'N/A'}</div>
                                            <div className="text-[11px] text-gray-500">{farmer.bankDetails.accountNumber}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{farmer.bankDetails.ifsc} | {farmer.bankDetails.accountHolderName}</div>
                                            {farmer.bankDetails.verified ? (
                                                <span className="text-[8px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-2 inline-block">✓ VERIFIED</span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerify(farmer._id)}
                                                    className="text-[8px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mt-2 hover:bg-amber-200 transition-colors"
                                                >
                                                    ⏳ APPROVE
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">Not set</span>
                                    )}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        farmer.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {farmer.status || 'active'}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setSelectedUser(farmer); setShowMessageModal(true); }}
                                                className="px-3 py-1.5 bg-purple-100 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-200 transition-colors"
                                            >
                                                Message
                                            </button>
                                            {farmer.status === 'suspended' ? (
                                                <button 
                                                    onClick={() => handleStatusUpdate(farmer._id, 'active')}
                                                    className="px-3 py-1.5 bg-green-100 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStatusUpdate(farmer._id, 'suspended')}
                                                    className="px-3 py-1.5 bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-200 transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteUser(farmer._id)}
                                            className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest underline decoration-red-200 underline-offset-4"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No farmers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const BuyersTable = ({ data }) => (
        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="p-6 font-black">Name</th>
                            <th className="p-6 font-black">Phone</th>
                            <th className="p-6 font-black">Status</th>
                            <th className="p-6 font-black text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map(buyer => (
                            <tr key={buyer._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-6 font-bold flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                                        {buyer.firstName?.[0]}{buyer.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{buyer.firstName} {buyer.lastName}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{buyer.email || 'No Email'}</div>
                                    </div>
                                </td>
                                <td className="p-6 font-medium">{buyer.phone}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        buyer.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {buyer.status || 'active'}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setSelectedUser(buyer); setShowMessageModal(true); }}
                                                className="px-3 py-1.5 bg-purple-100 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-200 transition-colors"
                                            >
                                                Message
                                            </button>
                                            {buyer.status === 'suspended' ? (
                                                <button 
                                                    onClick={() => handleStatusUpdate(buyer._id, 'active')}
                                                    className="px-3 py-1.5 bg-green-100 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleStatusUpdate(buyer._id, 'suspended')}
                                                    className="px-3 py-1.5 bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-200 transition-colors"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteUser(buyer._id)}
                                            className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest underline decoration-red-200 underline-offset-4"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No buyers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Users" subtitle="Platform Community">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex gap-4 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('farmers')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'farmers' 
                            ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                        Farmers ({farmers.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('buyers')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'buyers' 
                            ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                        Buyers ({buyers.length})
                    </button>
                </div>

                <div className="flex flex-1 max-w-2xl gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input 
                            type="text"
                            placeholder="Search name, phone, or email..."
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
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="suspended">Suspended Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-12 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-red-600 mb-2">Connection Error</h3>
                    <p className="text-sm text-red-500/80 mb-8 max-w-md mx-auto font-bold">{error}</p>
                    <button 
                        onClick={fetchUsers}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                activeTab === 'farmers' ? <FarmersTable data={filterUsers(farmers)} /> : <BuyersTable data={filterUsers(buyers)} />
            )}

            {showMessageModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Send Message</h3>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-8">To: {selectedUser?.firstName} {selectedUser?.lastName}</p>
                        
                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">Message Content</label>
                            <textarea 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message here..."
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors min-h-[120px]"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowMessageModal(false)}
                                className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                className="flex-1 px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                            >
                                Send Notification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Users;
