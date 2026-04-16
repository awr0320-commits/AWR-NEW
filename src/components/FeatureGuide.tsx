import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useFeatureGuide } from '../context/FeatureGuideContext';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface GuideStep {
  id: string;
  titleKey: string;
  descKey: string;
}

const STEPS: Record<string, GuideStep> = {
  main: {
    id: 'main',
    titleKey: 'guide_main_title',
    descKey: 'guide_main_desc'
  },
  workshop: {
    id: 'workshop',
    titleKey: 'guide_create_title',
    descKey: 'guide_create_desc'
  },
  wardrobe: {
    id: 'wardrobe',
    titleKey: 'guide_closet_title',
    descKey: 'guide_closet_desc'
  },
  profile: {
    id: 'profile',
    titleKey: 'guide_me_title',
    descKey: 'guide_me_desc'
  }
};

const TUTORIAL_ORDER = ['main', 'workshop', 'wardrobe', 'profile'];

const FeatureGuide = ({ isAuthCompleted = true }: { isAuthCompleted?: boolean }) => {
  const { t, showTutorial, completeTutorial } = useLanguage();
  const { activeGuideId, closeGuide, triggerGuide } = useFeatureGuide();
  const [tutorialIndex, setTutorialIndex] = React.useState(0);

  React.useEffect(() => {
    if (showTutorial && isAuthCompleted) {
      triggerGuide(TUTORIAL_ORDER[0]);
      setTutorialIndex(0);
    }
  }, [showTutorial, isAuthCompleted]);

  const step = activeGuideId ? STEPS[activeGuideId] : null;

  const handleNext = () => {
    if (showTutorial) {
      const nextIndex = tutorialIndex + 1;
      if (nextIndex < TUTORIAL_ORDER.length) {
        setTutorialIndex(nextIndex);
        triggerGuide(TUTORIAL_ORDER[nextIndex]);
      } else {
        completeTutorial();
        closeGuide();
      }
    } else {
      closeGuide();
    }
  };

  return (
    <AnimatePresence>
      {step && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl border border-black/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <button 
              onClick={() => {
                completeTutorial();
                closeGuide();
              }}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={20} className="text-black/20" />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-inner">
                <Sparkles size={48} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {showTutorial && TUTORIAL_ORDER.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i === tutorialIndex ? "bg-indigo-600 w-4" : "bg-stone-200"
                      )} 
                    />
                  ))}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-black">{t(step.titleKey)}</h2>
                <p className="text-sm text-black/60 font-medium leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {showTutorial && tutorialIndex < TUTORIAL_ORDER.length - 1 ? t('guide_next') : t('guide_finish')}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureGuide;
