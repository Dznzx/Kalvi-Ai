
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminMockService';
import { authService } from '../../services/authService';
import { SystemSettings, User as UserType } from '../../types';
import { User, Shield, AlertTriangle, Video, Globe, Save, Lock, CheckCircle2, Server, Loader2, Info, Cloud } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    // 1. Load System Settings from DB
    adminService.getSystemSettings().then(setSettings);
    
    // 2. Load Real Authenticated Admin Data
    authService.getCurrentUser().then(user => {
        if (user) {
            setCurrentUser(user);
            setProfile({
                name: user.name,
                email: user.email
            });
        }
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    
    try {
        // 1. Update Platform Settings in Supabase
        await adminService.updateSystemSettings(settings);
        
        // 2. Update Admin Profile in Mock DB and Session
        if (currentUser) {
            const updated = await authService.adminUpdateUser(currentUser.id, { 
                name: profile.name,
                email: profile.email 
            });
            setCurrentUser(updated); // Update local state with fresh session data
        }

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
        console.error("Failed to save settings:", error.message || error);
        alert(`Error saving settings: ${error.message || 'Please try again.'}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
      if (!settings) return;
      const newValue = !settings.maintenanceMode;
      
      if (newValue) {
          const confirmed = window.confirm("ENABLE MAINTENANCE MODE?\n\nThis will lock out ALL students and schools immediately. Only administrators will have access.");
          if (!confirmed) return;
      }
      
      setSettings({ ...settings, maintenanceMode: newValue });
  };

  if (!settings) return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Loader2 className="animate-spin text-bharatStack-terracotta" size={48} />
          <p className="text-gray-500 font-bold animate-pulse">Syncing platform configurations...</p>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b dark:border-white/5 pb-6">
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">System Control</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global configuration, security, and administrative defaults.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
            <Cloud size={14} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Cloud Sync</span>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-24 right-8 z-[100] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-in border border-white/10">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle2 size={20} />
            </div>
            <div>
                <p className="font-black text-sm uppercase tracking-wider">Success</p>
                <p className="text-xs opacity-70">Platform settings updated globally.</p>
            </div>
        </div>
      )}

      {/* Section 1: Admin Profile */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
         <div className="flex items-center gap-4 mb-8">
             <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                <User size={28} />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-800 dark:text-white">Admin Identity</h3>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-0.5">Currently logged in as {currentUser?.name}</p>
             </div>
         </div>
         
         <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Display Name</label>
                 <div className="relative group">
                    <User size={16} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        value={profile.name}
                        onChange={e => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-800 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Enter your name"
                    />
                 </div>
             </div>
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                 <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-4 text-gray-400" />
                    <input 
                        value={profile.email}
                        readOnly
                        className="w-full bg-gray-100 dark:bg-white/5 border border-transparent rounded-2xl pl-12 pr-4 py-4 text-gray-500 dark:text-gray-400 font-bold cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-4 opacity-50"><Shield size={16} /></div>
                 </div>
             </div>
         </div>
      </div>

      {/* Section 2: Platform Controls */}
      <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden transition-all hover:shadow-md">
         <div className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <AlertTriangle size={150} className="text-red-500" />
            </div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-100 dark:border-red-500/20">
                    <Server size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white">Global Availability</h3>
                    <p className="text-xs text-red-400 font-black uppercase tracking-[0.2em] mt-0.5">Critical Infrastructure Controls</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${settings.maintenanceMode ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/10'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`mt-2 w-4 h-4 rounded-full ${settings.maintenanceMode ? 'bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div>
                            <h4 className="text-lg font-black text-gray-800 dark:text-white">Emergency Maintenance Lock</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-1 leading-relaxed">
                                Redirect all students and schools to the maintenance screen. This update propagates globally in ~10 seconds.
                            </p>
                            {settings.maintenanceMode && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border-2 border-red-400 shadow-lg shadow-red-600/20">
                                    <AlertTriangle size={12} /> System-Wide Lock Active
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={handleToggleMaintenance}
                        className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none ring-offset-2 focus:ring-4 focus:ring-red-500/20 ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition shadow-xl ${settings.maintenanceMode ? 'translate-x-11' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 transition-all">
                    <div className="flex items-start gap-4">
                        <div className={`mt-2 w-4 h-4 rounded-full ${settings.allowRegistrations ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div>
                            <h4 className="text-lg font-black text-gray-800 dark:text-white">Public School Registrations</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Allow new institutions to request onboarding from the landing page wizard.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, allowRegistrations: !settings.allowRegistrations})}
                        className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none ring-offset-2 focus:ring-4 focus:ring-green-500/20 ${settings.allowRegistrations ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition shadow-xl ${settings.allowRegistrations ? 'translate-x-11' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
         <div className="flex items-center gap-4 mb-10">
             <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                <Video size={28} />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-800 dark:text-white">Platform Defaults</h3>
                <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Global Video & UI Standards</p>
             </div>
         </div>

         <div className="grid md:grid-cols-2 gap-10">
             <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Default Streaming Quality</label>
                 <div className="relative group">
                    <Video className="absolute left-5 top-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                    <select 
                        value={settings.defaultQuality}
                        onChange={(e) => setSettings({...settings, defaultQuality: e.target.value as any})}
                        className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl pl-14 pr-4 py-4 font-black text-gray-800 dark:text-white appearance-none focus:ring-4 focus:ring-purple-500/10 outline-none cursor-pointer transition-all"
                    >
                        <option value="auto">Auto (Smart Resolution)</option>
                        <option value="360p">360p (Optimized for 2G/3G)</option>
                        <option value="720p">720p (High Definition)</option>
                    </select>
                    <div className="absolute right-5 top-5 pointer-events-none text-xs font-black text-gray-400">▼</div>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium px-1">Sets the initial resolution for players in the student portal.</p>
             </div>

             <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Default UI Language</label>
                 <div className="relative group">
                    <Globe className="absolute left-5 top-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                    <select 
                        value={settings.defaultLanguage}
                        onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value as any})}
                        className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-2xl pl-14 pr-4 py-4 font-black text-gray-800 dark:text-white appearance-none focus:ring-4 focus:ring-purple-500/10 outline-none cursor-pointer transition-all"
                    >
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="en">English (Global)</option>
                    </select>
                    <div className="absolute right-5 top-5 pointer-events-none text-xs font-black text-gray-400">▼</div>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium px-1">Determines the initial interface language for new visitors.</p>
             </div>
         </div>
      </div>

      {/* STICKY ACTION BAR: Changed from fixed to sticky to ensure it stays anchored properly within the scroll context */}
      <div className="sticky bottom-0 left-0 right-0 z-50 pt-10 pb-8 mt-12 bg-gradient-to-t from-gray-50 via-gray-50/90 dark:from-[#0B0F19] dark:via-[#0B0F19]/90 to-transparent backdrop-blur-sm flex justify-center md:justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-bharatStack-terracotta text-white px-12 py-5 rounded-full font-black shadow-2xl shadow-orange-900/40 hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-70 disabled:transform-none border-2 border-orange-400/30 group"
          >
            {isSaving ? (
                <><Loader2 className="animate-spin" size={24} /> UPDATING SYSTEM...</>
            ) : (
                <><Save size={24} className="group-hover:scale-110 transition-transform" /> PUBLISH ALL CHANGES</>
            )}
          </button>
      </div>

    </div>
  );
};
