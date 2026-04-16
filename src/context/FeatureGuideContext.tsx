import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureGuideContextType {
  triggerGuide: (id: string) => void;
  activeGuideId: string | null;
  closeGuide: () => void;
}

const FeatureGuideContext = createContext<FeatureGuideContextType | undefined>(undefined);

export const FeatureGuideProvider = ({ children }: { children: ReactNode }) => {
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  const triggerGuide = (id: string) => {
    const completed = JSON.parse(localStorage.getItem('anywear_completed_guides') || '[]');
    if (!completed.includes(id)) {
      setActiveGuideId(id);
    }
  };

  const closeGuide = () => {
    if (activeGuideId) {
      const completed = JSON.parse(localStorage.getItem('anywear_completed_guides') || '[]');
      if (!completed.includes(activeGuideId)) {
        completed.push(activeGuideId);
        localStorage.setItem('anywear_completed_guides', JSON.stringify(completed));
      }
    }
    setActiveGuideId(null);
  };

  return (
    <FeatureGuideContext.Provider value={{ triggerGuide, activeGuideId, closeGuide }}>
      {children}
    </FeatureGuideContext.Provider>
  );
};

export const useFeatureGuide = () => {
  const context = useContext(FeatureGuideContext);
  if (context === undefined) {
    throw new Error('useFeatureGuide must be used within a FeatureGuideProvider');
  }
  return context;
};
