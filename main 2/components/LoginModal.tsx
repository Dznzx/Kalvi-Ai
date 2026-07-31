
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, User, Lock, Loader2, AlertCircle, Mail, LogIn, ShieldCheck, Settings, Info, ExternalLink, HelpCircle, CheckCircle2, Copy } from 'lucide-react';
import { Role, Language, User as UserType } from '../types';
import { TRANSLATIONS } from '../constants';
import { BharatStackLogo } from './BharatStackLogo';
import { authService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  language: Language;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, language }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const t = TRANSLATIONS[language];

  const currentRedirectUrl = window.location.origin;

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setIsAdminMode(false);
      setFormData({ name: '', username: '', password: '' });
      setError("");
      setIsLoading(false);
      setShowConfigHelper(false);
    }
  }, [isOpen]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentRedirectUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await authService.signInWithGoogle();
      // Redirect happens automatically via Supabase
    } catch (err: any) {
      console.error("Critical Auth Error:", err);
      const msg = err.message || "Google login failed";
      setError(msg);
      setShowConfigHelper(true);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let user: UserType;
      if (mode === 'register') {
          user = await authService.register(formData.name, formData.username, formData.password, isAdminMode ? Role.SUPER_ADMIN : Role.STUDENT);
      } else {
          user = await authService.login(formData.username, formData.password);
          if (isAdminMode && user.role !== Role.SUPER_ADMIN) throw new Error("Admin access only.");
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[660px] max-h-[95vh]">
        
        {/* Left Side Visual */}
        <div className={`hidden md:flex flex-col justify-between w-5/12 p-10 text-white relative transition-colors duration-500 ${isAdminMode ? 'bg-gray-900' : 'bg-slate-900'}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
             <div className="bg-white/10 backdrop-blur-md w-fit p-3 rounded-2xl mb-6 border border-white/10">
                {isAdminMode ? <ShieldCheck size={40} className="text-emerald-400" /> : <LogIn size={40} />}
             </div>
             <h2 className="text-3xl font-heading font-bold mb-3">
                 {isAdminMode ? 'Admin Portal' : (mode === 'login' ? t.welcomeBack : 'Join Bharat Stack')}
             </h2>
             <p className="text-lg opacity-70">
                {isAdminMode ? "Platform management access." : "Start your AI journey in Tamil."}
             </p>
          </div>
          <div className="relative z-10 flex items-center gap-2 opacity-50">
            <BharatStackLogo className="h-8" showText={false} color="white" />
            <span className="font-bold tracking-widest text-sm uppercase">Bharat Stack</span>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 bg-white relative flex flex-col overflow-y-auto px-8 md:px-16 py-10 custom-scrollbar">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"><X size={24} /></button>

          <div className="mb-8">
             <h3 className="text-2xl font-bold text-gray-900 mb-1">{mode === 'login' ? 'Sign In' : 'Create Account'}</h3>
             <p className="text-sm text-gray-500">Access your personalized learning dashboard.</p>
          </div>

          {/* Google Button */}
          {!isAdminMode && (
            <div className="space-y-4 mb-6">
                <button 
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                    {isGoogleLoading ? <Loader2 size={20} className="animate-spin" /> : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Continue with Google
                        </>
                    )}
                </button>
                <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-gray-100"></div>
                    <span className="absolute bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Or use email</span>
                </div>
            </div>
          )}

          {/* Config Helper / Error State */}
          {(error || showConfigHelper) && (
            <div className={`mb-6 p-4 rounded-xl flex flex-col gap-3 text-sm animate-fade-in border ${showConfigHelper ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">{showConfigHelper ? 'OAuth Redirect Setup Required' : 'Authentication Error'}</p>
                        <p className="opacity-90">{error || "Supabase redirected to localhost? You need to whitelist the preview URL."}</p>
                    </div>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4 space-y-3 mt-1 border border-amber-200 shadow-sm">
                    <p className="font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                        <HelpCircle size={14} /> Action Required in Supabase:
                    </p>
                    
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">1. Copy this Redirect URL:</p>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-lg group">
                            <code className="text-[10px] flex-1 truncate font-mono text-gray-600">{currentRedirectUrl}</code>
                            <button onClick={handleCopyUrl} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-amber-600">
                                {copySuccess ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-[11px] space-y-2 text-amber-900/80 leading-relaxed">
                        <p>2. Go to <b>Auth &gt; URL Configuration</b> in your Supabase Dashboard.</p>
                        <p>3. Set <b>Site URL</b> to the address above.</p>
                        <p>4. Add the same address to <b>Redirect URIs</b> and click <b>Save</b>.</p>
                    </div>
                    
                    <button 
                        onClick={() => window.open('https://app.supabase.com', '_blank')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2"
                    >
                        Open Supabase Dashboard <ExternalLink size={12} />
                    </button>
                </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                    <input required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition text-gray-900" placeholder="e.g. Harsh Jain" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
            )}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.email || "Email"}</label>
                <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition text-gray-900" placeholder="you@example.com" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.password}</label>
                <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 outline-none transition text-gray-900" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength={6} />
            </div>
            <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${isAdminMode ? 'bg-gray-900' : 'bg-bharatStack-terracotta'}`}>
                {isLoading ? <Loader2 className="animate-spin" /> : <>{mode === 'login' ? t.signIn : 'Create Account'} <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-500">
                {mode === 'login' ? t.noAccount : 'Already have an account?'} 
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-bold hover:underline text-bharatStack-terracotta ml-1">
                    {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
              <button onClick={() => setIsAdminMode(!isAdminMode)} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest block mx-auto">
                {isAdminMode ? "Student Login" : "Admin Access"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
