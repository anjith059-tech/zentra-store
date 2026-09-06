import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="about-page" className="px-4 py-6 space-y-10 pb-24 max-w-4xl md:max-w-6xl mx-auto md:px-6 lg:px-8 md:py-10 md:space-y-14">
      <BackButton onClick={() => navigate(-1)} />

      {/* Hero Section */}
      <div className="space-y-6 text-center">
        <span className="inline-block text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 md:px-4 py-1 rounded-full">
          About Zentra
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-slate-900 tracking-tight leading-tight max-w-2xl md:max-w-3xl mx-auto">
          Crafting the Future of Home Living
        </h1>

        <div className="relative overflow-hidden rounded-3xl shadow-sm border border-slate-200/60 aspect-[16/9] md:aspect-none md:h-[480px] lg:h-[560px] w-full">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Modern luxury home interior"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Brand Story */}
      <div className="max-w-2xl md:max-w-3xl mx-auto text-center space-y-3">
        <p className="text-sm md:text-base text-slate-600 leading-loose">
          At Zentra, we bridge the gap between cutting-edge technology and everyday convenience.
          Our mission is to design and curate intelligent, minimalist home appliances that seamlessly integrate into modern lifestyle routines, delivering effortless performance and timeless elegance.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 mt-10 md:mt-14">
        {/* Innovation */}
        <div className="relative h-56 md:h-72 overflow-hidden rounded-3xl group shadow-md hover:shadow-xl transition-all duration-500 cursor-default">
          <img
            src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"
            alt="Innovation"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3">
              <Cpu className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1">Innovation</h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Curated smart appliances that elevate your daily routine.
            </p>
          </div>
        </div>

        {/* Quality */}
        <div className="relative h-56 md:h-72 overflow-hidden rounded-3xl group shadow-md hover:shadow-xl transition-all duration-500 cursor-default">
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
            alt="Quality"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1">Quality</h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Premium materials backed by our comprehensive warranty.
            </p>
          </div>
        </div>

        {/* Service */}
        <div className="relative h-56 md:h-72 overflow-hidden rounded-3xl group shadow-md hover:shadow-xl transition-all duration-500 cursor-default">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
            alt="Service"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3">
              <Headphones className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1">Service</h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              24/7 dedicated support for a seamless shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all tracking-wide text-xs active:scale-98"
        >
          <span>Explore Our Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


