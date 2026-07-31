
import React from 'react';
import { Role, View, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BharatStackLogo } from './BharatStackLogo';

interface FooterProps {
  language: Language;
  setView: (view: View) => void;
  handleLoginClick: (role: Role) => void;
  setOnboardingFormOpen: (open: boolean) => void;
  openLegal: (page: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  setView,
  handleLoginClick,
  setOnboardingFormOpen,
  openLegal
}) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-gray-50 dark:bg-[#05080F] pt-20 pb-12 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Logo aligned to left */}
          <div className="md:col-span-5 flex flex-col items-start text-left">
            <div className="text-gray-900 dark:text-white mb-6">
                <BharatStackLogo className="h-10" showText={true} />
            </div>
            <p className="leading-relaxed mb-8 max-w-sm text-gray-500 dark:text-gray-400 text-left">
              {t.footerMission}
            </p>
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'facebook', 'instagram'].map(platform => (
                <div key={platform} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all cursor-pointer text-gray-400 dark:text-gray-500">
                    <span className="sr-only">{platform}</span>
                    <div className="w-4 h-4 bg-current rounded-sm"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 text-left">
            <h5 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-widest">{t.quickLinks}</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => setView(View.ABOUT)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.aboutUs}</button></li>
              <li><button onClick={() => setView(View.HELP)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.helpCenter}</button></li>
              <li><button onClick={() => handleLoginClick(Role.STUDENT)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.studentLogin}</button></li>
              <li><button onClick={() => setOnboardingFormOpen(true)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.forSchools}</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 text-left">
            <h5 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-widest">{t.legal}</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => openLegal('privacy')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.privacyPolicy}</button></li>
              <li><button onClick={() => openLegal('terms')} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{t.termsOfService}</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 text-left">
            <h5 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-widest">{t.connect}</h5>
            <p className="text-sm font-medium mb-4 text-gray-500 dark:text-gray-400">Chennai, Tamil Nadu, India</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-500 mb-2">support@bharatStack.ai</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Mon - Sat: 9:00 AM - 6:00 PM</p>
          </div>

        </div>

        <div className="h-px bg-gray-200 dark:bg-white/5 mb-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-gray-500 dark:text-gray-600 tracking-wider uppercase">
            <p>© 2025 Bharat Stack. {t.footerRights}</p>
            <div className="flex items-center gap-2">
                {t.footerMadeWith}
            </div>
        </div>
      </div>
    </footer>
  );
};
