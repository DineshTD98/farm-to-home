import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FAQS = [
  {
    question: "What is Farm2Home?",
    answer: "Farm2Home is a digital marketplace that connects consumers directly with local farmers, ensuring fresh produce and fair prices for both parties."
  },
  {
    question: "How do I place an order?",
    answer: "Simply browse the marketplace, add desired items to your cart, and proceed to checkout. You can filter by category or specific farmers."
  },
  {
    question: "Are the products organic?",
    answer: "Many of our farmers offer organic produce. You can look for the 'Organic' tag on product listings or check the farmer's profile for their farming practices."
  },
  {
    question: "How does delivery work?",
    answer: "Depending on your location and the farmer, delivery might be handled by our platform's delivery partners, directly by the farmer, or you can opt for local pickup."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept major credit/debit cards, digital wallets, and in some regions, cash on delivery."
  },
  {
    question: "Can I communicate directly with the farmer?",
    answer: "Yes! Our platform includes a built-in messaging system so you can ask questions or coordinate orders directly with sellers."
  },
  {
    question: "What is the return or refund policy?",
    answer: "If you receive damaged or incorrect items, you can raise a dispute within 24 hours of delivery. Our support team will help facilitate a refund or replacement."
  },
  {
    question: "Is there a minimum order quantity?",
    answer: "Minimum order quantities vary by farmer. Some sell in bulk, while others allow single-item purchases. Check the product details before ordering."
  },
  {
    question: "How do I register as a farmer?",
    answer: "Click on 'Sign Up' and choose the 'Farmer' account type. You will need to provide details about your farm to get verified before you can start selling."
  },
  {
    question: "How does Farm2Home ensure quality?",
    answer: "We verify our farmers during the onboarding process and rely on a community review system. Buyers can rate and review products, helping maintain high standards across the marketplace."
  }
];

const FAQ = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openIndex, setOpenIndex] = useState(null);

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
                        Frequently Asked <span className="text-[#fbbc05]">Questions</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg uppercase tracking-widest">
                        Everything you need to know about the platform
                    </p>
                </header>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <div 
                            key={index} 
                            className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#111111] shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <span className="font-bold text-lg">{faq.question}</span>
                                <span className={`text-xl transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#fbbc05]' : 'text-gray-400'}`}>
                                    ▾
                                </span>
                            </button>
                            
                            <div 
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="h-px w-full bg-gray-100 dark:bg-white/5 mb-5"></div>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">
                    © 2026 Farm2Home Platform. We're here to help.
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
