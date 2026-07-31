
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Role } from '../../types';
import { Users, UserPlus, Search, Trash2, Shield, GraduationCap, School, Key, Edit, Save, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | Role>('all');
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      role: Role.STUDENT
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    // Get current user to prevent self-deletion
    authService.getCurrentUser().then(u => setCurrentUserEmail(u?.email || null));
  }, []);

  const loadUsers = async () => {
      try {
        const data = await authService.getAllUsers();
        setUsers([...data]); // Create a new array reference to ensure re-render
      } catch (e) {
        console.error("Failed to load users", e);
      }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
          try {
              await authService.adminDeleteUser(id);
              await loadUsers(); // Wait for reload
              showToast("User deleted successfully", 'success');
          } catch (err: any) {
              console.error(err);
              showToast("Failed to delete user", 'error');
          }
      }
  };

  const openAddModal = () => {
      setModalMode('add');
      setFormData({ name: '', email: '', password: '', role: Role.STUDENT });
      setEditingId(null);
      setShowModal(true);
  };

  const openEditModal = (user: any) => {
      setModalMode('edit');
      setFormData({ 
          name: user.name, 
          email: user.email, 
          password: '', // Keep empty to indicate no change unless typed
          role: user.role 
      });
      setEditingId(user.id);
      setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          if (modalMode === 'add') {
              if (!formData.password) throw new Error("Password is required for new users");
              await authService.adminAddUser(formData.name, formData.email, formData.password, formData.role);
              showToast("User created successfully", 'success');
          } else {
              if (editingId) {
                  // Only pass password if it was changed (non-empty)
                  const updates: any = {
                      name: formData.name,
                      email: formData.email,
                      role: formData.role
                  };
                  if (formData.password.trim() !== '') {
                      updates.password = formData.password;
                  }
                  await authService.adminUpdateUser(editingId, updates);
                  showToast("User details updated successfully", 'success');
              }
          }
          setShowModal(false);
          await loadUsers();
      } catch (err: any) {
          showToast(err.message, 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || u.role === filter;
      return matchesSearch && matchesFilter;
  });

  const getRoleBadge = (role: Role) => {
      switch (role) {
          case Role.SUPER_ADMIN: return <span className="flex items-center gap-1.5 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><Shield size={12}/> Admin</span>;
          case Role.SCHOOL_ADMIN: return <span className="flex items-center gap-1.5 text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><School size={12}/> School</span>;
          case Role.STUDENT: return <span className="flex items-center gap-1.5 text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"><GraduationCap size={12}/> Student</span>;
          default: return null;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[600px]">
        {/* Toast */}
        {toast && (
            <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-slide-up ${
                toast.type === 'success' ? 'bg-green-900/90 border-green-800 text-white' : 'bg-red-900/90 border-red-800 text-white'
            }`}>
                {toast.type === 'success' ? <CheckCircle2 className="text-green-400" /> : <AlertCircle className="text-red-400" />}
                <span className="font-bold">{toast.msg}</span>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Create, edit, and manage platform access.</p>
            </div>
            <button 
                onClick={openAddModal}
                className="bg-bharatStack-terracotta text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-bharatStack-terracottaDark shadow-lg shadow-orange-900/20 transition active:scale-95"
            >
                <UserPlus size={20} /> Add User
            </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none transition bg-white dark:bg-black/20 text-gray-800 dark:text-white" 
                    placeholder="Search by name or email..." 
                />
            </div>
            <div className="flex gap-2">
                {[
                    { label: 'All', val: 'all' },
                    { label: 'Admins', val: Role.SUPER_ADMIN },
                    { label: 'Schools', val: Role.SCHOOL_ADMIN },
                    { label: 'Students', val: Role.STUDENT }
                ].map(f => (
                    <button
                        key={f.label}
                        onClick={() => setFilter(f.val as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${filter === f.val ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-black/20 text-gray-400 font-bold text-xs uppercase tracking-widest border-b dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Password</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredUsers.map(user => {
                            const isCurrentUser = user.email === currentUserEmail;
                            return (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                    {user.name} 
                                                    {isCurrentUser && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-wide">You</span>}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit border border-gray-200 dark:border-white/10">
                                            <Key size={12} /> {user.password}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); openEditModal(user); }}
                                                className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(user.id, user.name); }}
                                                disabled={isCurrentUser}
                                                className={`p-2 rounded-lg transition ${
                                                    isCurrentUser 
                                                    ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                                                    : 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                                                }`}
                                                title={isCurrentUser ? "Cannot delete yourself" : "Delete User"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <p>No users found matching your criteria.</p>
                </div>
            )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up flex flex-col overflow-hidden border border-gray-200 dark:border-white/10">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            {modalMode === 'add' ? <UserPlus size={20} className="text-green-600" /> : <Edit size={20} className="text-blue-600" />}
                            {modalMode === 'add' ? 'Register New User' : 'Edit User Details'}
                        </h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={20}/></button>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 focus:border-bharatStack-terracotta outline-none transition"
                                placeholder="e.g. Arun Kumar"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 focus:border-bharatStack-terracotta outline-none transition"
                                placeholder="e.g. arun@bharatStack.ai"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                                {modalMode === 'add' ? 'Password' : 'New Password (Optional)'}
                            </label>
                            <input 
                                required={modalMode === 'add'}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 focus:border-bharatStack-terracotta outline-none transition font-mono"
                                placeholder={modalMode === 'add' ? "Set password" : "Leave blank to keep current"}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Role Permission</label>
                            <div className="relative">
                                <select 
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-bharatStack-terracotta/20 focus:border-bharatStack-terracotta outline-none transition appearance-none cursor-pointer"
                                >
                                    <option value={Role.STUDENT}>Student (Learner Access)</option>
                                    <option value={Role.SCHOOL_ADMIN}>School Admin (Manager Access)</option>
                                    <option value={Role.SUPER_ADMIN}>Super Admin (Full Access)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="flex-1 py-3 bg-bharatStack-terracotta text-white font-bold rounded-xl shadow-lg hover:bg-bharatStack-terracottaDark transition flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : (modalMode === 'add' ? 'Create Account' : 'Save Changes')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
