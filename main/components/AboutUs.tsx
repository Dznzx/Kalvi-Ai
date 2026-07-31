import React from 'react';
import { Language, View, Role } from '../types';
import { TRANSLATIONS } from '../constants';
import { KalviLogo } from './KalviLogo';
import { Footer } from './Footer';
import { Quote, Sparkles, Target, Users, Lightbulb, TrendingUp, MapPin, BookOpen, ChevronRight, Award } from 'lucide-react';
import { getOptimizedUrl } from '../utils/imageUtils';

interface AboutUsProps {
  language: Language;
  setView: (view: View) => void;
  openLegal: (page: 'privacy' | 'terms') => void;
  handleLoginClick: (role: Role) => void;
  setOnboardingFormOpen: (open: boolean) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ 
  language, 
  setView, 
  openLegal, 
  handleLoginClick, 
  setOnboardingFormOpen 
}) => {
  const t = TRANSLATIONS[language];
  
  const team = [
    {
      name: "Daksh Jain",
      role: "Founder & Chief Technology Officer",
      img: "https://aotawhotdtluhpalqavu.supabase.co/storage/v1/object/public/images%20about%20us/DakshJain.JPG",
      scale: "scale-[1.3]",
      pos: "object-top"
    },
    {
      name: "Rishi R",
      role: "Co-Founder & Chief Product Officer",
      img: "https://aotawhotdtluhpalqavu.supabase.co/storage/v1/object/public/images%20about%20us/136776-1.JPG",
      scale: "scale-[1.1]",
      pos: "object-top"
    },
    {
      name: "Wealth VS",
      role: "Chief Operating Officer",
      img: "https://aotawhotdtluhpalqavu.supabase.co/storage/v1/object/public/images%20about%20us/Wealth.png",
      scale: "scale-[1.4]",
      pos: "object-top"
    },
    {
      name: "Hitendra Singh",
      role: "Chief Growth Officer",
      img: "https://aotawhotdtluhpalqavu.supabase.co/storage/v1/object/public/images%20about%20us/Hitensingh.jpg",
      scale: "scale-[1.4]",
      pos: "object-top"
    }
  ];
  
  return (
    <div className="bg-white dark:bg-[#0B0F19] font-sans animate-fade-in transition-colors duration-300 w-full overflow-x-hidden">
      
      {/* 1. HERO SECTION (The Manifesto) */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-white/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>Our Manifesto</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 dark:text-white leading-[1.15] mb-6">
              AI for Everyone.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600 dark:from-orange-400 dark:to-indigo-400">In Our Language.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
              Kalvi.AI is a Tamil Nadu based education platform built on a simple belief: 
              <span className="font-semibold text-slate-900 dark:text-white"> Every student deserves world-class AI learning.</span>
            </p>

            <div className="flex justify-center md:justify-start gap-4">
               <button 
                onClick={() => handleLoginClick(Role.STUDENT)}
                className="bg-gradient-to-r from-orange-600 to-indigo-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-1 transition-all flex items-center gap-2"
               >
                 Join the Mission <ChevronRight size={18} />
               </button>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0">
             <div className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-orange-200 dark:bg-orange-500/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 -translate-y-10 translate-x-10 animate-blob"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-indigo-200 dark:bg-indigo-500/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 translate-y-10 -translate-x-10 animate-blob animation-delay-2000"></div>
             
             <div className="relative bg-slate-100 dark:bg-[#1A1F2E] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 aspect-[4/3] group mx-auto max-w-md md:max-w-none">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img 
                        src={getOptimizedUrl("https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", 800, 70)}
                        loading="lazy"
                        alt="Students learning in a classroom" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE CORE MISSION */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="p-8 md:p-10 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:shadow-xl dark:hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-white/10 rounded-2xl shadow-sm flex items-center justify-center text-red-500 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                      <Target size={28} className="md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">The Challenge</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
                      In a world where AI is reshaping industries, many learners struggle with complex tools and English-heavy content. The barrier isn't intelligence—it's access and language.
                  </p>
              </div>

              <div className="p-8 md:p-10 rounded-[2rem] bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 hover:shadow-xl dark:hover:bg-orange-500/10 transition-all duration-300 group">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-white/10 rounded-2xl shadow-sm flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                      <Lightbulb size={28} className="md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">The Solution</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
                      We teach real AI skills—coding, automation, digital creativity—<span className="font-bold text-orange-700 dark:text-orange-400">in Tamil</span>, making technology accessible for everyone. We turn language from a barrier into a bridge.
                  </p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. OUR VISION */}
      <section className="py-16 md:py-24 bg-orange-50/50 dark:bg-white/5 border-y border-orange-100 dark:border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-6">
                  The Future of Tamil Nadu
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 leading-relaxed mb-12 md:mb-16">
                  We aim to shape the next generation of innovators. We are not just teaching AI; we are building the foundation for a future where Tamil Nadu leads India in AI adoption.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-orange-200 dark:md:divide-white/10">
                  <div className="p-4">
                      <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-2">38</div>
                      <div className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <MapPin size={14} /> Districts Covered
                      </div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-2">100%</div>
                      <div className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <BookOpen size={14} /> Tamil Content
                      </div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-2">Ready</div>
                      <div className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <TrendingUp size={14} /> Future Curriculum
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. LEADERSHIP TEAM (Optimized & Professional) */}
      <section className="py-20 md:py-32 bg-white dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Award size={14} />
                <span>Our Leadership</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 dark:text-white mb-20">
                  Leadership Team
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                  {team.map((member, idx) => (
                    <div key={idx} className="group relative">
                        {/* Profile Image Container */}
                        <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-indigo-600 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-xl group-hover:shadow-2xl transition-all duration-500 z-10">
                                <img 
                                    src={getOptimizedUrl(member.img, 400, 80)} 
                                    loading="lazy"
                                    alt={member.name}
                                    className={`w-full h-full object-cover ${member.pos} ${member.scale} transition-transform duration-700 group-hover:scale-[1.5]`}
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center text-orange-600 z-20 border border-slate-100 dark:border-white/10 transform rotate-12 group-hover:rotate-0 transition-transform">
                                <TrendingUp size={20} />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                                {member.name}
                            </h4>
                            <p className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                                {member.role}
                            </p>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="py-20 md:py-24 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#EA580C 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              <KalviLogo className="h-10 md:h-12 mx-auto mb-8" color="white" showText={false} />
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-8 leading-tight">
                  Kalvi.AI is more than a platform.<br />
                  <span className="text-orange-400">It is a movement.</span>
              </h2>
              
              <button 
                onClick={() => handleLoginClick(Role.STUDENT)}
                className="bg-orange-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-orange-900/50 hover:bg-orange-500 hover:scale-105 transition-all"
              >
                  Join Our Mission
              </button>
          </div>
      </section>

      {/* 6. PROFESSIONAL FOOTER */}
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

export default AboutUs;