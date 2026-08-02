
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Video, Users, Settings, LogOut, UserPlus } from 'lucide-react';
import { KalviLogo } from '../KalviLogo';
import { NotificationMenu } from '../common/NotificationMenu';
import { authService } from '../../services/authService';
import { User } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'videos' | 'schools' | 'users' | 'settings';
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Management', icon: <UserPlus size={20} /> },
    { id: 'videos', label: 'Video Library', icon: <Video size={20} /> },
    { id: 'schools', label: 'Schools', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const getInitials = (name: string) => {
      if (!name) return 'AD';
      const parts = name.trim().split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex font-sans pt-20 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-white/5 hidden md:flex flex-col fixed top-20 bottom-0 z-10 transition-colors duration-300">
        <nav className="flex-1 p-4 space-y-2 mt-4">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        activeTab === item.id 
                        ? 'bg-kalvi-blue text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
            >
                <LogOut size={20} />
                Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full">
        {/* Secondary Admin Header (Tabs) */}
        <header className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 h-16 flex items-center justify-between px-4 md:px-8 sticky top-20 z-20 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab.replace('_', ' ')}</h2>
            <div className="flex items-center gap-4">
                <NotificationMenu 
                    language="en" 
                    onNavigate={(target) => setActiveTab(target)} 
                />
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-black text-gray-800 dark:text-white leading-none">{currentUser?.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kalvi-terracotta to-orange-400 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-900/20 border-2 border-white/10">
                        {getInitials(currentUser?.name || '')}
                    </div>
                </div>
            </div>
        </header>

        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
};
