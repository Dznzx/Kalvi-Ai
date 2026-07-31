
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, AlertCircle } from 'lucide-react';

interface SchoolDashboardProps {
  language: Language;
}

const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  
  // Mock Data
  const data = [
    { name: 'Grade 6', progress: 40 },
    { name: 'Grade 7', progress: 65 },
    { name: 'Grade 8', progress: 55 },
    { name: 'Grade 9', progress: 80 },
    { name: 'Grade 10', progress: 30 },
  ];

  return (
    // Optimized: pt-28
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-28">
      <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">{t.schoolDashboard}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Govt Higher Secondary School, Chennai</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <Users className="text-bharatStack-terracotta" />
                <h3 className="font-medium text-gray-500 dark:text-gray-400">{t.registeredStudents}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">450</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="text-green-500" />
                <h3 className="font-medium text-gray-500 dark:text-gray-400">{t.modulesCompleted}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">1,203</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="text-yellow-500" />
                <h3 className="font-medium text-gray-500 dark:text-gray-400">{t.pendingAssessments}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">42</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-white">{t.avgProgress}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1F2E', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="progress" fill="#EA580C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">{t.topPerformers}</h3>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-bharatStack-terracotta text-white flex items-center justify-center font-bold text-xs">
                                {String.fromCharCode(64 + i)}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white">Student Name {i}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t.grade} 9 • 9{5-i}% {t.completed}</p>
                            </div>
                        </div>
                        <span className="text-green-500 font-bold text-sm">Top {i}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
