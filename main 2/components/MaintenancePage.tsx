
import React from 'react';
import { Construction, Clock, RefreshCw, LogOut } from 'lucide-react';
import { BharatStackLogo } from './BharatStackLogo';

interface MaintenancePageProps {
  onLogout: () => void;
  onRefresh: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onLogout, onRefresh }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center p-6 transition-colors font-sans">
      <div className="max-w-lg w-full bg-white dark:bg-[#1A1F2E] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 animate-fade-in-up">
        
        {/* Header Graphic */}
        <div className="bg-bharatStack-terracotta h-32 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg relative z-10">
                <Construction className="text-white w-12 h-12" />
            </div>
        </div>

        {/* Content */}
        <div className="p-10 text-center">
            <div className="mb-6 flex justify-center">
                <BharatStackLogo className="h-10" showText={true} />
            </div>
            
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                Under Maintenance
            </h1>
            
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                We are currently upgrading the Bharat Stack platform to bring you new features and better performance. Access is temporarily restricted.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm font-bold text-bharatStack-terracotta bg-orange-50 dark:bg-orange-500/10 py-3 px-4 rounded-xl mb-8 border border-orange-100 dark:border-orange-500/20">
                <Clock size={16} />
                <span>Estimated uptime: 1 Hour</span>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onRefresh}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} /> Check Status
                </button>
                
                <button 
                    onClick={onLogout}
                    className="w-full bg-transparent text-gray-500 dark:text-gray-400 py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium">
          If you are an Administrator, please contact support directly.
      </p>
    </div>
  );
};
