
import React, { useState, useEffect } from 'react';
import { Module, Language, QuizQuestion } from '../types';
import { TRANSLATIONS } from '../constants';
import { Play, CheckCircle, BookOpen, HelpCircle, FileText, Send, ArrowLeft, Loader2, WifiOff, Cloud, Sparkles, BrainCircuit, X, Trophy, AlertCircle, MessageSquare, Globe, AlignLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { generateAssistantHelp, summarizeLesson, generateQuiz, explainConcept } from '../services/geminiService';
import { offlineStorage } from '../services/offlineStorage';
import { gamificationService } from '../services/gamificationService';
import { realtimeService } from '../services/realtimeService';
import { getOptimizedUrl } from '../utils/imageUtils';

interface LMSPlayerProps {
  module: Module;
  language: Language;
  isOnline: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export const LMSPlayer: React.FC<LMSPlayerProps> = ({ 
  module: initialModule, 
  language, 
  isOnline, 
  onBack,
  onComplete 
}) => {
  const t = TRANSLATIONS[language];
  const [currentModule, setCurrentModule] = useState<Module>(initialModule);
  
  // States
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript' | 'quiz'>('notes');
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [videoError, setVideoError] = useState(false);
  const isCompleted = offlineStorage.getCompletedModules().includes(currentModule.id);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitted' | 'offline-queued'>(isCompleted ? 'submitted' : 'idle');

  const rawVideoUrl = currentModule.video?.cdnUrl || currentModule.videoUrl || '';
  const isYouTube = rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be');
  const videoSrc = isYouTube ? rawVideoUrl : (rawVideoUrl ? `${rawVideoUrl}?v=${Date.now()}` : '');

  const handleGenerateQuiz = async () => {
      setQuizOpen(true);
      setIsQuizGenerating(true);
      setQuizCompleted(false);
      setQuizScore(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);

      try {
          const questions = await generateQuiz(currentModule.title[language], language === 'ta');
          setQuizQuestions(questions);
      } catch (e) {
          console.error(e);
      } finally {
          setIsQuizGenerating(false);
      }
  };

  const handleQuizAnswer = (optionIndex: number) => {
      if (selectedOption !== null) return; 
      setSelectedOption(optionIndex);
      setShowExplanation(true);
      if (optionIndex === quizQuestions[currentQuestionIndex].correctAnswerIndex) {
          setQuizScore(prev => prev + 1);
      }
  };

  const handleNextQuestion = () => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedOption(null);
          setShowExplanation(false);
      } else {
          setQuizCompleted(true);
          if (quizScore >= 2) { // Passed 2/3
             gamificationService.awardXpAndCoins(100, 50, 'Mission Mastery');
          }
      }
  };

  const handleAssessmentSubmit = () => {
    setSubmissionStatus('submitted');
    offlineStorage.saveCompletedModule(currentModule.id);
    onComplete();
  };

  return (
      <div className="flex flex-col h-full bg-gray-50 fixed inset-0 z-50 overflow-hidden">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft /></button>
                <h2 className="text-xl font-bold text-kalvi-indigo">{currentModule.title[language]}</h2>
            </div>
            <button 
                onClick={handleGenerateQuiz}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition"
            >
                <BrainCircuit size={18} /> {language === 'ta' ? 'வினாடி வினா' : 'Practice Quiz'}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-24">
            <div key={videoSrc} className="aspect-video rounded-xl bg-black shadow-lg overflow-hidden flex items-center justify-center">
                {videoSrc ? (
                    isYouTube ? <iframe src={videoSrc} className="w-full h-full" frameBorder="0" allowFullScreen></iframe> : <video src={videoSrc} controls className="w-full h-full" />
                ) : <div className="text-white">Video Loading...</div>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setActiveTab('notes')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'notes' ? 'text-kalvi-terracotta border-b-2 border-kalvi-terracotta' : 'text-gray-500'}`}>Notes</button>
                    <button onClick={() => setActiveTab('transcript')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'transcript' ? 'text-kalvi-terracotta border-b-2 border-kalvi-terracotta' : 'text-gray-500'}`}>Transcript</button>
                    <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'quiz' ? 'text-kalvi-terracotta border-b-2 border-kalvi-terracotta' : 'text-gray-500'}`}>Assessment</button>
                </div>
                <div className="p-6">
                    {activeTab === 'notes' && <div className="prose max-w-none text-gray-700 whitespace-pre-line">{currentModule.content[language]}</div>}
                    {activeTab === 'transcript' && <div className="text-sm text-gray-600 space-y-4">{currentModule.content[language].split('.').map((s, i) => s.trim() && <p key={i}>[{i}:00] {s.trim()}.</p>)}</div>}
                    {activeTab === 'quiz' && (
                        <div>
                            <p className="mb-4 font-bold bg-orange-50 p-4 rounded-lg">{currentModule.assessmentTask[language]}</p>
                            {submissionStatus === 'submitted' ? <div className="text-green-600 font-bold">Successfully Submitted!</div> : (
                                <div className="space-y-4">
                                    <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} className="w-full border rounded-xl p-4 min-h-[120px]" placeholder="Type answer..." />
                                    <button onClick={handleAssessmentSubmit} disabled={!submissionText.trim()} className="bg-kalvi-terracotta text-white px-8 py-3 rounded-xl font-bold">Submit</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* QUIZ OVERLAY MODAL */}
        {quizOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1A1F2E] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-bounce-in flex flex-col max-h-[90vh]">
                    <div className="bg-orange-600 p-6 flex justify-between items-center text-white">
                        <h3 className="font-black text-xl">Mission Quiz</h3>
                        <button onClick={() => setQuizOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition"><X size={24}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        {isQuizGenerating ? (
                            <div className="py-20 text-center space-y-4">
                                <Loader2 className="animate-spin text-orange-600 mx-auto" size={48}/>
                                <p className="font-black text-xl text-gray-800 dark:text-white">AI Loading Challenge...</p>
                            </div>
                        ) : quizCompleted ? (
                            <div className="py-12 text-center space-y-6">
                                <Trophy size={80} className="text-yellow-500 mx-auto animate-bounce"/>
                                <h3 className="text-3xl font-black">{quizScore >= 2 ? 'MISSION COMPLETE!' : 'QUIZ FINISHED'}</h3>
                                <p className="text-xl font-bold">Score: {quizScore} / {quizQuestions.length}</p>
                                <div className="flex gap-4">
                                    <button onClick={handleGenerateQuiz} className="flex-1 bg-gray-200 py-4 rounded-xl font-bold">Retry</button>
                                    <button onClick={() => setQuizOpen(false)} className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold">Finish</button>
                                </div>
                            </div>
                        ) : (quizQuestions.length > 0) ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                                    <span className="text-xs font-bold text-gray-400">Correct: {quizScore}</span>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{quizQuestions[currentQuestionIndex].question}</h4>
                                <div className="space-y-3">
                                    {quizQuestions[currentQuestionIndex].options.map((opt, i) => {
                                        const isCorrect = i === quizQuestions[currentQuestionIndex].correctAnswerIndex;
                                        const isSelected = i === selectedOption;
                                        let btnClass = "border-gray-100 hover:border-orange-500";
                                        if (selectedOption !== null) {
                                            if (isCorrect) btnClass = "bg-green-50 border-green-500 text-green-700 font-bold";
                                            else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-700 font-bold";
                                            else btnClass = "opacity-40 grayscale";
                                        }
                                        return (
                                            <button key={i} onClick={() => handleQuizAnswer(i)} disabled={selectedOption !== null} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${btnClass}`}>
                                                <span className="font-bold">{opt}</span>
                                                {selectedOption !== null && isCorrect && <CheckCircle size={18}/>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {showExplanation && (
                                    <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-sm font-bold text-indigo-800 dark:text-indigo-300 animate-fade-in border-l-4 border-indigo-500">
                                        💡 {quizQuestions[currentQuestionIndex].explanation}
                                    </div>
                                )}
                                <button onClick={handleNextQuestion} disabled={selectedOption === null} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
                                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'View Results'} <ChevronRight size={20}/>
                                </button>
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-gray-500 font-bold">No questions available for this module.</p>
                                <button onClick={() => setQuizOpen(false)} className="mt-4 px-6 py-2 bg-gray-100 rounded-lg">Close</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
  );
};
