import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllFarmers, getAllBuyers, verifyFarmerBankDetails } from '../../api/admin';

const Users = () => {
    const [farmers, setFarmers] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [activeTab, setActiveTab] = useState('farmers'); // 'farmers' or 'buyers'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const [farmersData, buyersData] = await Promise.all([
                    getAllFarmers(),
                    getAllBuyers()
                ]);
                setFarmers(farmersData);
                setBuyers(buyersData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsers();
    }, []);

    const handleVerify = async (id) => {
        try {
            await verifyFarmerBankDetails(id);
            setFarmers(farmers.map(f => f._id === id ? { ...f, bankDetails: { ...f.bankDetails, verified: true } } : f));
        } catch (err) {
            console.error('Verify error', err);
            alert('Failed to verify bank details');
        }
    };

    const FarmersTable = () => (
        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="p-6 font-black">Name</th>
                            <th className="p-6 font-black">Phone</th>
                            <th className="p-6 font-black">Payout Details</th>
                            <th className="p-6 font-black">Joined</th>
                            <th className="p-6 font-black text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {farmers.map(farmer => (
                            <tr key={farmer._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-6 font-bold flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black">
                                        {farmer.firstName?.[0]}{farmer.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{farmer.firstName} {farmer.lastName}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Farmer</div>
                                    </div>
                                </td>
                                <td className="p-6">{farmer.phone}</td>
                                <td className="p-6">
                                    {farmer.bankDetails?.accountNumber ? (
                                        <>
                                            <div className="font-bold">{farmer.bankDetails.bankName || 'N/A'} - {farmer.bankDetails.accountNumber}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest">{farmer.bankDetails.ifsc} | {farmer.bankDetails.accountHolderName}</div>
                                            {farmer.bankDetails.verified ? (
                                                <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">✓ VERIFIED</span>
                                            ) : (
                                                <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mt-1 inline-block">⏳ UNVERIFIED</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">Not set</span>
                                    )}
                                </td>
                                <td className="p-6 text-gray-500">{new Date(farmer.createdAt).toLocaleDateString()}</td>
                                <td className="p-6 text-right">
                                    {farmer.bankDetails?.accountNumber && !farmer.bankDetails?.verified && (
                                        <button 
                                            onClick={() => handleVerify(farmer._id)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                                        >
                                            Approve Details
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {farmers.length === 0 && (
                            <tr><td colSpan="5" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No farmers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const BuyersTable = () => (
        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="p-6 font-black">Name</th>
                            <th className="p-6 font-black">Phone</th>
                            <th className="p-6 font-black">Email</th>
                            <th className="p-6 font-black">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {buyers.map(buyer => (
                            <tr key={buyer._id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-6 font-bold flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black">
                                        {buyer.firstName?.[0]}{buyer.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{buyer.firstName} {buyer.lastName}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Buyer</div>
                                    </div>
                                </td>
                                <td className="p-6">{buyer.phone}</td>
                                <td className="p-6 text-gray-500">{buyer.email || 'N/A'}</td>
                                <td className="p-6 text-gray-500">{new Date(buyer.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {buyers.length === 0 && (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-500 text-xs uppercase tracking-widest">No buyers found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Users" subtitle="Platform Community">
            <div className="flex gap-4 mb-8 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
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

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : (
                activeTab === 'farmers' ? <FarmersTable /> : <BuyersTable />
            )}
        </AdminLayout>
    );
};

export default Users;
