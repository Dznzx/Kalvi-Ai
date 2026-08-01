
import React, { useState } from 'react';
import { Globe, Menu, X, ChevronRight, Moon, Sun, Layout, LogOut, LogIn } from 'lucide-react';
import { Role, View, Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { KalviLogo } from './KalviLogo';

interface NavbarProps {
  currentUser: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  view: View;
  setView: (view: View) => void;
  t: any;
  handleLoginClick: () => void;
  handleLogout: () => void;
  setOnboardingFormOpen: (open: boolean) => void;
  setCurrentLegalPage: (page: 'privacy' | 'terms' | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  language,
  setLanguage,
  view,
  setView,
  t,
  handleLoginClick,
  handleLogout,
  setOnboardingFormOpen,
  setCurrentLegalPage,
  theme,
  toggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    if (currentUser) {
      if (currentUser.role === Role.STUDENT || currentUser.role === Role.SCHOOL_ADMIN) setView(View.STUDENT_DASHBOARD);
      else if (currentUser.role === Role.SUPER_ADMIN) setView(View.ADMIN_DASHBOARD);
    } else {
      setView(View.LANDING);
    }
    setCurrentLegalPage(null);
    setMobileMenuOpen(false);
  };

  const NavLink = ({ target, label, isActive }: { target: View, label: string, isActive: boolean }) => (
    <button 
        onClick={() => { setView(target); setCurrentLegalPage(null); setMobileMenuOpen(false); }}
        className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 whitespace-nowrap rounded-lg ${
            isActive 
            ? 'text-kalvi-terracotta bg-orange-50 dark:bg-orange-500/10' 
            : 'text-gray-600 dark:text-gray-300 hover:text-kalvi-terracotta hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
    >
        {label}
    </button>
  );

  return (
    <>
      <nav className="fixed w-full z-50 bg-white/95 dark:bg-[#05080F]/95 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 transition-all duration-300 h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          {/* Main Flex Container */}
          <div className="flex items-center justify-between h-full">
            
            {/* LEFT SECTION: Logo + Navigation */}
            <div className="flex items-center gap-8 lg:gap-12">
                {/* Logo */}
                <div 
                  className="flex-shrink-0 flex items-center cursor-pointer text-gray-900 dark:text-white hover:opacity-90 transition-opacity" 
                  onClick={handleLogoClick}
                >
                   <KalviLogo className="h-10 md:h-12" showText={true} tagline={false} />
                </div>

                {/* Desktop Navigation - Placed next to logo for proper layout */}
                <div className="hidden md:flex items-center gap-1">
                    {!currentUser ? (
                        <>
                            <NavLink target={View.LANDING} label={language === 'ta' ? 'முகப்பு' : 'Home'} isActive={view === View.LANDING} />
                            <NavLink target={View.ABOUT} label={t.aboutUs} isActive={view === View.ABOUT} />
                            <NavLink target={View.HELP} label={t.helpCenter} isActive={view === View.HELP} />
                        </>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/5">
                            <Layout size={16} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-white">
                                {currentUser.role === Role.STUDENT ? t.dashboard : 'Portal'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* RIGHT SECTION: Actions */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              
              {/* Unified Utilities Pill (Theme & Language) */}
              <div className="flex items-center p-1 rounded-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-yellow-400 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all"
                    title="Toggle Theme"
                  >
                      {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  </button>

                  <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-1"></div>

                  {/* Language Toggle */}
                  <button 
                      onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} 
                      className="flex items-center gap-1.5 px-3 h-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm hover:text-kalvi-terracotta transition-all text-xs font-bold uppercase tracking-wider"
                  >
                     <Globe size={14} /> 
                     <span>{language === 'en' ? 'தமிழ்' : 'Eng'}</span>
                  </button>
              </div>

              {!currentUser ? (
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={handleLoginClick}
                          className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-kalvi-terracotta transition-colors flex items-center gap-1 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                      >
                          {t.login}
                      </button>

                      <button onClick={() => setOnboardingFormOpen(true)} className="bg-kalvi-terracotta text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-orange-900/10 hover:bg-[#C2410C] hover:shadow-orange-900/20 transition-all active:scale-95 whitespace-nowrap">
                          {t.register}
                      </button>
                  </div>
              ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-sm font-bold text-gray-800 dark:text-white leading-none max-w-[100px] truncate">{currentUser.name}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{currentUser.role.replace('_', ' ')}</span>
                    </div>
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-kalvi-terracotta text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                          {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title={t.logout}>
                        <LogOut size={20} />
                    </button>
                  </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
               {/* Language Toggle for Mobile Header */}
               <button 
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white bg-gray-50 dark:bg-white/5 text-xs font-bold shadow-sm active:scale-95 transition-all"
               >
                  <Globe size={14} className="text-kalvi-terracotta" />
                  {language === 'en' ? 'தமிழ்' : 'Eng'}
               </button>
               <button onClick={() => setMobileMenuOpen(true)} className="text-gray-800 dark:text-white p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <Menu size={24} />
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side-Sliding Mobile Menu */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[300px] bg-white dark:bg-[#1A1F2E] shadow-2xl transition-transform duration-300 ease-out transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <div className="text-gray-900 dark:text-white"><KalviLogo className="h-10" showText={false} /></div>
            
            <div className="flex items-center gap-3">
                {/* Theme Toggle in Mobile Menu */}
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/5"
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 dark:text-gray-400">
                    <X size={24} />
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-2">
             {!currentUser ? (
               <>
                  <button onClick={() => { setView(View.LANDING); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left font-bold text-gray-800 dark:text-white p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    Home
                  </button>
                  <button onClick={() => { setView(View.ABOUT); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left font-bold text-gray-800 dark:text-white p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    {t.aboutUs}
                  </button>
                  <button onClick={() => { setView(View.HELP); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left font-bold text-gray-800 dark:text-white p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    {t.helpCenter}
                  </button>
                  
                  <div className="my-4 border-t border-gray-100 dark:border-white/5"></div>
                  
                  <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Member Access</p>
                  
                  <button onClick={() => { handleLoginClick(); setMobileMenuOpen(false); }} className="w-full text-left font-medium p-3 hover:bg-orange-50 dark:hover:bg-white/5 rounded-xl text-gray-700 dark:text-gray-300 flex justify-between items-center group">
                      {t.login} <LogIn size={16} className="text-gray-300 group-hover:text-kalvi-terracotta"/>
                  </button>
               </>
             ) : (
               <>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl mb-4 flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-kalvi-terracotta text-white flex items-center justify-center font-bold">
                          {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{currentUser.role}</p>
                    </div>
                  </div>
                  <button onClick={() => { setView(currentUser.role === Role.SUPER_ADMIN ? View.ADMIN_DASHBOARD : View.STUDENT_DASHBOARD); setMobileMenuOpen(false); }} className="w-full text-left font-bold p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-800 dark:text-white flex items-center gap-2">
                      <Layout size={18} /> {t.dashboard}
                  </button>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left text-red-500 font-bold p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-2">
                      <LogOut size={18} /> {t.logout}
                  </button>
               </>
             )}
          </div>

          {!currentUser && (
            <div className="p-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => { setOnboardingFormOpen(true); setMobileMenuOpen(false); }} 
                className="w-full bg-kalvi-terracotta text-white text-center py-3.5 rounded-xl font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-all"
              >
                {t.register}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
