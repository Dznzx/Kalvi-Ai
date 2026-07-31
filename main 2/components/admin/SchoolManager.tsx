
import React, { useState, useEffect } from 'react';
import { SchoolData } from '../../types';
import { adminService } from '../../services/adminMockService';
import { supabase } from '../../services/supabaseClient';
import { Check, X, Search, MoreHorizontal, School, Users, MapPin, AlertCircle, Phone, Filter, CheckCircle2, Edit2, Save, Key, Ban, Clock, Mail, ChevronRight, RefreshCw } from 'lucide-react';

export const SchoolManager: React.FC = () => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [managingSchool, setManagingSchool] = useState<SchoolData | null>(null);
  const [manageForm, setManageForm] = useState({
      principalName: '',
      phone: '',
      email: ''
  });

  useEffect(() => {
    loadData();

    // REAL-TIME SUBSCRIPTION
    if (supabase) {
        const channel = supabase
            .channel('public:schools')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
                loadData(); // Reload data when any change happens in DB
            })
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
        const data = await adminService.getSchools();
        setSchools(data);
        const s = await adminService.getStats();
        setStats(s);
    } finally {
        setIsRefreshing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic Update
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' as const } : s));
    showToast("School Access Granted", 'success');
    
    adminService.approveSchool(id).then(() => {
        loadData();
    });
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (window.confirm("Are you sure you want to reject this registration? This cannot be undone.")) {
        setSchools(prev => prev.filter(s => s.id !== id));
        showToast("Registration Rejected", 'error');
        
        adminService.rejectSchool(id).then(() => {
            loadData();
        });
    }
  };

  const handleManage = (school: SchoolData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setManagingSchool(school);
    setManageForm({
        principalName: school.principalName,
        phone: school.phone,
        email: school.email
    });
  };

  const handleSaveManagement = () => {
      if (!managingSchool) return;
      
      // Update local state
      setSchools(prev => prev.map(s => s.id === managingSchool.id ? {
          ...s,
          principalName: manageForm.principalName,
          phone: manageForm.phone,
          email: manageForm.email
      } : s));

      showToast("School details updated", 'success');
      setManagingSchool(null);
  };

  const handleSuspend = () => {
      if (window.confirm(`Are you sure you want to suspend access for ${managingSchool?.name}?`)) {
          if (!managingSchool) return;
          setSchools(prev => prev.map(s => s.id === managingSchool.id ? { ...s, status: 'PENDING' as const } : s));
          showToast("School suspended", 'error');
          setManagingSchool(null);
      }
  };

  const handleResetPassword = () => {
      if (window.confirm(`Send password reset link to ${manageForm.email}?`)) {
          showToast("Reset link sent", 'success');
      }
  };

  const districts = Array.from(new Set(schools.map(s => s.district).filter(Boolean)));

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === 'all' || s.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' ? s.status === 'PENDING' : s.status === 'APPROVED');
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-slide-up ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-800 text-white' : 'bg-red-900/90 border-red-800 text-white'
        }`}>
            {toast.type === 'success' ? <CheckCircle2 className="text-green-400" /> : <AlertCircle className="text-red-400" />}
            <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header with Manual Refresh */}
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Institution Registry</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time school management dashboard.</p>
          </div>
          <button 
            onClick={loadData}
            className={`p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-bharatStack-terracotta transition ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
              <RefreshCw size={18} />
          </button>
      </div>

      {/* 1. IMPACT STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
            <div>
                <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Pending Approvals</p>
                <p className="text-4xl font-black text-orange-600 dark:text-orange-500">{stats?.pendingApprovals || 0}</p>
            </div>
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <AlertCircle size={28} />
            </div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Schools</p>
                <p className="text-4xl font-black text-gray-800 dark:text-white">{stats?.totalSchools || 0}</p>
            </div>
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <School size={28} />
            </div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Student Reach</p>
                <p className="text-4xl font-black text-gray-800 dark:text-white">{stats?.totalStudentsEnrolled?.toLocaleString() || 0}</p>
            </div>
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Users size={28} />
            </div>
        </div>
      </div>

      {/* 2. CONTROLS / FILTER BAR */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 transition-colors">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-3 text-gray-400" size={20} />
             <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-[#1A1F2E] border-none rounded-xl focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none font-medium text-gray-700 dark:text-white dark:placeholder-gray-500" 
                placeholder="Search by school name..." 
             />
          </div>
          <div className="flex gap-4">
              <div className="relative min-w-[160px]">
                 <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
                 <select 
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1A1F2E] border-none rounded-xl focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none font-bold text-gray-600 dark:text-gray-300 appearance-none text-sm cursor-pointer"
                 >
                    <option value="all">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="relative min-w-[160px]">
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1A1F2E] border-none rounded-xl focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none font-bold text-gray-600 dark:text-gray-300 appearance-none text-sm cursor-pointer"
                 >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                 </select>
              </div>
          </div>
      </div>

      {/* 3. DYNAMIC SCHOOLS LIST TABLE */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden transition-colors">
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-400 font-bold text-xs uppercase tracking-widest border-b dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-5">School Info</th>
                        <th className="px-6 py-5">District</th>
                        <th className="px-6 py-5">Principal / Contact</th>
                        <th className="px-6 py-5 text-center">Students</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredSchools.length > 0 ? (
                        filteredSchools.map(school => (
                            <tr key={school.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-bharatStack-terracotta group-hover:scale-110 transition-transform">
                                            <School size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 dark:text-white text-sm">{school.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{school.board}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-gray-400" />
                                        {school.district || 'General'}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{school.principalName}</p>
                                    <a 
                                        href={`tel:${school.phone}`} 
                                        className="text-xs text-bharatStack-terracotta font-bold flex items-center gap-1 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Phone size={12} /> {school.phone}
                                    </a>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="font-black text-gray-800 dark:text-white">{school.studentCount}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                        school.status === 'APPROVED' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                                    }`}>
                                        {school.status === 'APPROVED' ? 'Active' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                     {school.status === 'PENDING' ? (
                                        <div className="flex justify-end items-center gap-4 animate-fade-in">
                                            <button 
                                                onClick={(e) => handleReject(school.id, e)}
                                                className="text-xs font-bold text-red-400 hover:text-red-600 transition"
                                            >
                                                Reject
                                            </button>
                                            <button 
                                                onClick={(e) => handleApprove(school.id, e)}
                                                className="bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-green-600 shadow-md shadow-green-100 dark:shadow-none transition active:scale-95"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                     ) : (
                                        <button 
                                            onClick={(e) => handleManage(school, e)}
                                            className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-5 py-2 rounded-xl text-xs font-black hover:bg-gray-200 dark:hover:bg-white/20 transition animate-fade-in border border-transparent dark:border-gray-700 flex items-center gap-2 ml-auto"
                                        >
                                            Manage <ChevronRight size={14} />
                                        </button>
                                     )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="py-20 text-center">
                                <div className="max-w-xs mx-auto">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
                                        <Search size={32} />
                                    </div>
                                    <p className="font-bold text-gray-800 dark:text-white mb-1">No schools found</p>
                                    <p className="text-sm text-gray-400">New registrations will appear here in real-time.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>

      {/* MANAGE MODAL */}
      {managingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col animate-bounce-in">
                  
                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50/50 dark:bg-[#1A1F2E]/50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{managingSchool.name}</h2>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                  managingSchool.status === 'APPROVED' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>
                                  {managingSchool.status === 'APPROVED' ? 'Active' : 'Pending'}
                              </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                              <MapPin size={14} /> {managingSchool.district || 'General District'}
                          </p>
                      </div>
                      <button 
                        onClick={() => setManagingSchool(null)}
                        className="p-2 bg-gray-100 dark:bg-[#1A1F2E] rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 grid md:grid-cols-2 gap-8 bg-white dark:bg-[#111827]">
                      {/* Left: Editable Fields */}
                      <div className="space-y-5">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Edit2 size={12} /> Principal Details
                          </h4>
                          
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Principal Name</label>
                              <input 
                                  value={manageForm.principalName}
                                  onChange={e => setManageForm({...manageForm, principalName: e.target.value})}
                                  className="w-full bg-gray-50 dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none"
                              />
                          </div>
                          
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Phone Number</label>
                              <div className="relative">
                                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                  <input 
                                      value={manageForm.phone}
                                      onChange={e => setManageForm({...manageForm, phone: e.target.value})}
                                      className="w-full bg-gray-50 dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none"
                                  />
                              </div>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</label>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                  <input 
                                      value={manageForm.email}
                                      onChange={e => setManageForm({...manageForm, email: e.target.value})}
                                      className="w-full bg-gray-50 dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Right: Quick Stats (Read Only) */}
                      <div className="space-y-5">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Users size={12} /> School Stats
                          </h4>
                          
                          <div className="bg-gray-50 dark:bg-[#1A1F2E] rounded-xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Students</span>
                                  <span className="text-lg font-black text-gray-900 dark:text-white">{managingSchool.studentCount}</span>
                              </div>
                              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Login</span>
                                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                      <Clock size={12} /> Live
                                  </div>
                              </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-900/30">
                              This school is on the <b>"Free Pilot Tier"</b>.
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-5 bg-gray-50 dark:bg-[#1A1F2E]/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex gap-4">
                          <button onClick={handleResetPassword} className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition">
                              <Key size={14} /> Reset Password
                          </button>
                          <button onClick={handleSuspend} className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5 transition">
                              <Ban size={14} /> Suspend Institution
                          </button>
                      </div>
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setManagingSchool(null)}
                              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition"
                          >
                              Close
                          </button>
                          <button 
                              onClick={handleSaveManagement}
                              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-bharatStack-terracotta text-white shadow-lg shadow-orange-900/20 hover:bg-orange-600 transition flex items-center gap-2"
                          >
                              <Save size={16} /> Save Changes
                          </button>
                      </div>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
};
