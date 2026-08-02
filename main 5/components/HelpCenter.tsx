
import React, { useState } from 'react';
import { Language, View, Role } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, ChevronDown, HelpCircle, MessageCircle, Laptop, Shield } from 'lucide-react';
import { EmptyState } from './common/EmptyState';
import { Footer } from './Footer';

interface HelpCenterProps {
  language: Language;
  setView: (view: View) => void;
  handleLoginClick: (role: Role) => void;
  setOnboardingFormOpen: (open: boolean) => void;
  openLegal: (page: 'privacy' | 'terms') => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ 
    language,
    setView,
    handleLoginClick,
    setOnboardingFormOpen,
    openLegal
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqs = t.faqs || [];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouping logic (Simulated for MVP based on index)
  const groupedFaqs = {
      [t.faqCategories?.general || 'General']: filteredFaqs.filter((_, i) => i % 2 === 0),
      [t.faqCategories?.students || 'Usage']: filteredFaqs.filter((_, i) => i % 2 !== 0),
  };

  const toggleAccordion = (id: string) => {
      setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-28 md:pt-36 animate-fade-in font-sans">
        {/* 1. & 2. Hero Section Refinements */}
        <div className="text-center mb-10 md:mb-14">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 dark:bg-white/10 text-kalvi-terracotta rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm transition-transform hover:rotate-0">
            <HelpCircle size={32} className="md:w-9 md:h-9" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-semibold text-gray-900 dark:text-white mb-3">
            {t.helpTitle}
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto px-4">
            {t.helpSubtitle}
            </p>
        </div>

        {/* 3. Search Bar Refinement */}
        <div className="max-w-xl mx-auto mb-12 md:mb-16 relative group px-2 sm:px-0">
            <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors pointer-events-none" size={20} />
            <input 
                type="text" 
                placeholder={language === 'ta' ? "தேடுக..." : "Search questions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 sm:pl-14 pr-6 py-3.5 md:py-4 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm focus:ring-4 focus:ring-kalvi-terracotta/10 focus:border-kalvi-terracotta outline-none transition text-gray-800 dark:text-white placeholder-gray-400 text-sm md:text-base"
            />
        </div>

        {/* 4. & 5. Categorized FAQ Layout */}
        {filteredFaqs.length > 0 ? (
            <div className="space-y-8 md:space-y-10">
                {Object.entries(groupedFaqs).map(([category, items], catIdx) => (
                    items.length > 0 && (
                        <div key={category}>
                            <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-4 flex items-center gap-2 text-base md:text-lg mt-6 px-1">
                                {catIdx === 0 ? <Shield size={18} /> : <Laptop size={18} />}
                                {category}
                            </h3>
                            <div className="space-y-3 md:space-y-4">
                                {items.map((faq, index) => {
                                    const uniqueId = `${category}-${index}`;
                                    const isOpen = openIndex === uniqueId;
                                    return (
                                        <div 
                                            key={uniqueId} 
                                            className={`bg-white dark:bg-white/5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 ${isOpen ? 'ring-1 ring-kalvi-terracotta/10 border-kalvi-terracotta/20' : ''}`}
                                        >
                                            <button 
                                                onClick={() => toggleAccordion(uniqueId)}
                                                className="w-full flex justify-between items-start md:items-center p-5 md:p-6 text-left"
                                            >
                                                <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base pr-4">{faq.q}</span>
                                                <ChevronDown 
                                                    className={`text-kalvi-terracotta flex-shrink-0 transition-transform duration-300 mt-0.5 md:mt-0 ${isOpen ? 'rotate-180' : ''}`} 
                                                    size={20}
                                                />
                                            </button>
                                            
                                            <div 
                                                className={`px-5 md:px-6 text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                                                    {faq.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}
            </div>
        ) : (
            <div className="py-8">
                <EmptyState 
                    title="No results found" 
                    description="Try adjusting your search terms or contact support." 
                    icon={<Search size={32} />} 
                />
            </div>
        )}

        {/* 9. Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-10 md:my-14"></div>

        {/* 6. & 7. Support Section Refinement */}
        <div 
            className="rounded-2xl p-8 md:p-12 text-center text-white shadow-[0_8px_24px_rgba(107,86,67,0.15)] relative overflow-hidden mt-8 md:mt-12 mb-20"
            style={{ background: 'linear-gradient(135deg, #C6563B 0%, #6B5643 100%)' }}
        >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

            <MessageCircle className="w-10 h-10 mx-auto mb-4 text-white/90" />
            
            <p className="text-white font-semibold text-xl md:text-2xl mb-2">
                {language === 'ta' ? "இன்னும் கேள்விகள் உள்ளதா?" : "Still have questions?"}
            </p>
            
            <p className="text-white/80 mb-6 max-w-lg mx-auto font-medium text-sm md:text-base">
                {language === 'ta' 
                ? "எங்கள் ஆதரவு குழுவுடன் நேரடியாக பேசுங்கள்." 
                : "Chat directly with our team or send us an email."}
            </p>
            
            <button className="bg-white text-[#C6563B] px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-[#F9F6F0] transition shadow-lg active:scale-95 transform duration-200 text-sm md:text-base">
                {t.contact} Support
            </button>
        </div>
        </div>

        {/* FOOTER */}
        <Footer 
            language={language} 
            setView={setView} 
            handleLoginClick={handleLoginClick} 
            setOnboardingFormOpen={setOnboardingFormOpen} 
            openLegal={openLegal} 
        />
    </div>
  );
};

export default HelpCenter;
