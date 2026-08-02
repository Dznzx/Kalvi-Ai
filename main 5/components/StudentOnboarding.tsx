
import React from 'react';
import { Rocket, Code, Sparkles, BrainCircuit, CheckCircle2, ChevronRight } from 'lucide-react';
import { GradeGroup, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface StudentOnboardingProps {
  onSelect: (grade: GradeGroup) => void;
  language: Language;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ onSelect, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-1.5 rounded-full mb-6 shadow-sm">
             <Sparkles className="w-4 h-4 text-orange-500" />
             <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
               {language === 'ta' ? 'தொடங்குவோம்' : 'Let\'s Get Started'}
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {language === 'ta' ? 'வணக்கம்! நீங்கள் எந்த வகுப்பில் படிக்கிறீர்கள்?' : 'Welcome, Future Innovator!'}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {language === 'ta' ? 'உங்கள் கற்றல் பாதையைத் தேர்வுசெய்யவும்.' : 'Select your class to customize your learning journey.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Juniors (6-8) */}
          <button 
            onClick={() => onSelect('6-8')}
            className="group relative bg-white dark:bg-[#1A1F2E] rounded-3xl p-8 border-2 border-transparent hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 text-left transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Class 6 - 8
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                {language === 'ta' ? 'AI அடிப்படைகள் மற்றும் வேடிக்கையான திட்டங்களுடன் தொடங்குங்கள்.' : 'Start with AI Basics, Digital Safety & Fun Projects.'}
              </p>
              
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <span>{language === 'ta' ? 'தேர்வு செய்' : 'Select Junior Track'}</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card 2: Seniors (9-12) */}
          <button 
            onClick={() => onSelect('9-12')}
            className="group relative bg-white dark:bg-[#1A1F2E] rounded-3xl p-8 border-2 border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 text-left transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-orange-50 dark:from-indigo-500/5 dark:to-orange-500/5 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Class 9 - 12
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                {language === 'ta' ? 'மேம்பட்ட கோடிங் மற்றும் தொழில் திறன்கள்.' : 'Advanced Coding, Web Design, Python & Career Skills.'}
              </p>
              
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <span>{language === 'ta' ? 'தேர்வு செய்' : 'Select Senior Track'}</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
