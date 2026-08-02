
import React, { useState, useEffect } from 'react';
import { SchoolData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { AdminLayout } from './admin/AdminLayout';
import { VideoLibrary } from './admin/VideoLibrary';
import { SchoolManager } from './admin/SchoolManager';
import { SettingsManager } from './admin/SettingsManager';
import { UserManager } from './admin/UserManager';
import { adminService } from '../services/adminMockService';
import { Users, MapPin, Clock, CheckCircle, Smartphone, Laptop, AlertCircle, Flag, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  language: Language;
  schools: SchoolData[];
  onApproveSchool: (id: string) => void;
  onLogout: () => void;
}

const DashboardHome = ({ setActiveTab }: { setActiveTab: (tab: any) => void }) => {
    const [stats, setStats] = useState<any>(null);
    const [schools, setSchools] = useState<SchoolData[]>([]);

    useEffect(() => {
        adminService.getStats().then(setStats);
        adminService.getSchools().then(setSchools);
    }, []);

    const activityData = [
      { name: 'Mon', hours: 1420 },
      { name: 'Tue', hours: 1380 },
      { name: 'Wed', hours: 1510 },
      { name: 'Thu', hours: 1640 },
      { name: 'Fri', hours: 1720 },
      { name: 'Sat', hours: 1850 },
      { name: 'Sun', hours: 1410 },
    ];

    const deviceData = [
      { name: 'Mobile (Android)', value: 91 },
      { name: 'Desktop/PC', value: 9 },
    ];
    const COLORS = ['#EA580C', '#6B5643'];

    const topSchools = schools
        .filter(s => s.status === 'APPROVED')
        .map(s => ({
            ...s,
            hoursWatched: Math.floor(s.studentCount * (Math.random() * 5 + 10))
        }))
        .sort((a, b) => b.hoursWatched - a.hoursWatched)
        .slice(0, 3);

    return (
        <div className="space-y-8 animate-fade-in pt-20">
            {/* 1. UPGRADED STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Schools', value: stats?.totalSchools || 0, icon: <MapPin className="text-kalvi-terracotta" />, bg: 'bg-orange-50 dark:bg-orange-500/10' },
                    { label: 'Total Students Enrolled', value: stats?.totalStudentsEnrolled?.toLocaleString() || 0, icon: <Users className="text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-500/10' },
                    { label: 'Total Learning Hours', value: stats?.totalLearningHours?.toLocaleString() || 0, icon: <Clock className="text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-500/10' },
                    { label: 'Completion Rate', value: stats?.completionRate || '0%', icon: <CheckCircle className="text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-800 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. ACTION CENTER */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle size={20} className="text-kalvi-terracotta" />
                        <h3 className="font-bold text-gray-800 dark:text-white">Action Center</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                        {stats?.pendingApprovals > 0 ? (
                            <button 
                                onClick={() => setActiveTab('schools')}
                                className="w-full text-left p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition flex items-center justify-between group"
                            >
                                <div>
                                    <p className="font-bold text-orange-900 dark:text-orange-200">Pending School Approvals</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">{stats.pendingApprovals} Institutions awaiting verification</p>
                                </div>
                                <TrendingUp size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 text-center text-sm italic">
                                No pending school approvals
                            </div>
                        )}

                        <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                                <Flag size={14} />
                                <span className="text-xs font-bold uppercase tracking-widest">Content Reports/Flags</span>
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">0 Active reports from students</p>
                        </div>
                    </div>
                </div>

                {/* ACTIVITY CHART */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Learning Engagement (Cumulative Hours)</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1A1F2E', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }} 
                                />
                                <Area type="monotone" dataKey="hours" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. DEVICE USAGE PIE CHART */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-center">
                    <div className="w-full">
                        <h3 className="font-bold text-gray-800 dark:text-white">Device Usage</h3>
                        <p className="text-xs text-gray-400 mb-6 font-medium italic">Proof of low-end Android reach</p>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <Smartphone size={16} className="text-kalvi-terracotta" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">91% Mobile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Laptop size={16} className="text-kalvi-coffee" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">9% Desktop</span>
                        </div>
                    </div>
                </div>

                {/* 4. TOP SCHOOLS LEADERBOARD */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white">Top 3 Active Schools</h3>
                        <button 
                            onClick={() => setActiveTab('schools')}
                            className="text-xs font-bold text-kalvi-terracotta hover:underline"
                        >
                            View All Data
                        </button>
                    </div>
                    <div className="space-y-4">
                        {topSchools.map((school, i) => (
                            <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-kalvi-terracotta/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-kalvi-terracotta text-white flex items-center justify-center font-black">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{school.name}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                            <MapPin size={10} /> {school.district}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-kalvi-terracotta text-lg">{school.hoursWatched.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hours Learned</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, onApproveSchool, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'schools' | 'users' | 'settings'>('dashboard');

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}>
        {activeTab === 'dashboard' && <DashboardHome setActiveTab={setActiveTab} />}
        {activeTab === 'videos' && <VideoLibrary />}
        {activeTab === 'schools' && <SchoolManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'settings' && <SettingsManager />}
    </AdminLayout>
  );
};

export default AdminDashboard;
