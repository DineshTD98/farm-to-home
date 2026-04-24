import { useNavigate } from 'react-router-dom';

const BuyerPortal = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cards = [
    { icon: '🛒', title: 'Browse Produce', desc: 'Explore fresh farm produce listings' },
    { icon: '📋', title: 'My Orders', desc: 'Track your current and past orders' },
    { icon: '❤️', title: 'Favourites', desc: 'Your saved farmers and products' },
    { icon: '💳', title: 'Payments', desc: 'Manage payment methods and history' },
    { icon: '⭐', title: 'Reviews', desc: 'Rate and review your purchases' },
  ];

  return (
    <div className="min-h-screen bg-[#fffdf5] font-sans text-gray-800">
      {/* BRANDED NAVIGATION - Original Style */}
      <nav className="bg-white px-6 py-4 flex items-center justify-between border-b border-amber-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <span className="text-[#451a03] font-black text-xl tracking-tighter uppercase">Farm<span className="text-[#f59e0b]">2</span>Home</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <div className="text-[#451a03] font-bold leading-none">{user.firstName} {user.lastName}</div>
              <div className="text-[#92400e]/60 text-[9px] font-black uppercase tracking-widest mt-1">Buyer Portal</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buyer/settings')}
              className="h-10 w-10 rounded-full border border-amber-200 flex items-center justify-center bg-amber-50 text-[#f59e0b] font-black shadow-sm cursor-pointer"
              title="Go to settings"
              aria-label="Go to settings"
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-[#451a03] text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#f59e0b] hover:text-[#451a03] transition-all shadow-lg shadow-amber-900/10"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* REPLACED HERO BANNER WITH CLEAN WELCOME */}
      <div className="py-16 px-6 bg-gradient-to-b from-white to-[#fffdf5] border-b border-amber-50">
        <div className="max-w-7xl mx-auto">
            <div className="inline-block px-4 py-1 rounded-full bg-amber-100/50 text-[#92400e] text-[9px] font-black uppercase tracking-widest mb-6">
                Welcome Back
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#451a03] tracking-tighter uppercase mb-4">
                Hello, <span className="text-[#f59e0b]">{user.firstName}</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl">
                Your direct link to fresh farm produce. Manage your orders, browse new listings, and connect with local farmers.
            </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-12">
            <h2 className="text-xs font-black text-[#92400e] uppercase tracking-[0.3em]">Quick Actions</h2>
            <div className="h-px bg-amber-100 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div className="group bg-white p-8 rounded-[2.5rem] border border-amber-50 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative" key={card.title}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              <span className="text-5xl mb-8 block transform group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
              <div className="text-xl font-black text-[#451a03] mb-2 uppercase tracking-tight">{card.title}</div>
              <div className="text-gray-400 text-sm leading-relaxed font-medium">{card.desc}</div>
              <div className="mt-8 flex items-center text-[#f59e0b] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                Enter inside <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-amber-50 py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
        © 2026 Farm2Home. Sourced Directly.
      </footer>
    </div>
  );
};

export default BuyerPortal;
