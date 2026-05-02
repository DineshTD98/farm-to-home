import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoBack = () => {
        if (location.state?.backUrl) {
            navigate(location.state.backUrl);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-500">
            {/* Header / Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div 
                        className="flex items-center gap-2 cursor-pointer" 
                        onClick={() => navigate('/')}
                    >
                        <span className="text-2xl">🌾</span>
                        <div className="text-lg font-black tracking-tighter uppercase">
                            Farm<span className="text-[#fbbc05]">2</span>Home
                        </div>
                    </div>
                    <button 
                        onClick={handleGoBack}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </nav>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto pt-32 pb-24 px-6">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
                        Privacy <span className="text-[#fbbc05]">Policy</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg uppercase tracking-widest">
                        Last Updated: April 27, 2026
                    </p>
                </header>

                <div className="space-y-12 prose dark:prose-invert max-w-none">
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">01</span>
                            Introduction
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            At Farm2Home, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">02</span>
                            Information We Collect
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Account Information: Name, email, phone number, and password.</li>
                            <li>Profile Information: Address, delivery preferences, and farmer details if applicable.</li>
                            <li>Transaction Data: Payment details (processed by secure third-party providers) and order history.</li>
                            <li>Communication Data: Messages exchanged between buyers and farmers on our platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">03</span>
                            How We Use Your Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            We use the collected information to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Facilitate orders and deliveries between farmers and buyers.</li>
                            <li>Provide customer support and resolve disputes.</li>
                            <li>Send platform updates, security alerts, and promotional content (if opted-in).</li>
                            <li>Improve our services and user experience through analytics.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">04</span>
                            Data Sharing
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            We do not sell your personal data. We share information only with:
                            <br /><br />
                            - **Farmers/Buyers**: Necessary contact and delivery info to complete transactions.
                            <br />
                            - **Service Providers**: Payment processors, delivery services, and hosting providers.
                            <br />
                            - **Legal Requirements**: If required by law or to protect our rights and users' safety.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">05</span>
                            Security
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">06</span>
                            Your Rights
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Depending on your location, you may have rights to access, correct, or delete your personal data. You can manage most of your information through your account settings or by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">07</span>
                            Contact Us
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            If you have any questions about this Privacy Policy, please reach out to privacy@farm2home.com.
                        </p>
                    </section>
                </div>
            </main>

            {/* Subtle Footer for this page */}
            <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                    © 2026 Farm2Home Platform. Your Privacy Matters.
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
