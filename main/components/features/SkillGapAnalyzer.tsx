import React, { useState } from 'react';
import { Target, Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Language, GradeGroup } from '../../types';
import { analyzeSkillGap, SkillGapResult } from '../../services/geminiService';

interface SkillGapAnalyzerProps {
  language: Language;
  studentGrade: GradeGroup;
  completedSkills?: string[];
}

const SUGGESTED_CAREERS = ['Software Engineer', 'Data Scientist', 'UI/UX Designer', 'Civil Services (IAS)', 'Doctor (MBBS)', 'Mechanical Engineer', 'Digital Marketer', 'Chartered Accountant'];

export const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ language, studentGrade, completedSkills = [] }) => {
  const [targetCareer, setTargetCareer] = useState('');
  const [currentSkills, setCurrentSkills] = useState(completedSkills.length ? completedSkills.join(', ') : '');
  const [prefilled] = useState(completedSkills.length > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const isTamil = language === 'ta';

  const t = {
    title: { en: 'AI Skill Gap Analyzer', ta: '\u0BA4\u0BBF\u0BB1\u0BA9\u0BCD \u0B87\u0B9F\u0BC8\u0BB5\u0BC6\u0BB3\u0BBF AI \u0BAA\u0BC1\u0BB2\u0BAA\u0BCD\u0BAA\u0BBE\u0BAF\u0BCD\u0BB5\u0BC1' }[language],
    subtitle: { en: 'Tell us where you want to go — we\u2019ll show you what to learn next', ta: '\u0BA8\u0BC0\u0BAE\u0BCD\u0BAF\u0BC7 \u0B8E\u0BB0\u0BC1\u0BAE\u0BCD \u0B87\u0BB2\u0B95\u0BCD\u0B95\u0BC8\u0B9A\u0BCD \u0B9A\u0BCA\u0BB2\u0BCD\u0BB2\u0BC1\u0BAE\u0BCD, \u0B85\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1 \u0BAA\u0BC1\u0BB0\u0BBF\u0BAF\u0BC1 \u0BA8\u0BBE\u0BAE\u0BCD \u0B95\u0BBE\u0BB1\u0BCD\u0BB1\u0BC1\u0BB5\u0BCA\u0BAE\u0BCD' }[language],
    careerLabel: { en: 'Target career or role', ta: '\u0B87\u0BB2\u0B95\u0BCD\u0B95\u0BC1\u0BB1 \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BAA\u0BA4\u0BB5\u0BBF' }[language],
    careerPlaceholder: { en: 'e.g. Software Engineer, Doctor, IAS Officer...', ta: 'எ.கா. மென்பொருள் பொறியாளர், மருத்துவர்...' }[language],
    skillsLabel: { en: 'Subjects/skills you\u2019re confident in (optional)', ta: '\u0BA8\u0BC0\u0BAE\u0BCD\u0BAF\u0BC1\u0B9F\u0BC8\u0BAF \u0BB5\u0BB2\u0BC1\u0BB5\u0BBE\u0BA9 \u0BAA\u0BBE\u0B9F\u0BAE\u0BCD/\u0BA4\u0BBF\u0BB1\u0BAE\u0BC8\u0B95\u0BB3\u0BCD (\u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD)' }[language],
    skillsPlaceholder: { en: 'e.g. Maths, basic Python, public speaking...', ta: 'எ.கா. கணிதம், மூல Python, பொது பேச்சு...' }[language],
    pulledFromProgress: { en: 'Pulled from your completed lessons — edit if needed', ta: 'உங்கள் முடிக்கப்பட்ட பாடங்களிலிருந்து பெறப்பட்டது — தேவைப்பட்டால் திருத்தவும்' }[language],
    analyze: { en: 'Analyze My Skill Gap', ta: '\u0B8E\u0BA9\u0BCD \u0BA4\u0BBF\u0BB1\u0BA9\u0BCD \u0B87\u0B9F\u0BC8\u0BB5\u0BC6\u0BB3\u0BBF\u0BAF\u0BC8 \u0BAA\u0BC1\u0BB2\u0BAA\u0BCD\u0BAA\u0BC1\u0BB2\u0BCD \u0B9A\u0BC6\u0BAF\u0BCD' }[language],
    analyzing: { en: 'Analyzing your path...', ta: '\u0B89\u0BB0\u0BC1\u0BB5\u0BBE\u0BA9 \u0BAA\u0BBE\u0BA4\u0BC8 \u0BAA\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BBE\u0BAF\u0BCD\u0BAA\u0BCD\u0BAA\u0BC1...' }[language],
    matchScore: { en: 'Career Fit Score', ta: '\u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BAE\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC6\u0BA3\u0BCD' }[language],
    strengths: { en: 'Your Strengths', ta: '\u0BA8\u0BC0\u0BA9\u0BCD\u0BB0\u0BB4\u0BC1\u0BB5\u0BC1 \u0BAA\u0BB2\u0BAE\u0BCD\u0BAA\u0BC1\u0BB2\u0BAE\u0BCD' }[language],
    gaps: { en: 'Skills to Build', ta: '\u0BA4\u0BBF\u0BB1\u0BAE\u0BC8\u0B95\u0BB3\u0BC8 \u0BB5\u0BB3\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD' }[language],
    howToLearn: { en: 'How to start', ta: '\u0B8E\u0BB5\u0BCD\u0BB5\u0BBE\u0BB1\u0BC1 \u0BA4\u0BCA\u0B9F\u0BB0\u0BC1\u0BB5\u0BA4\u0BC1' }[language],
    nextStep: { en: 'Your First Action This Week', ta: 'இந்த வாரம் உன் முதல் வேலை' }[language],
    tryAgain: { en: 'Try Another Career', ta: '\u0BAE\u0BB1\u0BCD\u0BB1\u0BCA\u0BB0\u0BC1 \u0BA4\u0BCA\u0BB4\u0BBF\u0BB2\u0BC8 \u0BAE\u0BC1\u0BAF\u0BB1\u0BCD\u0B9A\u0BBF\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD' }[language],
  };

  const handleAnalyze = async () => {
    if (!targetCareer.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeSkillGap(targetCareer, currentSkills, studentGrade, isTamil);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Target className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {!result && !loading && (
        <div className="bg-white dark:bg-[#1A1F2E] rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 space-y-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">{t.careerLabel}</label>
            <input
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder={t.careerPlaceholder}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTED_CAREERS.map(c => (
                <button key={c} onClick={() => setTargetCareer(c)} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-500/10 hover:text-orange-600 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">{t.skillsLabel}</label>
            {prefilled && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-2">{t.pulledFromProgress}</p>
            )}
            <textarea
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder={t.skillsPlaceholder}
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!targetCareer.trim()}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
          >
            <Sparkles size={18} /> {t.analyze}
          </button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="py-24 text-center">
          <Loader2 size={40} className="animate-spin text-orange-600 mx-auto mb-4" />
          <p className="font-black text-xl text-gray-800 dark:text-white">{t.analyzing}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-br from-indigo-600 to-orange-500 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{t.matchScore}</p>
              <p className="text-5xl font-heading font-black">{result.matchScore}<span className="text-2xl opacity-70">/100</span></p>
              <p className="mt-2 text-white/90 text-sm font-semibold">{targetCareer}</p>
            </div>
            <Target size={90} className="opacity-20" />
          </div>

          <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 size={16} /> {t.strengths}</h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold">{s}</span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.gaps}</h3>
            {result.gaps.map((g, i) => (
              <div key={i} className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5">
                <h4 className="font-black text-gray-900 dark:text-white mb-2">{g.skill}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{g.why}</p>
                <div className="flex items-start gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl">
                  <ArrowRight size={16} className="flex-shrink-0 mt-0.5" /> {g.howToLearn}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/20 rounded-[2rem] p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-2">{t.nextStep}</h3>
            <p className="font-bold text-gray-800 dark:text-white">{result.recommendedNextStep}</p>
          </div>

          <button
            onClick={() => { setResult(null); setTargetCareer(''); setCurrentSkills(''); }}
            className="w-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-black flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;
