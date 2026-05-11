import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TermsOfUse = () => {
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
                        className="flex items-center gap-2" 
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
                        Terms of <span className="text-[#fbbc05]">Use</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg uppercase tracking-widest">
                        Last Updated: April 27, 2026
                    </p>
                </header>

                <div className="space-y-12 prose dark:prose-invert max-w-none">
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">01</span>
                            Agreement to Terms
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Welcome to Farm2Home. By accessing or using our platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">02</span>
                            User Accounts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            To access certain features of the platform, you may be required to register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Provide accurate, current, and complete information.</li>
                            <li>Maintain the security of your password and identification.</li>
                            <li>Promptly update your account information to keep it accurate.</li>
                            <li>Accept all risks of unauthorized access to your account data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">03</span>
                            Marketplace Conduct
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Farm2Home connects independent farmers directly with consumers. While we verify our farmers, the quality and accuracy of individual listings are the responsibility of the sellers. Users agree not to engage in fraudulent activities, harassment, or any behavior that compromises the integrity of the marketplace.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">04</span>
                            Payments and Fees
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            All transactions are processed securely. Farm2Home may charge service fees for facilitating the platform's operations. These fees are clearly disclosed during the checkout process. By completing a purchase, you authorize the charge to your selected payment method.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">05</span>
                            Termination
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            We reserve the right to terminate or suspend your account and access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users or our business interests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs">06</span>
                            Contact Us
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            If you have any questions about these Terms, please contact us at support@farm2home.com.
                        </p>
                    </section>
                </div>
            </main>

            {/* Subtle Footer for this page */}
            <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                    © 2026 Farm2Home Platform. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default TermsOfUse;
