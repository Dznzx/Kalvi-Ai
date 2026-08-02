import React, { useState, useMemo } from 'react';
import { Store, Search, ExternalLink, Clock, BadgeCheck, Bookmark, BookmarkCheck, Code2, Palette, Megaphone, Calculator, Mic2, Wrench } from 'lucide-react';
import { Language } from '../../types';

interface SkillMarketplaceProps {
  language: Language;
}

type ResourceCategory = 'Coding' | 'Design' | 'Communication' | 'Aptitude' | 'Vocational' | 'Marketing';
type ResourceType = 'Course' | 'Video Series' | 'Practice Set' | 'Certification';

interface SkillResource {
  id: string;
  title: { en: string; ta: string };
  provider: string;
  category: ResourceCategory;
  type: ResourceType;
  duration: string;
  free: boolean;
  link: string;
  description: { en: string; ta: string };
}

const RESOURCES: SkillResource[] = [
  { id: 'r1', title: { en: 'CS50: Introduction to Computer Science', ta: 'CS50: கணினி அறிவியல் அறிமுகம்' }, provider: 'Harvard (edX)', category: 'Coding', type: 'Course', duration: '10-12 weeks', free: true, link: 'https://cs50.harvard.edu', description: { en: 'The world\u2019s most popular free coding course — covers C, Python, SQL and web basics.', ta: 'உலகின் மிகவும் பிரபலமான இலவச கோடிங் பாடநெறி — C, Python, SQL மற்றும் web அடிப்படைகள்.' } },
  { id: 'r2', title: { en: 'Naan Mudhalvan \u2014 Full Stack Development', ta: 'நான் முதல்வன் \u2014 Full Stack Development' }, provider: 'Govt. of Tamil Nadu', category: 'Coding', type: 'Certification', duration: '6 weeks', free: true, link: 'https://naanmudhalvan.tn.gov.in', description: { en: 'Free, government-backed certification in web development with a recognised certificate.', ta: 'அரசு அங்கீகாரம் பெற்ற இலவச Full Stack Development சான்றிதழ் பாடநெறி.' } },
  { id: 'r3', title: { en: 'Figma for Beginners', ta: 'ஆரம்பநிலைக்கு Figma' }, provider: 'YouTube \u2014 DesignCourse', category: 'Design', type: 'Video Series', duration: '3 hours', free: true, link: 'https://www.youtube.com/results?search_query=figma+for+beginners', description: { en: 'Learn UI design fundamentals and build your first mobile app screen.', ta: 'UI வடிவமைப்பு அடிப்படைகளைக் கற்று உங்கள் முதல் mobile app திரையை உருவாக்குங்கள்.' } },
  { id: 'r4', title: { en: 'Spoken English \u2014 Beginner to Fluent', ta: 'பேசும் ஆங்கிலம் \u2014 ஆரம்பம் முதல் சரளம் வரை' }, provider: 'British Council', category: 'Communication', type: 'Course', duration: 'Self-paced', free: true, link: 'https://learnenglish.britishcouncil.org', description: { en: 'Free structured lessons to build interview-ready spoken English.', ta: 'நேர்காணலுக்குத் தயாராகும் பேசும் ஆங்கிலத்தை உருவாக்க இலவச பாடங்கள்.' } },
  { id: 'r5', title: { en: 'Quantitative Aptitude for Placements', ta: 'வேலைவாய்ப்புக்கான எண் திறன்' }, provider: 'IndiaBIX', category: 'Aptitude', type: 'Practice Set', duration: 'Self-paced', free: true, link: 'https://www.indiabix.com', description: { en: 'Practice questions covering the aptitude sections asked in most entrance exams and interviews.', ta: 'நுழைவுத் தேர்வுகள் மற்றும் நேர்காணல்களில் கேட்கப்படும் எண் திறன் பயிற்சி வினாக்கள்.' } },
  { id: 'r6', title: { en: 'ITI Electrician Trade \u2014 Full Syllabus', ta: 'ITI எலெக்ட்ரீஷியன் \u2014 முழு பாடத்திட்டம்' }, provider: 'NSDC / Skill India', category: 'Vocational', type: 'Course', duration: '1 year', free: true, link: 'https://www.skillindiadigital.gov.in', description: { en: 'Government-recognised vocational training leading straight into a trade job.', ta: 'அரசு அங்கீகரிக்கப்பட்ட தொழிற்பயிற்சி, நேரடியாக வேலைக்கு வழிவகுக்கும்.' } },
  { id: 'r7', title: { en: 'Digital Marketing Fundamentals', ta: 'டிஜிட்டல் மார்க்கெட்டிங் அடிப்படைகள்' }, provider: 'Google Digital Garage', category: 'Marketing', type: 'Certification', duration: '40 hours', free: true, link: 'https://learndigital.withgoogle.com', description: { en: 'Google\u2019s own free certificate in digital marketing, recognised by employers.', ta: 'Google-இன் சொந்த இலவச டிஜிட்டல் மார்க்கெட்டிங் சான்றிதழ்.' } },
  { id: 'r8', title: { en: 'Python for Everybody', ta: 'அனைவருக்கும் Python' }, provider: 'University of Michigan (Coursera)', category: 'Coding', type: 'Course', duration: '8 weeks', free: true, link: 'https://www.coursera.org/specializations/python', description: { en: 'Beginner-friendly Python specialization \u2014 audit for free, pay only if you want a certificate.', ta: 'ஆரம்பநிலையாளர்களுக்கு ஏற்ற Python பாடநெறி \u2014 இலவசமாகக் கற்கலாம்.' } },
  { id: 'r9', title: { en: 'Public Speaking Masterclass', ta: 'பொது பேச்சு மாஸ்டர்கிளாஸ்' }, provider: 'YouTube \u2014 Toastmasters', category: 'Communication', type: 'Video Series', duration: '2 hours', free: true, link: 'https://www.toastmasters.org', description: { en: 'Overcome stage fear and structure a confident speech for interviews and college fests.', ta: 'மேடைப் பயத்தை போக்கி நேர்காணல்களுக்கும் கல்லூரி நிகழ்ச்சிகளுக்கும் தயாராகுங்கள்.' } },
  { id: 'r10', title: { en: 'Canva for School Projects', ta: 'பள்ளித் திட்டங்களுக்கு Canva' }, provider: 'Canva Design School', category: 'Design', type: 'Video Series', duration: '1 hour', free: true, link: 'https://www.canva.com/designschool', description: { en: 'Make posters, presentations and portfolios look professional in minutes.', ta: 'போஸ்டர்கள், விளக்கக்காட்சிகள் மற்றும் போர்ட்ஃபோலியோக்களை நிமிடங்களில் தொழில்முறையாக்குங்கள்.' } },
];

const CATEGORY_ICONS: Record<ResourceCategory, React.ReactNode> = {
  Coding: <Code2 size={16} />,
  Design: <Palette size={16} />,
  Communication: <Mic2 size={16} />,
  Aptitude: <Calculator size={16} />,
  Vocational: <Wrench size={16} />,
  Marketing: <Megaphone size={16} />,
};

const CATEGORIES: (ResourceCategory | 'All')[] = ['All', 'Coding', 'Design', 'Communication', 'Aptitude', 'Vocational', 'Marketing'];

export const SkillMarketplace: React.FC<SkillMarketplaceProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ResourceCategory | 'All'>('All');
  const [saved, setSaved] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      const matchesQuery = r.title[language].toLowerCase().includes(query.toLowerCase()) || r.provider.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || r.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category, language]);

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const t = {
    title: language === 'en' ? 'Skill Marketplace' : 'திறன் சந்தை',
    subtitle: language === 'en' ? 'Free learning resources to build the skills employers want' : 'நிறுவனங்கள் தேடும் திறன்களை உருவாக்க இலவச கற்றல் வளங்கள்',
    search: language === 'en' ? 'Search courses, skills, providers...' : 'பாடநெறிகளைத் தேடுங்கள்...',
    free: language === 'en' ? 'Free' : 'இலவசம்',
    saved: language === 'en' ? 'Saved' : 'சேமிக்கப்பட்டது',
    save: language === 'en' ? 'Save' : 'சேமி',
    start: language === 'en' ? 'Start Learning' : 'கற்கத் தொடங்கு',
    noResults: language === 'en' ? 'No resources match your search.' : 'உங்கள் தேடலுக்குப் பொருந்தும் வளங்கள் இல்லை.',
    resultsCount: language === 'en' ? 'resources found' : 'வளங்கள் கிடைத்தன',
    savedTab: language === 'en' ? 'Saved Only' : 'சேமித்தவை மட்டும்',
  };

  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const displayList = showSavedOnly ? filtered.filter(r => saved.includes(r.id)) : filtered;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Store className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                category === c
                  ? 'bg-kalvi-terracotta text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {c !== 'All' && CATEGORY_ICONS[c as ResourceCategory]} {c}
            </button>
          ))}
          <button
            onClick={() => setShowSavedOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ml-auto ${
              showSavedOnly ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <BookmarkCheck size={14} /> {t.savedTab} {saved.length > 0 && `(${saved.length})`}
          </button>
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{displayList.length} {t.resultsCount}</p>

      {displayList.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-semibold">{t.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map(r => {
            const isSaved = saved.includes(r.id);
            return (
              <div key={r.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-7 border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {CATEGORY_ICONS[r.category]} {r.category}
                  </span>
                  <button onClick={() => toggleSave(r.id)} className="text-gray-400 hover:text-orange-500 transition-colors">
                    {isSaved ? <BookmarkCheck size={20} className="text-orange-500 fill-orange-100 dark:fill-orange-900/30" /> : <Bookmark size={20} />}
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{r.title[language]}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.provider}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.description[language]}</p>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={13} /> {r.duration}</span>
                  <span>{r.type}</span>
                  {r.free && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><BadgeCheck size={13} /> {t.free}</span>}
                </div>
                <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-kalvi-terracotta hover:underline">
                  {t.start} <ExternalLink size={14} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SkillMarketplace;
