import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Import local assets
import slide1Img from '../assets/fresh-indian-produce-hero.png';
import slide2Img from '../assets/sunny-meadow-landscape.jpg';
import slide3Img from '../assets/strawberry-field.jpg';
import slide4Img from '../assets/two-brown-cattle-grass-field.jpg';

const SLIDES = [
  {
    image: slide1Img,
    label: '🚜 Authentically Local & Pure',
    title: 'Directly From <span class="text-[#fbbc05]">Farm</span><br/>To Your Table',
    desc: 'Experience the freshness of the field. We bridge the gap between local verified farmers and your home, ensuring purity in every bite.'
  },
  {
    image: slide2Img,
    label: '🌄 Sustainable Agriculture',
    title: 'Nurturing the <span class="text-[#fbbc05]">Earth</span>,<br/>Feeding Families',
    desc: 'Our mission is to promote sustainable farming practices that protect our environment while providing healthy food.'
  },
  {
    image: slide3Img,
    label: '🍓 Picked At Perfection',
    title: 'Seasonal <span class="text-[#fbbc05]">Bounties</span>,<br/>Delivered Fresh',
    desc: 'Enjoy the vibrant flavors of the season. Our farmers ensure that every produce is picked at its peak sweetness and nutrition.'
  },
  {
    image: slide4Img,
    label: '🐄 Compassionate Farming',
    title: 'Rooted in <span class="text-[#fbbc05]">Tradition</span>,<br/>Grown with Care',
    desc: 'Supporting small-scale farmers who treat their land and livestock with the respect they deserve.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 overflow-x-hidden dark:bg-[#0a0a0a] dark:text-white transition-colors duration-500">
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md sticky top-0 border-b border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <div className="text-xl font-extrabold tracking-tighter text-gray-900 dark:text-white uppercase">
            Farm<span className="text-[#fbbc05]">2</span>Home
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-[#fbbc05] transition-colors border-b-2 border-transparent hover:border-[#fbbc05] pb-1 uppercase">Home</button>
            <a href="#direct-connect" className="hover:text-[#fbbc05] transition-colors border-b-2 border-transparent hover:border-[#fbbc05] pb-1 uppercase">Our Mission</a>
            <button onClick={() => navigate('/privacy')} className="hover:text-[#fbbc05] transition-colors border-b-2 border-transparent hover:border-[#fbbc05] pb-1 uppercase">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#fbbc05] transition-colors border-b-2 border-transparent hover:border-[#fbbc05] pb-1 uppercase">Terms</button>
            <a href="#support" className="hover:text-[#fbbc05] transition-colors border-b-2 border-transparent hover:border-[#fbbc05] pb-1 uppercase">Support</a>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden lg:flex gap-4 items-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-2.5 rounded-full border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-2.5 rounded-full bg-green-800 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/10 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 rounded-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white transition-all border border-gray-100 dark:border-white/5"
          >
            <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/10 p-6 flex flex-col gap-6 lg:hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-[11px] text-left font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400 hover:text-[#fbbc05]">Home</button>
            <a href="#direct-connect" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400 hover:text-[#fbbc05]">Our Mission</a>
            <button onClick={() => { navigate('/privacy'); setIsMenuOpen(false); }} className="text-[11px] text-left font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400 hover:text-[#fbbc05]">Privacy Policy</button>
            <button onClick={() => { navigate('/terms'); setIsMenuOpen(false); }} className="text-[11px] text-left font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400 hover:text-[#fbbc05]">Terms of Use</button>
            <a href="#support" onClick={() => setIsMenuOpen(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-400 hover:text-[#fbbc05]">Support</a>
            <hr className="border-gray-100 dark:border-white/5" />
            <button
              onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
              className="w-full py-4 rounded-xl border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest"
            >
              Sign In
            </button>
            <button
              onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
              className="w-full py-4 rounded-xl bg-green-800 text-white text-[11px] font-black uppercase tracking-widest shadow-lg"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section: Carousel Banner */}
      <section className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden bg-gray-900">
        {SLIDES.map((slide, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Image Banner */}
            <div className="absolute inset-0">
                <img 
                    src={slide.image} 
                    alt={slide.label} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
            </div>

            {/* Floating Text Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 text-left">
                <div className={`max-w-3xl transform transition-transform duration-1000 ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#fbbc05]/20 border border-[#fbbc05]/30 text-[#fbbc05] text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                        {slide.label}
                    </div>
                    
                    <h1 
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1] tracking-tighter mb-8 uppercase"
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />

                    <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed mb-12 font-medium">
                        {slide.desc}
                    </p>

                    <div className="flex gap-6 flex-wrap">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-10 py-5 rounded-full bg-[#fbbc05] text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-400 hover:-translate-y-1 transition-all duration-300"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-10 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
                        >
                            Access Portal
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-12 left-0 w-full flex justify-center gap-3 z-30">
            {SLIDES.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-12 bg-[#fbbc05]' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                />
            ))}
        </div>
      </section>

      {/* Stats Strip */}
      <div className="bg-gray-50 dark:bg-white/5 py-12 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-10">
            <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">100%</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Verified Sources</div>
            </div>
            <div className="text-center border-x border-gray-200 dark:border-white/10 px-4">
                <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">FRESH</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Daily Harvest</div>
            </div>
            <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">DIRECT</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">No Middlemen</div>
            </div>
        </div>
      </div>

      {/* Connection Mission Section */}
      <section id="direct-connect" className="py-32 px-6 md:px-12 bg-white dark:bg-gray-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-24 max-w-3xl">
                <div className="text-[#fbbc05] font-black text-xs uppercase tracking-[0.5em] mb-6">Our Core Commitment</div>
                <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1] mb-10 uppercase tracking-tighter">
                   LOCAL <span className="text-gray-300 dark:text-gray-700">SOURCING</span>
                </h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    By connecting you directly to the producer, we ensure that the quality is never compromised and the farmer receives the true value of their hard work.
                </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 w-full">
                {[
                    { icon: '🌾', title: 'Browse Lists', desc: 'Farmers list their daily harvests directly on the platform with full transparency.' },
                    { icon: '🥦', title: 'Order Fresh', desc: 'Select the best produce from multiple farms and order exactly what you need.' },
                    { icon: '📦', title: 'Home Delivery', desc: 'Quick and safe delivery from the farmhouse directly to your kitchen doorstep.' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50/50 dark:bg-white/5 p-12 rounded-[4rem] border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:-translate-y-2 transition-all duration-300">
                        <div className="text-5xl mb-8">{item.icon}</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white mb-5 uppercase tracking-tighter">{item.title}</div>
                        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed font-medium">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
