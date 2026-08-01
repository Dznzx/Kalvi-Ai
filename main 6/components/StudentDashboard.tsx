
import React, { useState, useEffect } from 'react';
import { Module, GradeGroup, Language, LeaderboardEntry, User, QuizQuestion, UserStats, Badge as BadgeType, League } from '../types';
import { TRANSLATIONS } from '../constants';
import { CheckCircle, ChevronRight, Download, WifiOff, FolderOpen, Coins, Share2, Trophy, Loader2, Flame, Zap, Target, Lock, Play, Star, Shield, Home, BookOpen, Edit3, Settings, Menu, X, LogOut, Award, Badge, User as UserIcon, Mail, School, Globe, Save, Edit2, BrainCircuit, Search, Sparkles, Cpu, ShieldAlert, Fingerprint, TrendingUp, Medal, RefreshCw, Layers, Check, GraduationCap, Rocket, Cloud, AlertCircle, Users as UsersRound, Languages, Store, Briefcase, MapPinned } from 'lucide-react';
import { offlineStorage } from '../services/offlineStorage';
import { contentService } from '../services/contentService';
import { gamificationService, BADGES } from '../services/gamificationService';
import { realtimeService } from '../services/realtimeService';
import { generateQuiz } from '../services/geminiService';
import { EmptyState } from './common/EmptyState';
import { OnboardingTour } from './common/OnboardingTour';
import { LMSPlayer } from './LMSPlayer';
import { ScholarshipFinder } from './features/ScholarshipFinder';
import { SkillGapAnalyzer } from './features/SkillGapAnalyzer';
import { MentorMarketplace } from './features/MentorMarketplace';
import { TamilVoiceAssistant } from './features/TamilVoiceAssistant';
import { SkillMarketplace } from './features/SkillMarketplace';
import { InternshipFinder } from './features/InternshipFinder';
import { OpportunityMap } from './features/OpportunityMap';
import { StudentPortfolio } from './features/StudentPortfolio';

interface StudentDashboardProps {
  language: Language;
  onLogout: () => void;
  studentGrade: GradeGroup;
  setStudentGrade: (g: GradeGroup) => void;
  currentUser: User | null;
}

const GENERAL_TOPICS = [
    { id: 'gen-1', title: { en: "AI Basics", ta: "AI அடிப்படைகள்" }, icon: <Sparkles />, color: "bg-blue-500", desc: { en: "History and core concepts of AI", ta: "AI-ன் வரலாறு மற்றும் முக்கிய கருத்துக்கள்" } },
    { id: 'gen-2', title: { en: "Generative AI", ta: "ஜெனரேட்டிவ் AI" }, icon: <BrainCircuit />, color: "bg-purple-500", desc: { en: "How ChatGPT and DALL-E work", ta: "ChatGPT மற்றும் DALL-E எவ்வாறு செயல்படுகின்றன" } },
    { id: 'gen-3', title: { en: "AI Ethics", ta: "AI நெறிமுறைகள்" }, icon: <ShieldAlert />, color: "bg-red-500", desc: { en: "Safety, bias and future impact", ta: "பாதுகாப்பு, சார்பு மற்றும் எதிர்கால தாக்கம்" } },
    { id: 'gen-4', title: { en: "Prompt Engineering", ta: "பிராம்ப்ட் இன்ஜினியரிங்" }, icon: <Fingerprint />, color: "bg-orange-500", desc: { en: "Mastering the art of AI chat", ta: "AI அரட்டையில் தேர்ச்சி பெறுதல்" } },
    { id: 'gen-5', title: { en: "AI in Daily Life", ta: "அன்றாட வாழ்வில் AI" }, icon: <Cpu />, color: "bg-emerald-500", desc: { en: "AI you use every day", ta: "நீங்கள் தினமும் பயன்படுத்தும் AI" } },
];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  language, 
  onLogout,
  studentGrade,
  setStudentGrade,
  currentUser
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'quizzes' | 'certificates' | 'scholarships' | 'skillgap' | 'mentors' | 'tamilassistant' | 'marketplace' | 'internships' | 'map' | 'portfolio' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Gamification State
  const [stats, setStats] = useState<UserStats>(gamificationService.getStats());
  const [showToast, setShowToast] = useState<{msg: string, type: 'coin'|'share'|'badge'|'league'} | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    appLanguage: language,
    videoQuality: 'auto' as 'auto' | '360p' | '720p',
    gradeGroup: studentGrade
  });

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState<{
    isOpen: boolean;
    loading: boolean;
    questions: QuizQuestion[];
    currentQuestion: number;
    score: number;
    completed: boolean;
    selectedOption: number | null;
    showExplanation: boolean;
    moduleTitle: string;
    error: string | null;
  }>({
    isOpen: false,
    loading: false,
    questions: [],
    currentQuestion: 0,
    score: 0,
    completed: false,
    selectedOption: null,
    showExplanation: false,
    moduleTitle: '',
    error: null
  });

  // Derived Values
  const currentRank = gamificationService.calculateRank(stats.xp);
  const xpProgress = (stats.xp % 500) / 500 * 100;
  const moduleProgress = Math.round((completedModules.length / (modules.length || 1)) * 100);

  // currentLevelModule calculation
  const currentLevelModule = modules.find(m => !completedModules.includes(m.id)) || modules[0];

  useEffect(() => {
    const initPortal = async () => {
        setIsSyncing(true);
        setLoadingModules(true);
        
        // 1. Fetch Modules for this Grade
        const data = await contentService.getModules(studentGrade);
        setModules(data);

        // 2. Fetch User Stats and Progress from Supabase if logged in
        if (currentUser) {
            // Pull cloud XP/Coins
            const cloudStats = await gamificationService.syncFromSupabase(currentUser.id);
            setStats(cloudStats);
            
            // Pull cloud Module Completion
            const cloudProgress = await contentService.getStudentProgress(currentUser.id);
            setCompletedModules(cloudProgress);
            
            // Merge with local just in case
            const localProgress = offlineStorage.getCompletedModules();
            const mergedProgress = Array.from(new Set([...cloudProgress, ...localProgress]));
            setCompletedModules(mergedProgress);
        }

        setLoadingModules(false);
        setIsSyncing(false);
    };
    
    initPortal();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleStatsUpdate = (e: any) => setStats({ ...e.detail });
    const handleBadgeUnlocked = (e: any) => {
        setShowToast({ msg: `Unlocked: ${e.detail.name[language]}`, type: 'badge' });
        setTimeout(() => setShowToast(null), 4000);
    };

    window.addEventListener('gamification-update', handleStatsUpdate as any);
    window.addEventListener('badge-unlocked', handleBadgeUnlocked as any);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('gamification-update', handleStatsUpdate as any);
      window.removeEventListener('badge-unlocked', handleBadgeUnlocked as any);
    };
  }, [studentGrade, language, currentUser?.id]); 

  const handleModuleClick = (m: Module, isLocked: boolean) => {
    if (isLocked) return;
    setActiveModule(m);
  };

  const handleModuleComplete = async () => {
    if (!activeModule) return;
    
    // Optimistic UI Update
    const newProgress = Array.from(new Set([...completedModules, activeModule.id]));
    setCompletedModules(newProgress);
    offlineStorage.saveCompletedModule(activeModule.id);

    // Sync with DB
    if (currentUser) {
        setIsSyncing(true);
        await contentService.markModuleComplete(currentUser.id, activeModule.id);
        await gamificationService.awardXpAndCoins(100, 50, 'Mission Accomplished', currentUser.id);
        setIsSyncing(false);
    } else {
        gamificationService.awardXpAndCoins(100, 50, 'Mission Accomplished');
    }
  };

  const handleSaveSettings = () => {
    setStudentGrade(settingsForm.gradeGroup);
    setShowToast({ msg: "Settings saved successfully", type: 'coin' });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleStartQuiz = async (title: string) => {
    if (!isOnline) {
        setShowToast({ msg: t.youAreOffline, type: 'share' });
        return;
    }
    
    // Reset state for new attempt
    setQuizMode({
        isOpen: true, 
        loading: true, 
        questions: [], 
        currentQuestion: 0,
        score: 0, 
        completed: false, 
        selectedOption: null, 
        showExplanation: false, 
        moduleTitle: title, 
        error: null
    });

    try {
        const questions = await generateQuiz(title, language === 'ta');
        if (!questions || questions.length === 0) {
            throw new Error("The AI tutor is currently busy. Please try generating the quiz again.");
        }
        setQuizMode(prev => ({ ...prev, loading: false, questions }));
    } catch (e: any) {
        setQuizMode(prev => ({ ...prev, loading: false, error: e.message || "AI failed to generate questions. Please try again later." }));
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
      if (quizMode.selectedOption !== null || !quizMode.questions[quizMode.currentQuestion]) return;
      const isCorrect = optionIndex === quizMode.questions[quizMode.currentQuestion].correctAnswerIndex;
      setQuizMode(prev => ({
          ...prev, selectedOption: optionIndex, showExplanation: true,
          score: isCorrect ? prev.score + 1 : prev.score
      }));
      if (isCorrect) gamificationService.awardXpAndCoins(20, 10, 'Correct Answer', currentUser?.id);
  };

  const handleNextQuestion = () => {
      if (quizMode.currentQuestion < quizMode.questions.length - 1) {
          setQuizMode(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1, selectedOption: null, showExplanation: false }));
      } else {
          setQuizMode(prev => ({ ...prev, completed: true }));
          if (quizMode.score === quizMode.questions.length) gamificationService.unlockBadge('b3', currentUser?.id);
      }
  };

  const getLeagueColor = (league: League) => {
      switch(league) {
          case 'Apprentice': return 'text-emerald-500';
          case 'Expert': return 'text-blue-500';
          case 'Master': return 'text-purple-500';
          case 'Grandmaster': return 'text-orange-500';
          default: return 'text-gray-400';
      }
  };

  if (activeModule) {
    return (
      <LMSPlayer 
        module={activeModule} language={language} isOnline={isOnline}
        onBack={() => setActiveModule(null)} onComplete={handleModuleComplete}
      />
    );
  }

  const menuItems = [
      { id: 'dashboard', label: t.dashboard || 'Dashboard', icon: <Home size={20} /> },
      { id: 'courses', label: t.modules || 'My Courses', icon: <BookOpen size={20} /> },
      { id: 'quizzes', label: t.quiz || 'Practice Zone', icon: <BrainCircuit size={20} /> },
      { id: 'certificates', label: 'Achievements', icon: <Award size={20} /> },
      { id: 'portfolio', label: language === 'ta' ? 'போர்ட்ஃபோலியோ' : 'Portfolio', icon: <FolderOpen size={20} /> },
      { id: 'scholarships', label: language === 'ta' ? 'தேர்வுத் தொகை' : 'Scholarships', icon: <GraduationCap size={20} /> },
      { id: 'skillgap', label: language === 'ta' ? 'திறன் பகுப்பாய்வு' : 'Skill Gap AI', icon: <Target size={20} /> },
      { id: 'mentors', label: language === 'ta' ? 'வழிகாட்டிகள்' : 'Mentors', icon: <UsersRound size={20} /> },
      { id: 'tamilassistant', label: language === 'ta' ? 'குரல் உதவியாளர்' : 'Tamil Voice AI', icon: <Languages size={20} /> },
      { id: 'marketplace', label: language === 'ta' ? 'திறன் சந்தை' : 'Skill Marketplace', icon: <Store size={20} /> },
      { id: 'internships', label: language === 'ta' ? 'பயிற்சி வேலை' : 'Internships', icon: <Briefcase size={20} /> },
      { id: 'map', label: language === 'ta' ? 'வாய்ப்பு வரைபடம்' : 'Opportunity Map', icon: <MapPinned size={20} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-300 pt-20">
      <OnboardingTour language={language} />
      
      {showToast && (
          <div className="fixed top-24 right-4 z-[100] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-5 animate-slide-up border-2 border-orange-500/20 dark:border-white/10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${showToast.type === 'badge' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                  {showToast.type === 'badge' ? <Medal size={24} /> : <TrendingUp size={24} />}
              </div>
              <div>
                  <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">{showToast.type === 'badge' ? 'New Achievement' : 'Status Update'}</p>
                  <p className="font-bold text-gray-800 dark:text-white">{showToast.msg}</p>
              </div>
          </div>
      )}

      <div className="md:hidden px-4 py-3 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 flex items-center justify-between sticky top-20 z-30">
          <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 dark:text-white capitalize">{activeTab}</span>
              {isSyncing && <Cloud size={14} className="text-kalvi-blue animate-pulse" />}
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300"><Menu size={20} /></button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:top-20 ${isSidebarOpen ? 'translate-x-0 top-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
              <div className="md:hidden p-4 flex justify-end">
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                  {menuItems.map(item => (
                      <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                              activeTab === item.id 
                              ? 'bg-kalvi-terracotta text-white shadow-lg' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-kalvi-terracotta'
                          }`}
                      >
                          {item.icon} {item.label}
                      </button>
                  ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-white/5">
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-4 border border-yellow-100 dark:border-yellow-500/20 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center text-yellow-500 shadow-sm"><Coins size={20} className="fill-current" /></div>
                      <div>
                          <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">Coin Balance</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.coins}</p>
                      </div>
                  </div>
              </div>
          </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto pb-24">
          
          {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col lg:flex-row items-center gap-8">
                      <div className="flex items-center gap-6 flex-1 w-full">
                          <div className="relative group">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-600 flex items-center justify-center p-1 shadow-xl">
                                  <div className="w-full h-full rounded-full bg-white dark:bg-[#111827] flex flex-col items-center justify-center overflow-hidden">
                                      {currentUser?.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <>
                                          <p className="text-[10px] font-black text-gray-400 uppercase">LVL</p>
                                          <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.level}</p>
                                        </>
                                      )}
                                  </div>
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1.5 rounded-lg shadow-lg border-2 border-white dark:border-[#111827]">
                                  <Star size={14} className="fill-current" />
                              </div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-3">
                                      <div>
                                          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{currentUser?.name}</h2>
                                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${getLeagueColor(stats.league)}`}>
                                              {stats.league} League
                                          </p>
                                      </div>
                                      {/* FIXED: Removed invalid 'title' prop from Loader2 component */}
                                      {isSyncing && <Loader2 size={16} className="text-kalvi-blue animate-spin mt-1" />}
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-gray-400 uppercase">Next Level</p>
                                      <p className="text-sm font-black text-gray-700 dark:text-gray-300">{stats.xp % 500} / 500 XP</p>
                                  </div>
                              </div>
                              <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-orange-500 to-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${xpProgress}%` }}></div>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-4 w-full lg:w-auto">
                          <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex-1 lg:min-w-[120px] text-center group">
                              <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse mx-auto mb-1 group-hover:scale-110 transition-transform" />
                              <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Streak</p>
                              <p className="text-lg font-black text-gray-800 dark:text-white">{stats.streak} Days</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-100/20 flex-1 lg:min-w-[120px] text-center group">
                              <Trophy size={24} className="text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Global Rank</p>
                              <p className="text-lg font-black text-gray-800 dark:text-white">#{currentRank}</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      <div className="xl:col-span-2 space-y-8">
                          {loadingModules ? (
                              <div className="h-80 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 animate-pulse" />
                          ) : currentLevelModule ? (
                              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-orange-500 p-10 text-white shadow-2xl group cursor-pointer" onClick={() => handleModuleClick(currentLevelModule, false)}>
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                  <div className="relative z-10">
                                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/30">
                                          <Play size={12} className="fill-current" /> Active Module
                                      </div>
                                      <h2 className="text-4xl font-heading font-black mb-4 leading-tight">{currentLevelModule.title[language]}</h2>
                                      <p className="text-white/80 mb-10 max-w-sm text-lg line-clamp-2">{currentLevelModule.description[language]}</p>
                                      <div className="flex items-center gap-6">
                                          <button className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">RESUME LEARNING</button>
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-black uppercase opacity-60">Reward</span>
                                              <span className="font-black text-yellow-300 flex items-center gap-1">+100XP <Zap size={14} className="fill-current" /></span>
                                          </div>
                                      </div>
                                  </div>
                                  <BrainCircuit size={300} className="absolute -bottom-20 -right-20 opacity-10 transform group-hover:scale-110 transition-transform duration-1000" />
                              </div>
                          ) : (
                              <div className="h-80 rounded-[2.5rem] bg-emerald-500 text-white p-12 flex flex-col justify-center items-center text-center shadow-xl">
                                  <Trophy size={80} className="mb-6 animate-bounce" />
                                  <h2 className="text-3xl font-black mb-2">GRADE COMPLETED!</h2>
                                  <p className="opacity-90 text-lg">You have mastered all AI modules for this track. Move to the next grade or try Quizzes!</p>
                              </div>
                          )}

                          <div className="space-y-6">
                              <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                                  <Layers className="text-orange-500" /> Grade Mission Levels
                              </h3>
                              <div className="space-y-4">
                                  {loadingModules ? [1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />) :
                                   modules.slice(0, 5).map((module, index) => {
                                      const isCompleted = completedModules.includes(module.id);
                                      const isLocked = index > 0 && !completedModules.includes(modules[index-1].id);
                                      return (
                                          <div 
                                              key={module.id}
                                              onClick={() => handleModuleClick(module, isLocked)}
                                              className={`flex items-center p-5 rounded-3xl border-2 transition-all duration-300 group ${isLocked ? 'bg-gray-50 dark:bg-white/5 opacity-50 cursor-not-allowed border-transparent' : 'bg-white dark:bg-[#1A1F2E] border-transparent shadow-sm hover:border-indigo-500/30 transform hover:-translate-y-1 cursor-pointer'}`}
                                          >
                                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mr-5 flex-shrink-0 ${isLocked ? 'bg-gray-200 dark:bg-white/10 text-gray-400' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600'}`}>
                                                  {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle size={28} /> : index + 1}
                                              </div>
                                              <div className="flex-1 overflow-hidden">
                                                  <h4 className={`font-black text-lg truncate ${isLocked ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{module.title[language]}</h4>
                                                  <p className="text-sm text-gray-500 truncate">{module.description[language]}</p>
                                              </div>
                                              {!isLocked && <div className="ml-4 p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all"><ChevronRight size={18} /></div>}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>

                      <div className="space-y-8">
                          <div className="bg-white dark:bg-[#1A1F2E] rounded-3xl p-8 border border-gray-100 dark:border-white/10 shadow-sm text-center">
                                <h3 className="font-black text-gray-800 dark:text-white text-xs uppercase tracking-widest mb-6">Path Mastery</h3>
                                <div className="relative h-40 w-40 mx-auto mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-white/5" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * moduleProgress) / 100} className="text-orange-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">{moduleProgress}%</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Grade {studentGrade}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{completedModules.length} / {modules.length} Lessons Done</p>
                          </div>

                          <div className="bg-white dark:bg-[#1A1F2E] rounded-3xl p-8 border border-gray-100 dark:border-white/10 shadow-sm">
                              <h3 className="font-black text-gray-800 dark:text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Daily Quests</h3>
                              <div className="space-y-4">
                                  {[
                                      {id: 1, t: "Watch 1 Lesson", x: 50, c: completedModules.length > 0}, 
                                      {id: 2, t: "Unlock 3 Badges", x: 200, c: stats.badges.length >= 3}
                                  ].map(q => (
                                      <div key={q.id} className="flex items-center gap-4">
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${q.c ? 'bg-green-50 border-green-500 text-white' : 'border-gray-200 dark:border-white/20'}`}>{q.c && <Check size={12}/>}</div>
                                          <p className={`text-sm font-bold flex-1 ${q.c ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{q.t}</p>
                                          <span className="text-[10px] font-black text-yellow-500">+{q.x}XP</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white">Settings & Preferences</h2>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="flex items-center gap-2 text-xs font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-white/5 p-2 rounded-lg transition"
                    >
                        <RefreshCw size={14} /> Sync Data
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#1A1F2E] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-10 shadow-sm space-y-12">
                      <div className="grid md:grid-cols-3 gap-8 items-start">
                          <div>
                              <h4 className="font-black text-gray-900 dark:text-white mb-2 uppercase text-xs tracking-widest">Personal Identity</h4>
                              <p className="text-sm text-gray-500 leading-relaxed">Update your public profile information and registered school.</p>
                          </div>
                          <div className="md:col-span-2 space-y-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                      <div className="relative group">
                                          <UserIcon size={16} className="absolute left-5 top-4 text-gray-400 group-focus-within:text-orange-500" />
                                          <input 
                                              value={settingsForm.fullName}
                                              onChange={e => setSettingsForm({...settingsForm, fullName: e.target.value})}
                                              className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl pl-14 pr-4 py-4 font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500/20"
                                          />
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">School</label>
                                      <div className="relative group opacity-50">
                                          <School size={16} className="absolute left-5 top-4 text-gray-400" />
                                          <input value="Govt HSS Chennai" readOnly className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl pl-14 pr-4 py-4 font-bold text-gray-400 cursor-not-allowed" />
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                  <div className="relative group">
                                      <Mail size={16} className="absolute left-5 top-4 text-gray-400 group-focus-within:text-orange-500" />
                                      <input 
                                          value={settingsForm.email}
                                          onChange={e => setSettingsForm({...settingsForm, email: e.target.value})}
                                          className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl pl-14 pr-4 py-4 font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500/20"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      <div className="grid md:grid-cols-3 gap-8 items-start">
                          <div>
                              <h4 className="font-black text-gray-900 dark:text-white mb-2 uppercase text-xs tracking-widest">Academic Track</h4>
                              <p className="text-sm text-gray-500 leading-relaxed">Switch your grade level to see different lesson modules.</p>
                          </div>
                          <div className="md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                  <button 
                                      onClick={() => setSettingsForm({...settingsForm, gradeGroup: '6-8'})}
                                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${settingsForm.gradeGroup === '6-8' ? 'border-kalvi-terracotta bg-orange-50 dark:bg-orange-500/10 text-kalvi-terracotta' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400'}`}
                                  >
                                      <Rocket size={24} className={settingsForm.gradeGroup === '6-8' ? 'text-kalvi-terracotta' : 'text-gray-400'} />
                                      <span className="font-black text-sm uppercase">Class 6 - 8</span>
                                  </button>
                                  <button 
                                      onClick={() => setSettingsForm({...settingsForm, gradeGroup: '9-12'})}
                                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${settingsForm.gradeGroup === '9-12' ? 'border-kalvi-terracotta bg-orange-50 dark:bg-orange-500/10 text-kalvi-terracotta' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400'}`}
                                  >
                                      <GraduationCap size={24} className={settingsForm.gradeGroup === '9-12' ? 'text-kalvi-terracotta' : 'text-gray-400'} />
                                      <span className="font-black text-sm uppercase">Class 9 - 12</span>
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-white/5" />

                      <div className="grid md:grid-cols-3 gap-8 items-start">
                          <div>
                              <h4 className="font-black text-gray-900 dark:text-white mb-2 uppercase text-xs tracking-widest">Interface & Playback</h4>
                              <p className="text-sm text-gray-500 leading-relaxed">Customize how the platform looks and behaves on your device.</p>
                          </div>
                          <div className="md:col-span-2 space-y-8">
                              <div className="grid md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">App Language</label>
                                      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
                                          <button 
                                              onClick={() => setSettingsForm({...settingsForm, appLanguage: 'ta'})}
                                              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${settingsForm.appLanguage === 'ta' ? 'bg-white dark:bg-orange-50 text-orange-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                          >
                                              தமிழ்
                                          </button>
                                          <button 
                                              onClick={() => setSettingsForm({...settingsForm, appLanguage: 'en'})}
                                              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${settingsForm.appLanguage === 'en' ? 'bg-white dark:bg-orange-50 text-orange-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                          >
                                              English
                                          </button>
                                      </div>
                                  </div>
                                  <div className="space-y-4">
                                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Video Resolution</label>
                                      <div className="relative">
                                          <select 
                                              value={settingsForm.videoQuality}
                                              onChange={e => setSettingsForm({...settingsForm, videoQuality: e.target.value as any})}
                                              className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 py-4 font-bold text-gray-700 dark:text-white appearance-none"
                                          >
                                              <option value="auto">Auto (Recommended)</option>
                                              <option value="720p">High (720p)</option>
                                              <option value="360p">Data Saver (360p)</option>
                                          </select>
                                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center justify-between p-6 bg-orange-50 dark:bg-orange-500/5 rounded-[1.5rem] border border-orange-100 dark:border-orange-500/20">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-orange-600 shadow-sm"><RefreshCw size={24} /></div>
                                      <div>
                                          <p className="font-black text-orange-900 dark:text-orange-400 text-sm">Offline Synchronization</p>
                                          <p className="text-xs text-orange-700/60 dark:text-orange-300/50">Auto-sync learning progress when online.</p>
                                      </div>
                                  </div>
                                  <div className="w-12 h-6 bg-orange-500 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div></div>
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end pt-4">
                          <button 
                              onClick={handleSaveSettings}
                              className="bg-kalvi-terracotta text-white px-12 py-4 rounded-2xl font-black text-base shadow-xl hover:bg-orange-700 transition-all flex items-center gap-3 active:scale-95"
                          >
                              <Save size={20} /> SAVE ALL CHANGES
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'courses' && (
              <div className="animate-fade-in space-y-8">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white">{t.modules}</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-3 text-gray-400"/>
                        <input 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            className="pl-12 pr-4 py-3 bg-white dark:bg-white/5 rounded-2xl w-full md:w-80 outline-none border border-transparent focus:border-orange-500/20" 
                            placeholder="Search modules..."
                        />
                    </div>
                  </div>
                  {loadingModules ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-white/5 rounded-[2rem] animate-pulse" />)}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {modules.filter(m => m.title[language].toLowerCase().includes(searchQuery.toLowerCase())).map(m => {
                              const isCompleted = completedModules.includes(m.id);
                              return (
                                <div key={m.id} onClick={() => setActiveModule(m)} className="bg-white dark:bg-[#1A1F2E] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className={`w-12 h-12 ${isCompleted ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600'} rounded-xl flex items-center justify-center mb-6 transition-colors`}>
                                        {isCompleted ? <CheckCircle size={24} /> : <Play size={20} className="fill-current"/>}
                                    </div>
                                    <h4 className="font-black text-lg mb-2 group-hover:text-orange-600 transition-colors leading-tight">{m.title[language]}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">{m.description[language]}</p>
                                    {isCompleted && (
                                        <div className="absolute top-6 right-6 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-[10px] font-black uppercase tracking-wider animate-fade-in">
                                            Completed
                                        </div>
                                    )}
                                </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'quizzes' && (
              <div className="animate-fade-in space-y-12 pb-20">
                  <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white">{t.quiz || 'Practice Zone'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {GENERAL_TOPICS.map(topic => (
                      <div key={topic.id} onClick={() => handleStartQuiz(topic.title[language])} className="bg-white dark:bg-[#1A1F2E] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:border-orange-500/30 transition-all cursor-pointer group relative overflow-hidden">
                        <div className={`w-14 h-14 ${topic.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>{topic.icon}</div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">{topic.title[language]}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{topic.desc[language]}</p>
                        <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase">Challenge <ChevronRight size={14}/></div>
                      </div>
                    ))}
                  </div>
              </div>
          )}

          {activeTab === 'certificates' && (
              <div className="animate-fade-in space-y-8">
                  <div className="bg-gradient-to-r from-indigo-900 to-black p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between border border-white/10 shadow-2xl">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Achievement Hall</p>
                        <h2 className="text-5xl font-heading font-black mb-4"><span className={getLeagueColor(stats.league)}>{stats.league}</span> League</h2>
                        <p className="text-gray-400 text-lg">Ascend through missions to reach Grandmaster rank.</p>
                    </div>
                    <div className="relative">
                        <Medal size={120} className={`${getLeagueColor(stats.league)} drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`} />
                        <div className="absolute inset-0 border-4 border-white/5 rounded-full scale-125 animate-spin-slow" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                    {gamificationService.getBadges().map(b => (
                      <div key={b.id} className={`p-8 rounded-[2.5rem] border-2 text-center transition-all ${b.unlocked ? 'border-orange-500 bg-white dark:bg-[#1A1F2E] shadow-xl' : 'border-gray-100 dark:border-white/5 opacity-40 grayscale'}`}>
                        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{b.icon}</div>
                        <p className="font-black text-sm dark:text-white">{b.name[language]}</p>
                      </div>
                    ))}
                  </div>
              </div>
          )}

          {activeTab === 'scholarships' && (
              <ScholarshipFinder language={language} studentGrade={studentGrade} />
          )}

          {activeTab === 'skillgap' && (
              <SkillGapAnalyzer language={language} studentGrade={studentGrade} />
          )}

          {activeTab === 'mentors' && (
              <MentorMarketplace language={language} />
          )}

          {activeTab === 'tamilassistant' && (
              <TamilVoiceAssistant language={language} />
          )}

          {activeTab === 'marketplace' && (
              <SkillMarketplace language={language} />
          )}

          {activeTab === 'internships' && (
              <InternshipFinder language={language} studentGrade={studentGrade} />
          )}

          {activeTab === 'map' && (
              <OpportunityMap language={language} />
          )}

          {activeTab === 'portfolio' && (
              <StudentPortfolio
                language={language}
                studentName={currentUser?.name || 'Student'}
                userStats={stats}
                badges={gamificationService.getBadges()}
              />
          )}
      </main>

      {/* QUIZ MODAL */}
      {quizMode.isOpen && (
             <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1A1F2E] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-bounce-in border border-white/10 flex flex-col max-h-[90vh]">
                    <div className="bg-orange-600 p-8 flex justify-between items-center text-white flex-shrink-0">
                         <div className="flex flex-col">
                            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] opacity-80 mb-2"><Zap size={14} className="fill-current" /> AI Practice</div>
                            <h3 className="font-heading font-black text-2xl line-clamp-1">{quizMode.moduleTitle}</h3>
                         </div>
                         <button onClick={() => setQuizMode(prev => ({...prev, isOpen: false}))} className="hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={24}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        {quizMode.loading ? (
                            <div className="py-20 text-center">
                                <Loader2 size={40} className="animate-spin text-orange-600 mx-auto mb-4"/>
                                <p className="font-black text-2xl text-gray-800 dark:text-white">Generating Challenge...</p>
                            </div>
                        ) : quizMode.error ? (
                            <div className="py-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle size={40} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white">Oops!</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">{quizMode.error}</p>
                                <button onClick={() => handleStartQuiz(quizMode.moduleTitle)} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <RefreshCw size={18} /> RETRY GENERATION
                                </button>
                            </div>
                        ) : quizMode.completed ? (
                            <div className="py-12 text-center">
                                <Trophy size={80} className="text-yellow-500 mx-auto mb-6"/>
                                <h3 className="text-4xl font-black mb-4">MISSION COMPLETE</h3>
                                <p className="text-gray-500 mb-8">XP Earned: +{quizMode.score * 20}</p>
                                <button onClick={() => setQuizMode(prev => ({...prev, isOpen: false}))} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-5 rounded-2xl font-black">CONTINUE</button>
                            </div>
                        ) : (quizMode.questions.length > 0 && quizMode.questions[quizMode.currentQuestion]) ? (
                            <div className="space-y-10">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                    {quizMode.questions[quizMode.currentQuestion].question}
                                </h4>
                                <div className="space-y-4">
                                    {quizMode.questions[quizMode.currentQuestion].options.map((opt, idx) => (
                                        <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={quizMode.selectedOption !== null} className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${quizMode.selectedOption === null ? 'bg-white dark:bg-white/5 border-gray-100 hover:border-orange-50' : idx === quizMode.questions[quizMode.currentQuestion].correctAnswerIndex ? 'bg-green-50 border-green-500 text-green-700 font-black' : idx === quizMode.selectedOption ? 'bg-red-50 border-red-500 text-red-700' : 'opacity-40 grayscale border-gray-100'}`}>
                                            <span>{opt}</span>{quizMode.selectedOption !== null && idx === quizMode.questions[quizMode.currentQuestion].correctAnswerIndex && <CheckCircle size={20} />}
                                        </button>
                                    ))}
                                </div>
                                {quizMode.showExplanation && (
                                    <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-500/30 text-sm font-bold leading-relaxed animate-fade-in">
                                        <div className="text-[10px] uppercase tracking-widest text-indigo-400 mb-2">Explanation</div>
                                        {quizMode.questions[quizMode.currentQuestion].explanation}
                                    </div>
                                )}
                                <button onClick={handleNextQuestion} disabled={quizMode.selectedOption === null} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                                    {quizMode.currentQuestion < quizMode.questions.length - 1 ? 'NEXT QUESTION' : 'FINISH CHALLENGE'} <ChevronRight size={20}/>
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-500">The generator returned an empty set. Please try again.</p>
                                <button onClick={() => setQuizMode(prev => ({...prev, isOpen: false}))} className="mt-4 px-6 py-2 bg-gray-100 rounded-lg font-bold">CLOSE</button>
                            </div>
                        )}
                    </div>
                </div>
             </div>
      )}
    </div>
  );
};

export default StudentDashboard;
