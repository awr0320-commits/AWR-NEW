import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { UserCircle, Chrome } from 'lucide-react';
import { cn } from '../lib/utils';

import { useGoogleLogin } from '@react-oauth/google';

interface AuthScreenProps {
  onComplete: (type: 'google' | 'guest', userData?: { name: string, avatar: string, email: string }) => void;
}

const AuthScreen = ({ onComplete }: AuthScreenProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        onComplete('google', {
          name: userInfo.name || 'Google User',
          avatar: userInfo.picture || '',
          email: userInfo.email || ''
        });
      } catch (err) {
        console.error("[AWR] Failed to fetch Google user info", err);
        setIsLoading(false);
      }
    },
    onError: errorResponse => {
      console.error("[AWR] Google Login Failed", errorResponse);
      setIsLoading(false);
    },
  });

  const handleGoogleLogin = () => {
    setIsLoading(true);
    googleLogin();
  };

  const handleGuestLogin = () => {
    onComplete('guest');
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-blue-50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-emerald-50 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        <div className="mb-12 p-6 bg-black text-white rounded-[40px] shadow-2xl shadow-black/20">
          <UserCircle size={64} strokeWidth={1} />
        </div>

        <h1 className="text-4xl font-serif tracking-tight mb-4">{t('auth_title')}</h1>
        <p className="text-black/40 text-sm font-medium mb-12 leading-relaxed">
          {t('auth_subtitle')}
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={cn(
              "w-full group relative flex items-center justify-center p-5 bg-white border border-black/10 hover:border-black/30 hover:shadow-md rounded-[32px] transition-all duration-300 active:scale-95 gap-3",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <Chrome size={20} className={isLoading ? "animate-spin text-black/50" : "text-black"} />
            <span className="text-sm font-bold tracking-tight">
              {isLoading ? t('auth_mock_loading') : t('auth_google')}
            </span>
          </button>

          <button 
            onClick={handleGuestLogin}
            disabled={isLoading}
            className={cn(
              "w-full group relative flex items-center justify-center p-5 bg-stone-100 hover:bg-black hover:text-white rounded-[32px] transition-all duration-300 active:scale-95 gap-3",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <span className="text-sm font-bold tracking-tight">
              {t('auth_guest')}
            </span>
          </button>
        </div>

        <p className="mt-12 text-[10px] font-medium tracking-wide text-black/30 px-4">
          {t('auth_terms')}
        </p>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
