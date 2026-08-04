import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, X, ExternalLink, Award, Trash2, Link2, Tag, Share2, Sparkles } from 'lucide-react';
import { Language, UserStats, Badge as BadgeType } from '../../types';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  link: string;
  skills: string[];
  createdAt: number;
}

interface StudentPortfolioProps {
  language: Language;
  studentName: string;
  userStats: UserStats;
  badges: BadgeType[];
}

const STORAGE_KEY = 'bharatStack_portfolio_projects';

export const StudentPortfolio: React.FC<StudentPortfolioProps> = ({ language, studentName, userStats, badges }) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProjects(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const persist = (next: PortfolioProject[]) => {
    setProjects(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — state still updates in-memory
    }
  };

  const t = {
    title: language === 'en' ? 'Student Portfolio' : 'மாணவர் போர்ட்ஃபோலியோ',
    subtitle: language === 'en' ? 'Your projects, certificates and skills — all in one shareable profile' : 'உங்கள் திட்டங்கள், சான்றிதழ்கள் மற்றும் திறன்கள் — ஒரே இடத்தில்',
    addProject: language === 'en' ? 'Add Project' : 'திட்டத்தைச் சேர்',
    projectTitle: language === 'en' ? 'Project title' : 'திட்டத் தலைப்பு',
    projectDesc: language === 'en' ? 'What did you build? What did you learn?' : 'நீங்கள் என்ன உருவாக்கினீர்கள்?',
    projectLink: language === 'en' ? 'Link (optional) — GitHub, Drive, YouTube...' : 'இணைப்பு (விருப்பம்)',
    skillsLabel: language === 'en' ? 'Skills used (comma separated)' : 'பயன்படுத்திய திறன்கள் (கமாவால் பிரிக்கவும்)',
    save: language === 'en' ? 'Save Project' : 'சேமி',
    cancel: language === 'en' ? 'Cancel' : 'ரத்து செய்',
    noProjects: language === 'en' ? 'No projects yet. Add your first one — even a school assignment counts!' : 'இன்னும் திட்டங்கள் இல்லை. உங்கள் முதல் திட்டத்தைச் சேர்க்கவும்!',
    myProjects: language === 'en' ? 'Projects' : 'திட்டங்கள்',
    certificates: language === 'en' ? 'Certificates & Badges' : 'சான்றிதழ்கள் & பேட்ஜ்கள்',
    skillsSummary: language === 'en' ? 'Skill Summary' : 'திறன் சுருக்கம்',
    share: language === 'en' ? 'Copy shareable summary' : 'பகிரக்கூடிய சுருக்கத்தை நகலெடு',
    copied: language === 'en' ? 'Copied!' : 'நகலெடுக்கப்பட்டது!',
    noBadges: language === 'en' ? 'Keep learning to unlock badges.' : 'பேட்ஜ்களைப் பெற தொடர்ந்து கற்கவும்.',
    delete: language === 'en' ? 'Remove' : 'நீக்கு',
  };

  const [copied, setCopied] = useState(false);
  const unlockedBadges = badges.filter(b => b.unlocked);

  const allSkills = Array.from(new Set(projects.flatMap(p => p.skills)));

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setSkillsInput('');
    setShowForm(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const newProject: PortfolioProject = {
      id: `proj_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: Date.now(),
    };
    persist([newProject, ...projects]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    persist(projects.filter(p => p.id !== id));
  };

  const handleShare = () => {
    const lines = [
      `${studentName} — Portfolio`,
      `Level ${userStats.level} · ${userStats.league} · ${userStats.xp} XP`,
      '',
      `Projects (${projects.length}):`,
      ...projects.map(p => `- ${p.title}${p.skills.length ? ` [${p.skills.join(', ')}]` : ''}${p.link ? ` — ${p.link}` : ''}`),
      '',
      `Badges: ${unlockedBadges.map(b => b.name[language]).join(', ') || '—'}`,
      `Skills: ${allSkills.join(', ') || '—'}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
            <FolderOpen className="text-kalvi-terracotta" size={30} /> {t.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          >
            <Share2 size={16} /> {copied ? t.copied : t.share}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kalvi-terracotta text-white text-sm font-black shadow-md hover:brightness-110 transition-all"
          >
            <Plus size={16} /> {t.addProject}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">{t.addProject}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t.projectTitle}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t.projectDesc}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white resize-none"
          />
          <div className="relative">
            <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder={t.projectLink}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
            />
          </div>
          <div className="relative">
            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder={t.skillsLabel}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">{t.cancel}</button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-kalvi-terracotta shadow-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">{t.myProjects}</h3>
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold bg-white dark:bg-[#1A1F2E] rounded-[2rem] border border-gray-100 dark:border-white/5">{t.noProjects}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => (
              <div key={p.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{p.title}</h4>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title={t.delete}>
                    <Trash2 size={16} />
                  </button>
                </div>
                {p.description && <p className="text-sm text-gray-600 dark:text-gray-300">{p.description}</p>}
                {p.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills.map(s => (
                      <span key={s} className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{s}</span>
                    ))}
                  </div>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-kalvi-terracotta hover:underline">
                    View <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">{t.certificates}</h3>
        {unlockedBadges.length === 0 ? (
          <p className="text-sm text-gray-400 font-semibold">{t.noBadges}</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {unlockedBadges.map(b => (
              <div key={b.id} className="flex items-center gap-3 bg-white dark:bg-[#1A1F2E] rounded-2xl px-5 py-4 border border-gray-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{b.name[language]}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{b.description[language]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {allSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <Sparkles size={14} /> {t.skillsSummary}
          </h3>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(s => (
              <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortfolio;
