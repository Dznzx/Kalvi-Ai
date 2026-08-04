
import React, { useState } from 'react';
import { X, CheckCircle, School, User, Users, Building, Mail, Phone, Hash, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { adminService } from '../services/adminMockService';

interface SchoolOnboardingModalProps {
  language: Language;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const SchoolOnboardingModal: React.FC<SchoolOnboardingModalProps> = ({ language, onClose, onSubmit }) => {
  const t = TRANSLATIONS[language];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    board: 'State Board',
    principalName: '',
    email: '',
    phone: '',
    studentCount: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.principalName || !formData.email || formData.phone.length !== 10) {
      setError(language === 'ta' ? "தயவுசெய்து அனைத்து விவரங்களையும் சரியாக நிரப்பவும். தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்." : "Please fill all details correctly. Phone must be 10 digits.");
      setIsSubmitting(false);
      return;
    }

    try {
        await adminService.registerSchool({
            name: formData.name,
            board: formData.board,
            principalName: formData.principalName,
            email: formData.email,
            phone: formData.phone,
            studentCount: parseInt(formData.studentCount) || 0,
            district: 'General' // Default for now
        });
        
        setIsSuccess(true);
        setTimeout(() => {
          onSubmit(formData);
        }, 3000);
    } catch (e: any) {
        setError(e.message || "Registration failed. Database error.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-[#1A1F2E] rounded-3xl shadow-2xl p-12 text-center max-w-md w-full animate-bounce-in">
           <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 animate-pulse" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.wizardSuccessTitle}</h2>
           <p className="text-gray-600 dark:text-gray-400 mb-8">{t.wizardSuccessDesc}</p>
           <button onClick={onClose} className="w-full py-3 bg-gray-100 dark:bg-white/5 rounded-xl font-bold text-gray-600 dark:text-gray-300">Close</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:bg-white dark:focus:bg-black/40 focus:border-kalvi-terracotta focus:ring-4 focus:ring-orange-500/10 transition duration-200 outline-none text-gray-800 dark:text-white placeholder-gray-400 font-medium";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F19] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white font-heading">
                {language === 'ta' ? 'பள்ளி பதிவு' : 'School Onboarding'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Register your Institution</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* School Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.schoolName}</label>
                <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder={language === 'ta' ? 'பள்ளியின் பெயர்' : 'Enter Institution Name'}
                        required
                    />
                </div>
            </div>

            {/* Board */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.board}</label>
                <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <select 
                        name="board"
                        value={formData.board}
                        onChange={handleInputChange}
                        className={`${inputClass} appearance-none cursor-pointer`}
                        required
                    >
                        <option value="State Board">State Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="Matriculation">Matriculation</option>
                        <option value="ICSE">ICSE</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</div>
                </div>
            </div>

            {/* Principal Name */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.principalName}</label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <input 
                        type="text" 
                        name="principalName"
                        value={formData.principalName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder={language === 'ta' ? 'முதல்வர் பெயர்' : 'Principal Name'}
                        required
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.email}</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="school@example.com"
                        required
                    />
                </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.phone}</label>
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <input 
                        type="tel" 
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({...formData, phone: val});
                        }}
                        className={inputClass}
                        placeholder="10-digit mobile"
                        required
                    />
                </div>
            </div>

            {/* Total Students */}
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t.totalStudents}</label>
                <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-kalvi-terracotta transition-colors" size={18} />
                    <input 
                        type="number" 
                        name="studentCount"
                        value={formData.studentCount}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="e.g. 500"
                        required
                    />
                </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex gap-4">
              <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center text-kalvi-terracotta shadow-sm flex-shrink-0">
                  <CheckCircle size={20} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {language === 'ta' 
                    ? "விவரங்களைச் சமர்ப்பித்த பிறகு, எங்கள் குழு உங்கள் கோரிக்கையைச் சரிபார்த்து 24 மணி நேரத்திற்குள் அங்கீகரிக்கும்." 
                    : "Once submitted, our team will verify your details. Your school dashboard will be activated within 24 hours of approval."}
              </p>
          </div>
        </form>

        {/* Footer Action */}
        <div className="p-6 border-t dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-end">
            <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-4 bg-kalvi-terracotta text-white rounded-xl font-black text-base shadow-xl shadow-orange-900/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <><Loader2 className="animate-spin" /> {language === 'ta' ? 'பதிவு செய்கிறது...' : 'Processing...'}</>
                ) : (
                    <>{language === 'ta' ? 'பதிவை முடிக்கவும்' : 'Complete Registration'} <ChevronRight size={20} /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolOnboardingModal;
