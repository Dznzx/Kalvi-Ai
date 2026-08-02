
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { Language } from '../../types';

interface Step {
  target: string; // ID of the element to highlight
  title: string;
  content: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

export const OnboardingTour: React.FC<{ language: Language }> = ({ language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [positionStyles, setPositionStyles] = useState({});

  const TOUR_KEY = 'kalvi_student_tour_completed';

  const steps: Step[] = [
    {
      target: 'tour-progress',
      title: language === 'ta' ? 'உங்கள் முன்னேற்றம்' : 'Your Progress',
      content: language === 'ta' ? 'உங்கள் கற்றல் புள்ளிவிவரங்கள் மற்றும் தொடர் கற்றலை இங்கே கண்காணிக்கவும்.' : 'Track your learning stats and streak here to stay motivated.',
      position: 'bottom'
    },
    {
      target: 'tour-modules',
      title: language === 'ta' ? 'பாடத் தொகுப்புகள்' : 'Course Modules',
      content: language === 'ta' ? 'உங்கள் வகுப்பிற்கான அனைத்து பாடங்களும் இங்கே உள்ளன. கற்கத் தொடங்க ஒன்றை கிளிக் செய்யவும்.' : 'All your grade-specific lessons are here. Click one to start learning.',
      position: 'top'
    },
    {
      target: 'tour-assistant',
      title: language === 'ta' ? 'AI உதவியாளர்' : 'AI Assistant',
      content: language === 'ta' ? 'சந்தேகம் உள்ளதா? ஒவ்வொரு பாடத்திலும் எங்கள் AI ஆசிரியரிடம் கேளுங்கள்.' : 'Stuck? Ask our AI tutor for help inside any lesson.',
      position: 'left' // Will likely fallback to generic if element not found in dashboard view
    }
  ];

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      // Small delay to allow DOM to render
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const element = document.getElementById(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Calculate position (simplified)
        // In a real lib like driver.js/react-joyride this is complex, 
        // here we just center it or put it near the element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

      {/* Card (Centered for simplicity in this custom implementation) */}
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative z-10 pointer-events-auto animate-bounce-in">
        <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
            <X size={20} />
        </button>
        
        <div className="mb-4">
            <span className="text-xs font-bold text-kalvi-blue uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1">{step.title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
            {step.content}
        </p>

        <div className="flex justify-between items-center">
            <div className="flex gap-1">
                {steps.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition ${i === currentStep ? 'bg-kalvi-blue w-4' : 'bg-gray-200'}`} />
                ))}
            </div>
            <button 
                onClick={handleNext}
                className="bg-kalvi-blue text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
            >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
        </div>
      </div>
    </div>
  );
};
