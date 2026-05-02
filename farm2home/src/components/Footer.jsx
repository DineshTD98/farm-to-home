import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <>
            {/* Support Strip */}
            <section id="support" className="py-24 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-white/5 transition-colors duration-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">Support & Inquiries</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 font-medium">Need help with your account or have questions about our verified farmers? Reach out to our dedicated support team directly.</p>
                    <div className="flex justify-center gap-6 flex-wrap">
                        <button className="px-12 py-4 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest hover:border-gray-900 dark:hover:border-white transition-all shadow-sm">Email Support</button>
                        <button onClick={() => navigate('/faq', { state: { backUrl: location.pathname } })} className="px-12 py-4 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest hover:border-gray-900 dark:hover:border-white transition-all shadow-sm">View FAQ</button>
                    </div>
                </div>
            </section>

            {/* Main Footer */}
            <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 py-24 px-6 transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🌾</span>
                        <div className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
                            Farm<span className="text-[#fbbc05]">2</span>Home
                        </div>
                    </div>
                    
                    <div className="flex gap-12 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em]">
                        <Link to="/privacy" state={{ backUrl: location.pathname }} className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" state={{ backUrl: location.pathname }} className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Use</Link>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Safety</a>
                    </div>

                    <div className="flex gap-6">
                        <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white cursor-pointer transition-all">f</div>
                        <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white cursor-pointer transition-all">i</div>
                        <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-200 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white cursor-pointer transition-all">x</div>
                    </div>
                </div>
                <div className="text-center mt-16 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
                    © 2026 Farm2Home Platform. Guaranteed Freshness.
                </div>
            </footer>
        </>
    );
};

export default Footer;
