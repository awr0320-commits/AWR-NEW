import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'zh', label: '繁體中文' },
    { code: 'en', label: 'English' }
  ];

  const currentLabel = languages.find(l => l.code === language)?.label || 'English';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-black/10 rounded-full shadow-sm hover:bg-black/5 transition-all active:scale-95"
      >
        <Globe size={20} className="text-black/60" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-40 bg-white border border-black/5 rounded-2xl shadow-2xl overflow-hidden z-[200]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'zh' | 'en');
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-5 py-3 text-left text-sm font-bold transition-colors",
                  language === lang.code ? "bg-black text-white" : "text-black/60 hover:bg-black/5"
                )}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
