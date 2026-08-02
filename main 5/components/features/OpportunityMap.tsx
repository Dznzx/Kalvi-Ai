import React, { useState, useMemo } from 'react';
import { MapPinned, Search, Building, GraduationCap, Wrench, Factory, ExternalLink, MapPin } from 'lucide-react';
import { Language } from '../../types';

interface OpportunityMapProps {
  language: Language;
}

type PlaceType = 'College' | 'ITI' | 'Skill Centre' | 'Company';

interface Place {
  id: string;
  name: { en: string; ta: string };
  type: PlaceType;
  district: string;
  focus: { en: string; ta: string };
  link: string;
}

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Hosur'];

const PLACES: Place[] = [
  { id: 'p1', name: { en: 'Anna University', ta: 'அண்ணா பல்கலைக்கழகம்' }, type: 'College', district: 'Chennai', focus: { en: 'Engineering & Technology', ta: 'பொறியியல் மற்றும் தொழில்நுட்பம்' }, link: 'https://www.annauniv.edu' },
  { id: 'p2', name: { en: 'Govt. ITI Guindy', ta: 'அரசு ITI கிண்டி' }, type: 'ITI', district: 'Chennai', focus: { en: 'Electrician, Fitter, Machinist trades', ta: 'எலெக்ட்ரீஷியன், ஃபிட்டர் தொழில்கள்' }, link: 'https://itiguindy.tn.gov.in' },
  { id: 'p3', name: { en: 'Naan Mudhalvan Skill Centre', ta: 'நான் முதல்வன் திறன் மையம்' }, type: 'Skill Centre', district: 'Chennai', focus: { en: 'Coding, AI, digital skills bootcamps', ta: 'கோடிங், AI, டிஜிட்டல் திறன் பயிற்சி' }, link: 'https://naanmudhalvan.tn.gov.in' },
  { id: 'p4', name: { en: 'Zoho Corporation', ta: 'Zoho நிறுவனம்' }, type: 'Company', district: 'Chennai', focus: { en: 'Software products, hires from local schools/ITI', ta: 'மென்பொருள் தயாரிப்புகள், உள்ளூர் பள்ளிகளிலிருந்து பணியமர்த்தல்' }, link: 'https://www.zoho.com' },
  { id: 'p5', name: { en: 'PSG College of Technology', ta: 'PSG தொழில்நுட்பக் கல்லூரி' }, type: 'College', district: 'Coimbatore', focus: { en: 'Engineering, Textile Technology', ta: 'பொறியியல், ஜவுளி தொழில்நுட்பம்' }, link: 'https://www.psgtech.edu' },
  { id: 'p6', name: { en: 'Govt. ITI Coimbatore', ta: 'அரசு ITI கோயம்புத்தூர்' }, type: 'ITI', district: 'Coimbatore', focus: { en: 'Turner, Welder, Electronics trades', ta: 'டர்னர், வெல்டர், எலக்ட்ரானிக்ஸ் தொழில்கள்' }, link: 'https://dget.gov.in' },
  { id: 'p7', name: { en: 'CODISSIA Skill Development Centre', ta: 'CODISSIA திறன் மேம்பாட்டு மையம்' }, type: 'Skill Centre', district: 'Coimbatore', focus: { en: 'Industrial and manufacturing skills', ta: 'தொழில்துறை மற்றும் உற்பத்தி திறன்கள்' }, link: 'https://www.codissia.com' },
  { id: 'p8', name: { en: 'KG Fabriks', ta: 'KG ஃபேப்ரிக்ஸ்' }, type: 'Company', district: 'Coimbatore', focus: { en: 'Textile manufacturing, apprenticeships', ta: 'ஜவுளி உற்பத்தி, பயிற்சி வேலைகள்' }, link: 'https://www.kgfabriks.com' },
  { id: 'p9', name: { en: 'Madurai Kamaraj University', ta: 'மதுரை காமராஜர் பல்கலைக்கழகம்' }, type: 'College', district: 'Madurai', focus: { en: 'Arts, Science, Management', ta: 'கலை, அறிவியல், மேலாண்மை' }, link: 'https://mkuniversity.ac.in' },
  { id: 'p10', name: { en: 'Govt. ITI Madurai', ta: 'அரசு ITI மதுரை' }, type: 'ITI', district: 'Madurai', focus: { en: 'Mechanic, Diesel, COPA trades', ta: 'மெக்கானிக், டீசல், COPA தொழில்கள்' }, link: 'https://dget.gov.in' },
  { id: 'p11', name: { en: 'TVS Motor Company', ta: 'TVS மோட்டார் நிறுவனம்' }, type: 'Company', district: 'Hosur', focus: { en: 'Automotive manufacturing, ITI apprenticeships', ta: 'வாகன உற்பத்தி, ITI பயிற்சி வேலைகள்' }, link: 'https://www.tvsmotor.com' },
  { id: 'p12', name: { en: 'BHEL Trichy', ta: 'BHEL திருச்சி' }, type: 'Company', district: 'Trichy', focus: { en: 'Heavy electrical equipment, apprenticeships', ta: 'கனரக மின் உபகரணங்கள், பயிற்சி வேலைகள்' }, link: 'https://www.bhel.com' },
  { id: 'p13', name: { en: 'National Institute of Technology, Trichy', ta: 'தேசிய தொழில்நுட்பக் கழகம், திருச்சி' }, type: 'College', district: 'Trichy', focus: { en: 'Engineering, top-ranked NIT', ta: 'பொறியியல், முதன்மை NIT' }, link: 'https://www.nitt.edu' },
  { id: 'p14', name: { en: 'Govt. ITI Salem', ta: 'அரசு ITI சேலம்' }, type: 'ITI', district: 'Salem', focus: { en: 'Fitter, Electrician, Welder trades', ta: 'ஃபிட்டர், எலெக்ட்ரீஷியன் தொழில்கள்' }, link: 'https://dget.gov.in' },
  { id: 'p15', name: { en: 'Salem Steel Plant (SAIL)', ta: 'சேலம் எஃகு ஆலை (SAIL)' }, type: 'Company', district: 'Salem', focus: { en: 'Steel manufacturing, technical apprenticeships', ta: 'எஃகு உற்பத்தி, தொழில்நுட்ப பயிற்சி வேலைகள்' }, link: 'https://www.sail.co.in' },
  { id: 'p16', name: { en: 'Manonmaniam Sundaranar University', ta: 'மனோன்மணியம் சுந்தரனார் பல்கலைக்கழகம்' }, type: 'College', district: 'Tirunelveli', focus: { en: 'Arts, Science, Marine Biology', ta: 'கலை, அறிவியல், கடல்வாழ் உயிரியல்' }, link: 'https://www.msuniv.ac.in' },
  { id: 'p17', name: { en: 'Vellore Institute of Technology', ta: 'வேலூர் தொழில்நுட்ப நிறுவனம்' }, type: 'College', district: 'Vellore', focus: { en: 'Engineering, Biotechnology, Design', ta: 'பொறியியல், உயிரி தொழில்நுட்பம், வடிவமைப்பு' }, link: 'https://vit.ac.in' },
  { id: 'p18', name: { en: 'Govt. ITI Erode', ta: 'அரசு ITI ஈரோடு' }, type: 'ITI', district: 'Erode', focus: { en: 'Textile machinery, Electronics trades', ta: 'ஜவுளி இயந்திரங்கள், எலக்ட்ரானிக்ஸ் தொழில்கள்' }, link: 'https://dget.gov.in' },
];

const TYPE_ICONS: Record<PlaceType, React.ReactNode> = {
  College: <GraduationCap size={16} />, ITI: <Wrench size={16} />, 'Skill Centre': <Building size={16} />, Company: <Factory size={16} />,
};

const TYPE_COLORS: Record<PlaceType, string> = {
  College: 'bg-indigo-500', ITI: 'bg-orange-500', 'Skill Centre': 'bg-purple-500', Company: 'bg-emerald-500',
};

const TYPES: (PlaceType | 'All')[] = ['All', 'College', 'ITI', 'Skill Centre', 'Company'];

export const OpportunityMap: React.FC<OpportunityMapProps> = ({ language }) => {
  const [district, setDistrict] = useState<string>('All');
  const [type, setType] = useState<PlaceType | 'All'>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return PLACES.filter(p => {
      const matchesDistrict = district === 'All' || p.district === district;
      const matchesType = type === 'All' || p.type === type;
      const matchesQuery = p.name[language].toLowerCase().includes(query.toLowerCase()) || p.focus[language].toLowerCase().includes(query.toLowerCase());
      return matchesDistrict && matchesType && matchesQuery;
    });
  }, [district, type, query, language]);

  const t = {
    title: language === 'en' ? 'Opportunity Map' : 'வாய்ப்பு வரைபடம்',
    subtitle: language === 'en' ? 'Colleges, ITIs, skill centres and companies near you, by district' : 'உங்கள் மாவட்டத்தில் உள்ள கல்லூரிகள், ITI, திறன் மையங்கள் மற்றும் நிறுவனங்கள்',
    search: language === 'en' ? 'Search by name or focus area...' : 'பெயர் அல்லது தொழில் பகுதி மூலம் தேடுங்கள்...',
    allDistricts: language === 'en' ? 'All Districts' : 'அனைத்து மாவட்டங்கள்',
    visit: language === 'en' ? 'Visit Website' : 'இணையதளத்தைப் பார்வையிடவும்',
    noResults: language === 'en' ? 'No results in this district/category yet. Try a different filter.' : 'இந்த மாவட்டத்தில்/வகையில் முடிவுகள் இல்லை. வேறு வடிகட்டியை முயற்சிக்கவும்.',
    resultsCount: language === 'en' ? 'places found' : 'இடங்கள் கிடைத்தன',
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <MapPinned className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.allDistricts}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setDistrict('All')} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all flex items-center gap-1 ${district === 'All' ? 'bg-kalvi-terracotta text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
              <MapPin size={12} /> {t.allDistricts}
            </button>
            {DISTRICTS.map(d => (
              <button key={d} onClick={() => setDistrict(d)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${district === d ? 'bg-kalvi-terracotta text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map(ty => (
            <button key={ty} onClick={() => setType(ty)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${type === ty ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400'}`}>
              {ty !== 'All' && TYPE_ICONS[ty as PlaceType]} {ty}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{filtered.length} {t.resultsCount}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-semibold">{t.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className={`${TYPE_COLORS[p.type]} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5`}>
                  {TYPE_ICONS[p.type]} {p.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-400"><MapPin size={13} /> {p.district}</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{p.name[language]}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{p.focus[language]}</p>
              </div>
              <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-kalvi-terracotta hover:underline">
                {t.visit} <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityMap;
