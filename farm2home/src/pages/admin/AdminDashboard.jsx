import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAdminStats } from '../../api/admin';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalOrders: 0, totalFarmers: 0, pendingPayoutAmount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <AdminLayout title="Analytics" subtitle="Platform Overview">
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-4xl mb-4">📦</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Total Orders</div>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalOrders}</div>
                    </div>
                    <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-4xl mb-4">🧑‍🌾</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Total Farmers</div>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalFarmers}</div>
                    </div>
                    <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-4xl mb-4">💰</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Pending Payouts</div>
                        <div className="text-4xl font-black text-amber-500">₹{stats.pendingPayoutAmount.toFixed(2)}</div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
