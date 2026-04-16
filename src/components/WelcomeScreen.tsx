import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ArrowRight } from 'lucide-react';

const WelcomeScreen = () => {
  const { setLanguage } = useLanguage();

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-indigo-50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-stone-100 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        <div className="mb-12 p-6 bg-black text-white rounded-[40px] shadow-2xl shadow-black/20">
          <Globe size={64} strokeWidth={1} />
        </div>

        <h1 className="text-4xl font-serif tracking-tight mb-4">AWR</h1>
        <p className="text-black/40 text-sm font-medium mb-12 leading-relaxed">
          Welcome to AWR. <br />
          Please select your preferred language to continue.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={() => setLanguage('zh')}
            className="w-full group relative flex items-center justify-between p-6 bg-stone-100 hover:bg-black hover:text-white rounded-[32px] transition-all duration-500 active:scale-95"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-black tracking-tight">繁體中文</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60">Traditional Chinese</span>
            </div>
            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button 
            onClick={() => setLanguage('en')}
            className="w-full group relative flex items-center justify-between p-6 bg-stone-100 hover:bg-black hover:text-white rounded-[32px] transition-all duration-500 active:scale-95"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-black tracking-tight">English</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60">International</span>
            </div>
            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-black/20">
          Your style, your language.
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
