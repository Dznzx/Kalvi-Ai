
import { ChevronRight, GraduationCap, BrainCircuit, Rocket, Code, Laptop, CheckCircle2, MapPin, Users, BookOpen, TrendingUp, Cpu, Trophy, Sparkles, Zap, Smartphone, ArrowRight, Play, Terminal, Database, Binary, Hash, Command, GitBranch, Calendar, Flag } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language, Role, View } from '../types';
import { BharatStackLogo } from './BharatStackLogo';
import { Footer } from './Footer';

interface RollingNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const RollingNumber: React.FC<RollingNumberProps> = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, isVisible]);

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
};

// Component for falling coding icons
const BackgroundIcons = () => {
    const icons = [
        { Icon: Code, left: '10%', duration: '15s', delay: '0s', size: 32 },
        { Icon: Terminal, left: '25%', duration: '18s', delay: '5s', size: 28 },
        { Icon: Binary, left: '40%', duration: '20s', delay: '2s', size: 24 },
        { Icon: Database, left: '60%', duration: '17s', delay: '8s', size: 36 },
        { Icon: Cpu, left: '75%', duration: '19s', delay: '1s', size: 30 },
        { Icon: Hash, left: '90%', duration: '16s', delay: '6s', size: 28 },
        { Icon: GitBranch, left: '5%', duration: '22s', delay: '10s', size: 34 },
        { Icon: Command, left: '85%', duration: '21s', delay: '4s', size: 26 },
        { Icon: BrainCircuit, left: '50%', duration: '25s', delay: '12s', size: 40 },
        { Icon: Laptop, left: '15%', duration: '28s', delay: '7s', size: 32 },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <style>
                {`
                @keyframes fall-vertical {
                    0% { transform: translateY(-100px); opacity: 0; }
                    10% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(1000px); opacity: 0; }
                }
                .animate-fall-vertical {
                    animation: fall-vertical linear infinite;
                }
                `}
            </style>
            {icons.map((item, i) => (
                <div 
                    key={i}
                    className="absolute top-0 text-gray-300 dark:text-gray-700 animate-fall-vertical"
                    style={{
                        left: item.left,
                        animationDuration: item.duration,
                        animationDelay: item.delay,
                    }}
                >
                    <item.Icon 
                        size={item.size} 
                        className="opacity-40 dark:opacity-20 text-current" 
                    />
                </div>
            ))}
        </div>
    );
};

interface LandingPageProps {
  language: Language;
  t: any;
  handleLoginClick: (role: Role) => void;
  setOnboardingFormOpen: (open: boolean) => void;
  openLegal: (page: 'privacy' | 'terms') => void;
  setView: (view: View) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  t,
  handleLoginClick,
  setOnboardingFormOpen,
  openLegal,
  setView
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] font-sans text-gray-900 dark:text-white overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100 transition-colors duration-300">
        
        {/* --- HERO SECTION --- */}
        {/* Adjusted padding for better mobile balance: pt-36 on mobile, pt-64 on desktop */}
        <div className="relative pt-36 pb-20 lg:pt-64 lg:pb-32 overflow-hidden">
            
            {/* Spotlight Glow Effects (Dark Mode Only) */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden dark:block" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen hidden dark:block" />
            
            {/* Light Mode Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50 dark:hidden" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 dark:hidden" />

            {/* Subtle Grid Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

            {/* Falling Icons Background */}
            <BackgroundIcons />

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                
                {/* Text Content */}
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md cursor-default animate-fade-in-up hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-orange-200 tracking-wide uppercase">
                            {language === 'ta' ? 'தமிழகத்திற்கான AI' : 'AI for Tamil Nadu'}
                        </span>
                    </div>
                    
                    {/* Responsive H1: text-4xl on mobile for Tamil readability, larger on desktop. 
                        Adjusted leading (line-height) to preventing clipping of Tamil letters. */}
                    <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-heading font-bold text-gray-900 dark:text-white mb-6 animate-fade-in-up ${language === 'ta' ? 'leading-snug' : 'leading-[1.1]'}`} style={{ animationDelay: '0.1s' }}>
                        {language === 'ta' ? 'தமிழக மாணவர்களின்' : 'Tech Skills for'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 dark:from-orange-400 dark:via-amber-300 dark:to-orange-500 drop-shadow-sm">
                            {language === 'ta' ? 'எதிர்காலத் திறன்கள்' : "Tamil Nadu's Future."}
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up font-medium" style={{ animationDelay: '0.2s' }}>
                        {language === 'ta' 
                            ? 'சென்னை முதல் கன்னியாகுமரி வரை - AI, டிசைன் மற்றும் கோடிங் ஆகியவற்றை தமிழில் கற்றுக்கொள்ளுங்கள்.'
                            : 'From Chennai to Kanyakumari – Learn AI, Design, and Coding in Tamil.'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        {/* Primary Button: Solid Orange Gradient */}
                        <button 
                            onClick={() => handleLoginClick(Role.STUDENT)} 
                            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2 group border border-orange-500/20"
                        >
                           {t.getStarted} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        {/* Secondary Button */}
                        <button 
                            onClick={() => setOnboardingFormOpen(true)} 
                            className="bg-white dark:bg-white/5 text-gray-700 dark:text-white px-8 py-4 rounded-full font-bold text-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm dark:shadow-none"
                        >
                            <SchoolIcon size={20} className="text-orange-500 dark:text-orange-400" />
                            {t.forSchools}
                        </button>
                    </div>

                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-5 py-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                Admissions Open <span className="text-gray-400 font-medium ml-1">| Join the Revolution</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Content - Floating Cards (Optimized for Mobile) */}
                <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center animate-fade-in mt-8 lg:mt-0" style={{ animationDelay: '0.3s' }}>
                    
                    {/* Background Glow Circle */}
                    <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[60px] animate-pulse dark:opacity-100 opacity-50" />

                    {/* Central Glass Card */}
                    <div className="relative z-10 bg-white dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-white/10 max-w-[280px] sm:max-w-xs w-full text-center animate-float shadow-2xl dark:shadow-black/50 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />
                        
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-900/10 dark:from-orange-500/20 dark:to-orange-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-orange-500 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)]">
                            <BrainCircuit size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">AI Course</h3>
                        <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full mb-4 overflow-hidden relative z-10">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-3/4 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider relative z-10">
                            <span>Progress</span>
                            <span className="text-gray-900 dark:text-white">75%</span>
                        </div>
                    </div>

                    {/* Floating Badge 1: Design - Repositioned for mobile safely */}
                    <div className="absolute top-0 right-4 lg:top-10 lg:right-20 bg-white dark:bg-white/5 backdrop-blur-lg p-3 lg:p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 animate-float-delayed shadow-xl scale-90 lg:scale-100 origin-top-right">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                            <Sparkles size={20} />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm lg:text-base">Design</span>
                    </div>

                    {/* Floating Badge 2: Coding - Repositioned for mobile safely */}
                    <div className="absolute bottom-10 left-0 lg:bottom-20 lg:left-10 bg-white dark:bg-white/5 backdrop-blur-lg p-3 lg:p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 animate-float-slow shadow-xl scale-90 lg:scale-100 origin-bottom-left">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                            <Code size={20} />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm lg:text-base">Coding</span>
                    </div>

                    {/* Floating Badge 3: Mobile - Repositioned for mobile safely */}
                    <div className="absolute top-1/2 left-0 lg:-left-4 bg-white dark:bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-gray-100 dark:border-white/10 flex flex-col items-center gap-1 animate-float transform -translate-y-1/2 shadow-xl scale-90 lg:scale-100 hidden sm:flex">
                        <div className="p-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg">
                            <Smartphone size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Mobile</span>
                    </div>

                </div>
            </div>
        </div>

        {/* --- FEATURES GRID (Glass Cards) --- */}
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">Why Bharat Stack?</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Built for the aspirations of every student in Tamil Nadu.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: <BrainCircuit size={32} />, title: t.aiToolsTitle, desc: t.aiToolsDesc, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" },
                  { icon: <Code size={32} />, title: t.nativeLangTitle, desc: t.nativeLangDesc, color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" },
                  { icon: <Laptop size={32} />, title: t.projectsTitle, desc: t.projectsDesc, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" }
                ].map((feature, i) => (
                  <div key={i} className="p-8 bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-3xl hover:shadow-xl dark:hover:bg-white/10 transition-all duration-300 group shadow-sm">
                      <div className={`w-16 h-16 ${feature.color} border rounded-2xl flex items-center justify-center mb-6`}>
                          {feature.icon}
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-3 text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                ))}
            </div>
        </div>

        {/* --- HOW IT WORKS SECTION (Optimized for Mobile/Laptop Overflow) --- */}
        <div className="py-24 relative border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0B0F19]/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-4">Simple Process</div>
                        <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6">{t.howItWorksTitle}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t.howItWorksSub}</p>
                        
                        <div className="space-y-8">
                            {[
                                { step: "01", title: t.step1Head, sub: t.step1Sub },
                                { step: "02", title: t.step2Head, sub: t.step2Sub },
                                { step: "03", title: t.step3Head, sub: t.step3Sub }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center justify-center font-heading font-bold text-gray-400 dark:text-gray-500 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors bg-white dark:bg-white/5 group-hover:bg-orange-50 dark:group-hover:bg-white/10">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-400">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center max-w-full">
                        {/* Abstract Glows */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-indigo-500/10 rounded-[3rem] transform rotate-3 scale-105 blur-3xl dark:opacity-100 opacity-50 pointer-events-none"></div>
                        
                        {/* Main App Interface Container - Constrained width for safety */}
                        <div className="relative w-full max-w-[350px] md:max-w-md bg-white dark:bg-[#0F172A] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col transform scale-95 md:scale-100 origin-center">
                            {/* Window Controls */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 bg-gray-50 dark:bg-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                <div className="ml-auto w-32 h-2 rounded-full bg-gray-200 dark:bg-white/10"></div>
                            </div>

                            {/* App Content */}
                            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                                {/* Hero Lesson Card */}
                                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-900/50 dark:to-slate-900 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/30 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                        <BrainCircuit size={48} className="text-indigo-900 dark:text-white" />
                                    </div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                            <Play className="fill-current" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Current Lesson</div>
                                            <div className="text-gray-900 dark:text-white font-bold text-lg leading-tight">Neural Networks <br/>in Tamil</div>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full w-2/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                    </div>
                                </div>

                                {/* AI Chat Interaction Bubble */}
                                <div className="flex flex-col gap-3">
                                    <div className="self-end bg-orange-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-medium shadow-lg max-w-[85%]">
                                        AI என்றால் என்ன? (What is AI?)
                                    </div>
                                    <div className="self-start bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl rounded-tl-none text-sm border border-gray-200 dark:border-white/5 max-w-[90%]">
                                        <p className="mb-2">செயற்கை நுண்ணறிவு (AI) என்பது மனிதர்களைப் போல சிந்திக்கவும் செயல்படவும் கூடிய கணினி அமைப்புகளாகும்...</p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">Translation</span>
                                            <span className="text-[10px] bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">Simplify</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Stats Row */}
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-bold text-sm">Quiz</div>
                                            <div className="text-xs text-gray-500">Passed</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg">
                                            <Trophy size={16} />
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-bold text-sm">Streak</div>
                                            <div className="text-xs text-gray-500">5 Days</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating "Live" Badge */}
                            <div className="absolute top-20 -right-4 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20 p-3 rounded-xl shadow-xl animate-float-delayed flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0"></div>
                                    <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                                </div>
                                <div className="text-xs font-bold text-gray-900 dark:text-white">
                                    Live Tutor
                                    <span className="block text-[9px] text-gray-500 dark:text-gray-400 font-normal">Online now</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- IMPACT STATS SECTION (REPLACED WITH VISION) --- */}
        <div className="py-24 bg-white dark:bg-[#0B0F19]">
             <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                        Our Vision Targets
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Laying the foundation for a future-ready Tamil Nadu.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat 1: Districts */}
                    <div className="p-8 bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 text-center hover:shadow-xl dark:hover:bg-white/10 transition-all group shadow-sm">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin size={24} />
                         </div>
                         <div className="text-4xl lg:text-5xl font-heading font-black mb-2 text-indigo-600 dark:text-indigo-400 drop-shadow-md">
                            38
                         </div>
                         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Districts</p>
                    </div>

                    {/* Stat 2: Mission */}
                    <div className="p-8 bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 text-center hover:shadow-xl dark:hover:bg-white/10 transition-all group shadow-sm">
                         <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Flag size={24} />
                         </div>
                         <div className="text-4xl lg:text-5xl font-heading font-black mb-2 text-orange-600 dark:text-orange-400 drop-shadow-md">
                            1
                         </div>
                         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Mission: AI For All</p>
                    </div>

                    {/* Stat 3: Language */}
                    <div className="p-8 bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 text-center hover:shadow-xl dark:hover:bg-white/10 transition-all group shadow-sm">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={24} />
                         </div>
                         <div className="text-4xl lg:text-5xl font-heading font-black mb-2 text-emerald-600 dark:text-emerald-400 drop-shadow-md">
                            100%
                         </div>
                         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Tamil First</p>
                    </div>

                    {/* Stat 4: 24/7 AI Support */}
                    <div className="p-8 bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 text-center hover:shadow-xl dark:hover:bg-white/10 transition-all group shadow-sm">
                         <div className="w-12 h-12 bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Zap size={24} />
                         </div>
                         <div className="text-4xl lg:text-5xl font-heading font-black mb-2 text-gray-600 dark:text-gray-400 drop-shadow-md">
                            24/7
                         </div>
                         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">AI Support</p>
                    </div>
                </div>

                {/* Large CTA Card */}
                <div className="mt-20 p-10 lg:p-16 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-white/20 dark:border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-orange-900 opacity-90 backdrop-blur-md"></div>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl">
                         <h4 className="text-3xl lg:text-4xl font-heading font-bold mb-4 text-white">
                            {language === 'ta' ? 'இன்றே உங்கள் பயணத்தைத் தொடங்குங்கள்' : 'Join the AI Revolution in Tamil Nadu'}
                         </h4>
                         <p className="text-gray-200 text-lg">{t.footerMission}</p>
                    </div>
                    <button 
                        onClick={() => setOnboardingFormOpen(true)}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] active:scale-95 flex items-center justify-center gap-2 relative z-10 whitespace-nowrap"
                    >
                        {t.register} <ChevronRight size={20} />
                    </button>
                </div>
             </div>
        </div>

        {/* --- PROFESSIONAL FOOTER --- */}
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

const SchoolIcon = ({ size = 24, className = "" }: {size?: number, className?: string}) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" />
        <path d="M4 18h16" />
        <path d="M12 2v20" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M8 18v4" />
        <path d="M16 18v4" />
    </svg>
);
