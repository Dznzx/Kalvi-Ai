import React, { useState, useMemo } from 'react';
import { Briefcase, Search, ExternalLink, Calendar, MapPin, Wallet, Laptop, Building2, Filter } from 'lucide-react';
import { Language, GradeGroup } from '../../types';

interface InternshipFinderProps {
  language: Language;
  studentGrade: GradeGroup;
}

type InternshipMode = 'Remote' | 'In-Person' | 'Hybrid';
type InternshipCategory = 'Technology' | 'Research' | 'Government' | 'NGO' | 'Media' | 'Business';

interface Internship {
  id: string;
  title: { en: string; ta: string };
  org: string;
  category: InternshipCategory;
  mode: InternshipMode;
  district: string;
  duration: string;
  stipend: string;
  minGrade: GradeGroup[];
  deadline: string;
  link: string;
  description: { en: string; ta: string };
}

const INTERNSHIPS: Internship[] = [
  {
    id: 'i1', title: { en: 'Summer Research Intern \u2014 AI Basics', ta: 'கோடை ஆராய்ச்சி பயிற்சியாளர் \u2014 AI அடிப்படைகள்' },
    org: 'IIT Madras Outreach Programme', category: 'Research', mode: 'Hybrid', district: 'Chennai',
    duration: '4 weeks', stipend: '\u20B95,000 + certificate', minGrade: ['11-12', '9-12'],
    deadline: '15 May 2027', link: 'https://www.iitm.ac.in',
    description: { en: 'Hands-on introduction to AI research for pre-university students, mentored by IIT-M faculty.', ta: 'IIT-M ஆசிரியர்களின் வழிகாட்டுதலில் AI ஆராய்ச்சி அறிமுகம்.' },
  },
  {
    id: 'i2', title: { en: 'School Digital Reporter Internship', ta: 'பள்ளி டிஜிட்டல் நிருபர் பயிற்சி' },
    org: 'The Better India', category: 'Media', mode: 'Remote', district: 'Any District',
    duration: '6 weeks', stipend: 'Unpaid + certificate', minGrade: ['9-10', '11-12', '9-12'],
    deadline: 'Rolling', link: 'https://www.thebetterindia.com',
    description: { en: 'Write and report on local positive-impact stories from your school or town.', ta: 'உங்கள் பள்ளி அல்லது ஊரின் நேர்மறையான கதைகளை எழுதி அறிக்கை செய்யுங்கள்.' },
  },
  {
    id: 'i3', title: { en: 'TN e-Governance Summer Intern', ta: 'தமிழ்நாடு மின்-நிர்வாக கோடை பயிற்சி' },
    org: 'TN e-Governance Agency', category: 'Government', mode: 'In-Person', district: 'Chennai',
    duration: '8 weeks', stipend: '\u20B98,000', minGrade: ['11-12', '9-12'],
    deadline: '30 Apr 2027', link: 'https://www.tnega.tn.gov.in',
    description: { en: 'Assist government departments in digitising citizen services \u2014 great civil-services exposure.', ta: 'குடிமக்கள் சேவைகளை டிஜிட்டல் மயமாக்க அரசு துறைகளுக்கு உதவுங்கள்.' },
  },
  {
    id: 'i4', title: { en: 'NGO Field Volunteer \u2014 Rural Education', ta: 'NGO களப் பணியாளர் \u2014 கிராமப்புற கல்வி' },
    org: 'Isha Vidhya', category: 'NGO', mode: 'In-Person', district: 'Coimbatore',
    duration: '2 weeks (vacation)', stipend: 'Unpaid + certificate', minGrade: ['9-10', '11-12', '9-12'],
    deadline: 'Rolling', link: 'https://www.ishavidhya.org',
    description: { en: 'Support teaching and events at rural government schools during your school holidays.', ta: 'விடுமுறையில் கிராமப்புற அரசுப் பள்ளிகளில் கற்பித்தலுக்கு உதவுங்கள்.' },
  },
  {
    id: 'i5', title: { en: 'Junior Web Developer Intern', ta: 'இளநிலை Web Developer பயிற்சி' },
    org: 'Zoho Corp \u2014 Schools Programme', category: 'Technology', mode: 'Hybrid', district: 'Chennai',
    duration: '6 weeks', stipend: '\u20B910,000 + certificate', minGrade: ['11-12', '9-12'],
    deadline: '10 Jun 2027', link: 'https://www.zoho.com/careers',
    description: { en: 'Build a real mini-project under a Zoho engineer\u2019s mentorship. Basic HTML/CSS/JS helpful.', ta: 'Zoho பொறியாளரின் வழிகாட்டுதலில் ஒரு சிறு திட்டத்தை உருவாக்குங்கள்.' },
  },
  {
    id: 'i6', title: { en: 'Retail & Sales Intern', ta: 'சில்லறை விற்பனை பயிற்சி' },
    org: 'Reliance Retail', category: 'Business', mode: 'In-Person', district: 'Madurai',
    duration: '4 weeks', stipend: '\u20B96,000', minGrade: ['11-12', '9-12'],
    deadline: '20 May 2027', link: 'https://www.ril.com/careers',
    description: { en: 'Learn business basics \u2014 customer service, inventory and sales \u2014 at a local outlet.', ta: 'உள்ளூர் அங்காடியில் வாடிக்கையாளர் சேவை, சரக்கு மற்றும் விற்பனை அடிப்படைகளைக் கற்கவும்.' },
  },
  {
    id: 'i7', title: { en: 'Content & Social Media Intern', ta: 'உள்ளடக்கம் & சமூக ஊடக பயிற்சி' },
    org: 'Vikatan Group', category: 'Media', mode: 'Remote', district: 'Any District',
    duration: '4 weeks', stipend: '\u20B93,000', minGrade: ['11-12', '9-12'],
    deadline: '5 Jun 2027', link: 'https://www.vikatan.com',
    description: { en: 'Create Tamil-language social content for a leading regional media house.', ta: 'முன்னணி பிராந்திய ஊடக நிறுவனத்திற்காக தமிழ் சமூக ஊடக உள்ளடக்கத்தை உருவாக்குங்கள்.' },
  },
  {
    id: 'i8', title: { en: 'Young Innovators Lab', ta: 'இளம் புதுமையாளர் ஆய்வகம்' },
    org: 'Atal Innovation Mission', category: 'Research', mode: 'In-Person', district: 'Trichy',
    duration: '3 weeks', stipend: 'Unpaid + certificate + kit', minGrade: ['9-10', '11-12', '9-12'],
    deadline: '1 May 2027', link: 'https://aim.gov.in',
    description: { en: 'Prototype a real-world solution using the Atal Tinkering Lab equipment in your district.', ta: 'உங்கள் மாவட்ட Atal Tinkering Lab உபகரணங்களைப் பயன்படுத்தி ஒரு தீர்வை உருவாக்குங்கள்.' },
  },
];

const CATEGORY_ICONS: Record<InternshipCategory, React.ReactNode> = {
  Technology: <Laptop size={14} />, Research: <Filter size={14} />, Government: <Building2 size={14} />,
  NGO: <Building2 size={14} />, Media: <Laptop size={14} />, Business: <Briefcase size={14} />,
};

const MODE_COLORS: Record<InternshipMode, string> = {
  Remote: 'bg-blue-500', 'In-Person': 'bg-orange-500', Hybrid: 'bg-purple-500',
};

const CATEGORIES: (InternshipCategory | 'All')[] = ['All', 'Technology', 'Research', 'Government', 'NGO', 'Media', 'Business'];

export const InternshipFinder: React.FC<InternshipFinderProps> = ({ language, studentGrade }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<InternshipCategory | 'All'>('All');
  const [mode, setMode] = useState<InternshipMode | 'All'>('All');
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter(i => {
      const matchesQuery = i.title[language].toLowerCase().includes(query.toLowerCase()) || i.org.toLowerCase().includes(query.toLowerCase()) || i.district.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || i.category === category;
      const matchesMode = mode === 'All' || i.mode === mode;
      const matchesGrade = !showOnlyEligible || i.minGrade.includes(studentGrade);
      return matchesQuery && matchesCategory && matchesMode && matchesGrade;
    });
  }, [query, category, mode, showOnlyEligible, studentGrade, language]);

  const t = {
    title: language === 'en' ? 'Internship Finder' : 'பயிற்சி வேலை தேடல்',
    subtitle: language === 'en' ? 'School and college internships matched to your grade' : 'உங்கள் வகுப்புக்கு ஏற்ற பள்ளி மற்றும் கல்லூரி பயிற்சி வேலைகள்',
    search: language === 'en' ? 'Search internships, organizations, districts...' : 'பயிற்சி வேலைகளைத் தேடுங்கள்...',
    eligibleOnly: language === 'en' ? 'Eligible for my grade' : 'என் வகுப்புக்குத் தகுதி',
    deadline: language === 'en' ? 'Apply by' : 'விண்ணப்பிக்க வேண்டிய தேதி',
    viewDetails: language === 'en' ? 'View & Apply' : 'பார்வையிட்டு விண்ணப்பிக்கவும்',
    noResults: language === 'en' ? 'No internships match your filters yet. Try widening your search.' : 'பயிற்சி வேலைகள் இல்லை. தேடலை விரிவுபடுத்துங்கள்.',
    resultsCount: language === 'en' ? 'matches found' : 'பொருத்தமானவை கிடைத்தன',
    allModes: language === 'en' ? 'All Modes' : 'அனைத்து முறைகள்',
  };

  const modes: (InternshipMode | 'All')[] = ['All', 'Remote', 'In-Person', 'Hybrid'];

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Briefcase className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white" />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${category === c ? 'bg-kalvi-terracotta text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{c}</button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {modes.map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${mode === m ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400'}`}>{m === 'All' ? t.allModes : m}</button>
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
          {filtered.map(i => (
            <div key={i.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-7 border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className={`${MODE_COLORS[i.mode]} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1`}>{i.mode}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400"><Calendar size={13} /> {i.deadline}</div>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{i.title[language]}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">{CATEGORY_ICONS[i.category]} {i.org}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={13} /> {i.district}</span>
                <span>{i.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                <Wallet size={16} /> {i.stipend}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{i.description[language]}</p>
              <a href={i.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-kalvi-terracotta hover:underline">
                {t.viewDetails} <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternshipFinder;
