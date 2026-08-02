import React, { useState, useMemo } from 'react';
import { Users, Search, Star, MessageCircle, Briefcase, MapPin, CheckCircle2, X, Send } from 'lucide-react';
import { Language } from '../../types';

interface MentorMarketplaceProps {
  language: Language;
}

interface Mentor {
  id: string;
  name: string;
  role: { en: string; ta: string };
  company: string;
  field: string;
  district: string;
  rating: number;
  sessions: number;
  bio: { en: string; ta: string };
  avatarColor: string;
  verified: boolean;
}

const MENTORS: Mentor[] = [
  { id: 'm1', name: 'Priyanka R.', role: { en: 'Software Engineer', ta: 'மென்பொருள் பொறியாளர்' }, company: 'Zoho Corp', field: 'Technology', district: 'Chennai', rating: 4.9, sessions: 128, bio: { en: 'Alumna of a govt school in Villupuram, now building products at Zoho. Loves helping first-gen learners break into tech.', ta: 'விழுப்புரம் அரசு பள்ளியில் படித்தவர், இப்போது Zoho-வில் பணிபுரிகிறார். தொழில்நுட்பத் துறையில் நுழைய மாணவர்களுக்கு உதவுகிறார்.' }, avatarColor: 'bg-blue-500', verified: true },
  { id: 'm2', name: 'Dr. Aravind K.', role: { en: 'Medical Officer', ta: 'மருத்துவ அதிகாரி' }, company: 'Govt. Hospital Madurai', field: 'Medicine', district: 'Madurai', rating: 4.8, sessions: 76, bio: { en: 'MBBS from a govt medical college. Guides students on NEET prep and the path to becoming a doctor.', ta: 'அரசு மருத்துவக் கல்லூரியில் MBBS படித்தவர். NEET தேர்வுக்கும் மருத்துவராகும் பாதைக்கும் வழிகாட்டுகிறார்.' }, avatarColor: 'bg-emerald-500', verified: true },
  { id: 'm3', name: 'Suresh M.', role: { en: 'Mechanical Design Engineer', ta: 'இயந்திரவியல் வடிவமைப்பு பொறியாளர்' }, company: 'TVS Motor Company', field: 'Engineering', district: 'Hosur', rating: 4.7, sessions: 54, bio: { en: 'ITI to Diploma to Engineer — shares the exact vocational path for students not going the pure academic route.', ta: 'ITI-லிருந்து டிப்ளமா, பின் பொறியாளராக ஆனவர். கல்வித் துறை மட்டுமல்லாத பாதையை விளக்குகிறார்.' }, avatarColor: 'bg-orange-500', verified: true },
  { id: 'm4', name: 'Divya S.', role: { en: 'UI/UX Designer', ta: 'UI/UX வடிவமைப்பாளர்' }, company: 'Freshworks', field: 'Design', district: 'Chennai', rating: 5.0, sessions: 41, bio: { en: 'Self-taught designer, now leads a product team. Mentors on design portfolios and career switches.', ta: 'தானாகக் கற்றுத் தேர்ந்த வடிவமைப்பாளர், இப்போது ஒரு குழுவை வழிநடத்துகிறார். போர்ட்ஃபோலியோ மற்றும் தொழில் மாற்றத்தில் வழிகாட்டுகிறார்.' }, avatarColor: 'bg-purple-500', verified: true },
  { id: 'm5', name: 'Karthik V.', role: { en: 'Civil Services Aspirant (Cleared Prelims)', ta: 'குடிமைப் பணி விரும்பி (பிரிலிம்ஸ் தேர்ச்சி)' }, company: 'IAS Academy', field: 'Civil Services', district: 'Trichy', rating: 4.6, sessions: 33, bio: { en: 'First-gen aspirant guiding juniors on UPSC/TNPSC prep strategy, books, and time management.', ta: 'UPSC/TNPSC தேர்வு உத்தி, புத்தகங்கள் மற்றும் நேர மேலாண்மையில் இளையவர்களுக்கு வழிகாட்டுகிறார்.' }, avatarColor: 'bg-indigo-500', verified: false },
  { id: 'm6', name: 'Meena T.', role: { en: 'Chartered Accountant', ta: 'சார்டர்டு அக்கவுண்டன்ட்' }, company: 'Deloitte India', field: 'Commerce', district: 'Coimbatore', rating: 4.9, sessions: 89, bio: { en: 'CA from a govt school background. Mentors students on the commerce stream and CA/CMA path.', ta: 'அரசுப் பள்ளிப் பின்னணியில் இருந்து CA ஆனவர். வணிகப் பிரிவு மற்றும் CA/CMA பாதையில் வழிகாட்டுகிறார்.' }, avatarColor: 'bg-rose-500', verified: true },
];

const FIELDS = ['All', 'Technology', 'Medicine', 'Engineering', 'Design', 'Civil Services', 'Commerce'];

export const MentorMarketplace: React.FC<MentorMarketplaceProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('All');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => {
    return MENTORS.filter(m => {
      const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.role[language].toLowerCase().includes(query.toLowerCase()) || m.company.toLowerCase().includes(query.toLowerCase());
      const matchesField = field === 'All' || m.field === field;
      return matchesQuery && matchesField;
    });
  }, [query, field, language]);

  const t = {
    title: language === 'en' ? 'Mentor Marketplace' : 'வழிகாட்டி சந்தை',
    subtitle: language === 'en' ? 'Connect with alumni and professionals who started where you are' : 'உங்களைப் போலவே தொடங்கிய முன்னாள் மாணவர்கள் மற்றும் நிபுணர்களுடன் இணையுங்கள்',
    search: language === 'en' ? 'Search mentors, roles, companies...' : 'வழிகாட்டிகளைத் தேடுங்கள்...',
    sessions: language === 'en' ? 'sessions' : 'அமர்வுகள்',
    requestMentorship: language === 'en' ? 'Request Mentorship' : 'வழிகாட்டுதலைக் கோருங்கள்',
    close: language === 'en' ? 'Close' : 'மூடு',
    messagePlaceholder: language === 'en' ? 'Introduce yourself and what you\u2019d like guidance on...' : 'உங்களை அறிமுகப்படுத்தி என்ன வழிகாட்டுதல் வேண்டும் என்று எழுதுங்கள்...',
    send: language === 'en' ? 'Send Request' : 'கோரிக்கையை அனுப்பு',
    sent: language === 'en' ? 'Request sent! The mentor typically responds within 2\u20133 days.' : 'கோரிக்கை அனுப்பப்பட்டது! வழிகாட்டி பொதுவாக 2-3 நாட்களில் பதிலளிப்பார்.',
    noResults: language === 'en' ? 'No mentors found. Try a different search.' : 'வழிகாட்டிகள் இல்லை. வேறு தேடலை முயற்சிக்கவும்.',
  };

  const handleSend = () => {
    setRequestSent(true);
  };

  const closeModal = () => {
    setSelectedMentor(null);
    setRequestSent(false);
    setMessage('');
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="text-kalvi-terracotta" size={30} /> {t.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FIELDS.map(f => (
            <button key={f} onClick={() => setField(f)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${field === f ? 'bg-kalvi-terracotta text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-semibold">{t.noResults}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(m => (
            <div key={m.id} className="bg-white dark:bg-[#1A1F2E] rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${m.avatarColor} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>{m.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-gray-900 dark:text-white">{m.name}</h3>
                    {m.verified && <CheckCircle2 size={15} className="text-blue-500 fill-blue-100 dark:fill-blue-900" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{m.role[language]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-bold">
                <Briefcase size={13} /> {m.company}
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <MapPin size={13} /> {m.district}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{m.bio[language]}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-sm font-black text-yellow-600"><Star size={15} className="fill-current" /> {m.rating} <span className="text-gray-400 font-semibold">({m.sessions} {t.sessions})</span></div>
              </div>
              <button onClick={() => setSelectedMentor(m)} className="w-full bg-orange-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                <MessageCircle size={16} /> {t.requestMentorship}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedMentor && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1F2E] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="bg-orange-600 p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${selectedMentor.avatarColor} rounded-2xl flex items-center justify-center font-black text-lg`}>{selectedMentor.name.charAt(0)}</div>
                <div>
                  <h3 className="font-heading font-black text-xl">{selectedMentor.name}</h3>
                  <p className="text-sm opacity-80">{selectedMentor.role[language]}</p>
                </div>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-2.5 rounded-full transition-colors"><X size={22} /></button>
            </div>
            <div className="p-8">
              {requestSent ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 size={56} className="text-emerald-500 mx-auto" />
                  <p className="font-black text-lg text-gray-800 dark:text-white">{t.sent}</p>
                  <button onClick={closeModal} className="mt-4 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black">OK</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} rows={4} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 font-semibold focus:outline-none focus:ring-2 focus:ring-kalvi-terracotta dark:text-white resize-none" />
                  <button onClick={handleSend} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Send size={16} /> {t.send}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMarketplace;
