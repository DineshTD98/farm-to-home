import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllFarmers, verifyFarmerBankDetails } from '../../api/admin';

const Farmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const data = await getAllFarmers();
                setFarmers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchFarmers();
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

    return (
        <AdminLayout title="Farmers" subtitle="Platform Partners">
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : (
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
                                            {farmer.firstName} {farmer.lastName}
                                        </td>
                                        <td className="p-6">{farmer.phone}</td>
                                        <td className="p-6">
                                            {farmer.bankDetails?.accountNumber ? (
                                                <>
                                                    <div className="font-bold">{farmer.bankDetails.bankName || 'N/A'} - {farmer.bankDetails.accountNumber}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{farmer.bankDetails.ifsc} | {farmer.bankDetails.accountHolderName}</div>
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
            )}
        </AdminLayout>
    );
};

export default Farmers;
