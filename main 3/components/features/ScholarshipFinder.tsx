import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, ExternalLink, Calendar, Wallet, Filter, MapPin } from 'lucide-react';
import { Language, GradeGroup } from '../../types';

interface ScholarshipFinderProps {
  language: Language;
  studentGrade: GradeGroup;
}

type ScholarshipCategory = 'TN Government' | 'Central Government' | 'NGO' | 'CSR';

interface Scholarship {
  id: string;
  name: { en: string; ta: string };
  provider: { en: string; ta: string };
  category: ScholarshipCategory;
  amount: string;
  eligibility: { en: string; ta: string };
  deadline: string;
  link: string;
  minGrade: GradeGroup[];
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 's1',
    name: { en: 'TN Chief Minister\u2019s Merit Scholarship', ta: '\u0BA4.\u0BA8. \u0BAE\u0BC1\u0BA4\u0BB2\u0BAE\u0BC8\u0B9A\u0BCD\u0B9A\u0BB0\u0BCD \u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE \u0BB2\u0BC1' },
    provider: { en: 'Government of Tamil Nadu', ta: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1 \u0B85\u0BB0\u0B9A\u0BC1' },
    category: 'TN Government',
    amount: '\u20B95,000 \u2013 \u20B915,000 / year',
    eligibility: { en: 'Family income below \u20B92.5L, 75%+ marks in Class 10', ta: '\u0B95\u0BC1\u0B9F\u0BC1\u0BAE\u0BCD\u0BAA \u0BB5\u0BB0\u0BC1\u0BAE\u0BBE\u0BA9\u0BAE\u0BCD \u20B92.5\u0BB2\u0BC1\u0B9F\u0BC0\u0B95\u0BC1 \u0B95\u0BC1\u0BB1\u0BC8\u0BB5\u0BC1, 10\u0BAE\u0BCD \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BBF\u0BB2\u0BCD 75%+' },
    deadline: '15 Sep 2026',
    link: 'https://tn.gov.in',
    minGrade: ['9-10', '11-12', '9-12'],
  },
  {
    id: 's2',
    name: { en: 'National Means-cum-Merit Scholarship (NMMSS)', ta: '\u0BA4\u0BC7\u0F0Db\u0BBF\u0BAF \u0BA4\u0BC0\u0BA4\u0BC1 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BA4\u0BB0 \u0BB5\u0BC1\u0BB2\u0BAE\u0BBE \u0BB2\u0BC1 (NMMSS)' },
    provider: { en: 'Ministry of Education, Govt. of India', ta: '\u0B95\u0BB2\u0BCD\u0BB5\u0BBF \u0B85\u0BAE\u0BC8\u0B9A\u0BCD\u0B9A\u0BC1, \u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF \u0B85\u0BB0\u0B9A\u0BC1' },
    category: 'Central Government',
    amount: '\u20B912,000 / year',
    eligibility: { en: 'Class 9 & 10 students, family income below \u20B93.5L', ta: '9 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD 10\u0BAE\u0BCD \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1 \u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD\u0B95\u0BB3\u0BCD, \u0B95\u0BC1\u0B9F\u0BC1\u0BAE\u0BCD\u0BAA \u0BB5\u0BB0\u0BC1\u0BAE\u0BBE\u0BA9\u0BAE\u0BCD \u20B93.5\u0BB2\u0BC1\u0B9F\u0BC0\u0B95\u0BC1 \u0B95\u0BC1\u0BB1\u0BC8\u0BB5\u0BC1' },
    deadline: '30 Oct 2026',
    link: 'https://scholarships.gov.in',
    minGrade: ['9-10', '9-12'],
  },
  {
    id: 's3',
    name: { en: 'Post-Matric Scholarship for SC/ST Students', ta: '\u0B87\u0B9F\u0BA4\u0BC1 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BAA\u0BB1\u0BCD\u0BB1\u0BBF\u0BB5\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BBE\u0BA9 \u0BAA\u0BBF\u0BA9\u0BCD-\u0BAE\u0BC7\u0B9F\u0BCD\u0BB0\u0BBF\u0B95\u0BCD \u0BB5\u0BBF\u0BB2\u0BC1\u0BB5\u0BBF\u0BB2\u0BC7\u0BAF\u0BC1\u0BB2\u0BCD \u0BB2\u0BC1' },
    provider: { en: 'Social Welfare Dept, Govt. of India', ta: '\u0B9A\u0BAE\u0BC2\u0B95 \u0BA8\u0BB2\u0BA9\u0BCD \u0BA4\u0BC1\u0BB1\u0BC8, \u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF \u0B85\u0BB0\u0B9A\u0BC1' },
    category: 'Central Government',
    amount: 'Up to \u20B930,000 / year',
    eligibility: { en: 'SC/ST students, Class 11 & above', ta: 'SC/ST \u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD\u0B95\u0BB3\u0BCD, 11\u0BAE\u0BCD \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1 \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD \u0BAE\u0BC7\u0BB2\u0BCD' },
    deadline: '31 Dec 2026',
    link: 'https://scholarships.gov.in',
    minGrade: ['11-12', '9-12'],
  },
  {
    id: 's4',
    name: { en: 'Naan Mudhalvan Skill Scholarship', ta: '\u0BA8\u0BBE\u0BA9\u0BCD \u0BAE\u0BC1\u0BA4\u0BB2\u0BCD\u0BB5\u0BA9\u0BCD \u0BA4\u0BBF\u0BB1\u0BAE\u0BC8 \u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE \u0BB2\u0BC1' },
    provider: { en: 'Tamil Nadu Skill Development Corp', ta: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1 \u0BA4\u0BBF\u0BB1\u0BA9\u0BCD \u0BAE\u0BC7\u0BAE\u0BCD\u0BAA\u0BBE\u0B9F\u0BCD\u0BB2\u0BCD \u0B95\u0BBE\u0BB0\u0BCD\u0BAA\u0BCD' },
    category: 'TN Government',
    amount: 'Free certification + \u20B92,000 stipend',
    eligibility: { en: 'Class 9\u201312, any board, no income cap', ta: '9\u201312\u0BB5\u0BA4\u0BC1 \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1, \u0BA8\u0BC7 \u0BB5\u0BB0\u0BC1\u0BAE\u0BBE\u0BA9\u0BAE\u0BCD \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1 \u0BA8\u0BBF\u0BB2\u0BC8' },
    deadline: 'Rolling admissions',
    link: 'https://naanmudhalvan.tn.gov.in',
    minGrade: ['9-10', '11-12', '9-12'],
  },
  {
    id: 's5',
    name: { en: 'Reliance Foundation Scholarship', ta: '\u0BB0\u0BBF\u0BB2\u0BC8\u0BAF\u0BA9\u0BCD\u0BB8\u0CDD \u0B85\u0BB1\u0BAA\u0BCD\u0BAA\u0BA3\u0BBF \u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE \u0BB2\u0BC1' },
    provider: { en: 'Reliance Foundation (CSR)', ta: '\u0BB0\u0BBF\u0BB2\u0BC8\u0BAF\u0BA9\u0BCD\u0BB8\u0CDD \u0B85\u0BB1\u0BAA\u0BCD\u0BAA\u0BA3\u0BBF (CSR)' },
    category: 'CSR',
    amount: '\u20B910,000 one-time',
    eligibility: { en: 'Class 10 pass, pursuing further studies', ta: '10\u0BAE\u0BCD \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1 \u0BA4\u0BC7\u0BB0\u0BCD\u0BB5\u0BC1, \u0BA4\u0BCA\u0B9F\u0BB0\u0BCD \u0BAA\u0B9F\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1 \u0BAA\u0BAF\u0BBF\u0BB2\u0BC1\u0BAE\u0BCD \u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1' },
    deadline: '20 Nov 2026',
    link: 'https://www.reliancefoundation.org',
    minGrade: ['11-12', '9-12'],
  },
  {
    id: 's6',
    name: { en: 'Isha Vidhya Merit Aid', ta: '\u0B88\u0B9A\u0BBE \u0BB5\u0BBF\u0BA4\u0BCD\u0BAF\u0BBE \u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE \u0BA8\u0BBF\u0BA4\u0BBF \u0BB5\u0BB2\u0BC1' },
    provider: { en: 'Isha Foundation (NGO)', ta: '\u0B88\u0B9A\u0BBE \u0B85\u0BB1\u0BAA\u0BCD\u0BAA\u0BA3\u0BBF (NGO)' },
    category: 'NGO',
    amount: '100% fee waiver (need-based)',
    eligibility: { en: 'Rural background, 60%+ marks', ta: '\u0B95\u0BBF\u0BB0\u0BBE\u0BAE\u0BAA\u0BCD\u0BAA\u0BC1\u0BB1 \u0BAA\u0BBF\u0BB1\u0BCD\u0BB2\u0BCD, 60%+ \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC6\u0BA3\u0BCD' },
    deadline: '10 Aug 2026',
    link: 'https://www.ishavidhya.org',
    minGrade: ['6-8', '9-10', '9-12'],
  },
];

const CATEGORY_COLORS: Record<ScholarshipCategory, string> = {
  'TN Government': 'bg-emerald-500',
  'Central Government': 'bg-indigo-500',
  'NGO': 'bg-purple-500',
  'CSR': 'bg-orange-500',
};

export const ScholarshipFinder: React.FC<ScholarshipFinderProps> = ({ language, studentGrade }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ScholarshipCategory | 'All'>('All');
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);

  const categories: (ScholarshipCategory | 'All')[] = ['All', 'TN Government', 'Central Government', 'NGO', 'CSR'];

  const filtered = useMemo(() => {
    return SCHOLARSHIPS.filter(s => {
      const matchesQuery = s.name[language].toLowerCase().includes(query.toLowerCase()) ||
        s.provider[language].toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesGrade = !showOnlyEligible || s.minGrade.includes(studentGrade);
      return matchesQuery && matchesCategory && matchesGrade;
    });
  }, [query, activeCategory, showOnlyEligible, studentGrade, language]);

  const t = {
    title: { en: 'Scholarship Finder', ta: '\u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE \u0BA4\u0BC7\u0B9F\u0BB2\u0BCD' }[language],
    subtitle: { en: 'Matched TN, Central, NGO and CSR scholarships for you', ta: '\u0BA4.\u0BA8., \u0BAE\u0BC8\u0BAF, NGO \u0BAE\u0BB1\u0BCD\u0BB1\u0BC1\u0BAE\u0BCD CSR \u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE\u0B95\u0BB3\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BAA\u0BCD\u0BAA\u0BA4\u0BCD\u0BA4\u0BA9' }[language],
    search: { en: 'Search scholarships...', ta: '\u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE\u0B95\u0BB3\u0BC8\u0BA4\u0BCD \u0BA4\u0BC7\u0B9F...' }[language],
    eligibleOnly: { en: 'Eligible for my grade', ta: '\u0B8E\u0BA9\u0BCD \u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0BA4\u0B95\u0BC1\u0BA4\u0BBF' }[language],
    deadline: { en: 'Deadline', ta: '\u0B95\u0BC1\u0BB1\u0BBF\u0BAF\u0BC0\u0B9F\u0BC1 \u0BA4\u0BC7\u0BA4\u0BBF' }[language],
    viewDetails: { en: 'View & Apply', ta: '\u0BAA\u0BBE\u0BB0\u0BCD\u0BB5\u0BC8\u0BAF\u0BBF\u0B9F\u0BC1 & \u0BB5\u0BBF\u0BA3\u0BCD\u0BA3\u0BAA\u0BCD\u0BAA\u0BBF\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD' }[language],
    noResults: { en: 'No scholarships match your filters yet. Try widening your search.', ta: '\u0BA4\u0BC1\u0BA3\u0BC8\u0BAE\u0BBE\u0B95\u0BB3\u0BCD \u0B87\u0BB2\u0BCD\u0BB2\u0BC8. \u0BAA\u0BB0\u0BBF\u0BAA\u0BCD\u0BAA\u0BC8 \u0BB5\u0BBF\u0BB0\u0BBF\u0BB5\u0BC1\u0BAA\u0BC1\u0BB1\u0BC1\u0BAE\u0BCD.' }[language],
    resultsCount: { en: 'matches found', ta: '\u0BAA\u0BCA\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BAE\u0BBE\u0BA9\u0BB5\u0BC8 \u0B95\u0BBF\u0B9F\u0BC8\u0BA4\u0BCD\u0BA4\u0BA9' }[language],
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <GraduationCap className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-kalvi-terracotta text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer w-fit">
          <input type="checkbox" checked={showOnlyEligible} onChange={(e) => setShowOnlyEligible(e.target.checked)} className="w-4 h-4 accent-orange-600" />
          <Filter size={14} /> {t.eligibleOnly}
        </label>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{filtered.length} {t.resultsCount}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-semibold">{t.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-7 border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className={`${CATEGORY_COLORS[s.category]} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full`}>{s.category}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400"><Calendar size={13} /> {s.deadline}</div>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{s.name[language]}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.provider[language]}</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                <Wallet size={16} /> {s.amount}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{s.eligibility[language]}</p>
              <a href={s.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-kalvi-terracotta hover:underline">
                {t.viewDetails} <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipFinder;
