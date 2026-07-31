
import { Role, User } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY_SESSION = 'bharatStack_active_session';

export const authService = {
  // Real Google Sign In via Supabase
  signInWithGoogle: async () => {
    if (!supabase) throw new Error("Supabase not initialized");
    
    // Use window.location.origin to detect the current cloud preview URL
    const redirectTo = window.location.origin;
    console.log("[Auth] Initiating Google Sign-In. Redirecting back to:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
        console.error("[Auth] OAuth Error Details:", error);
        throw error;
    }
    return data;
  },

  login: async (email: string, password: string): Promise<User> => {
    // Check Supabase first for real users
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: (data.user.user_metadata?.role as Role) || Role.STUDENT,
          avatarUrl: data.user.user_metadata?.avatar_url
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        return user;
      }
    }

    // Fallback to mock logic for demo accounts
    const mockUsers = JSON.parse(localStorage.getItem('bharatStack_mock_users_db') || '[]');
    const user = mockUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) throw new Error("Invalid credentials");

    const sessionUser: User = { id: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  register: async (name: string, email: string, password: string, role: Role): Promise<User> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: role }
        }
      });
      if (error) throw error;
      if (data.user) {
        const user: User = { id: data.user.id, name, email, role };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        return user;
      }
    }
    throw new Error("Registration failed");
  },

  logout: async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getCurrentUser: async (): Promise<User | null> => {
    // 1. Check for real Supabase session first (Critical for OAuth redirects)
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as Role) || Role.STUDENT,
          avatarUrl: session.user.user_metadata?.avatar_url
        };
      }
    }

    // 2. Fallback to local storage session
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  // Helper for Admin Panel to list all users
  getAllUsers: async (): Promise<any[]> => {
    const stored = localStorage.getItem('bharatStack_mock_users_db');
    return stored ? JSON.parse(stored) : [];
  },

  // Implementation for Admin Management
  adminAddUser: async (name: string, email: string, password: string, role: Role): Promise<User> => {
    const mockUsers = JSON.parse(localStorage.getItem('bharatStack_mock_users_db') || '[]');
    const newUser = { id: `u_${Date.now()}`, name, email, password, role };
    mockUsers.push(newUser);
    localStorage.setItem('bharatStack_mock_users_db', JSON.stringify(mockUsers));
    return { id: newUser.id, name, email, role };
  },

  adminDeleteUser: async (id: string) => {
    const mockUsers = JSON.parse(localStorage.getItem('bharatStack_mock_users_db') || '[]');
    const updated = mockUsers.filter((u: any) => u.id !== id);
    localStorage.setItem('bharatStack_mock_users_db', JSON.stringify(updated));
  },

  adminUpdateUser: async (id: string, updates: any) => {
    const mockUsers = JSON.parse(localStorage.getItem('bharatStack_mock_users_db') || '[]');
    const updated = mockUsers.map((u: any) => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem('bharatStack_mock_users_db', JSON.stringify(updated));
    const user = updated.find((u: any) => u.id === id);
    return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
  },

  canAccessView: (userRole: Role, view: string): boolean => {
    if (userRole === Role.SUPER_ADMIN) return true;
    if (['LANDING', 'ABOUT', 'HELP'].includes(view)) return true;
    return ['STUDENT_DASHBOARD', 'LMS_PLAYER', 'PROFILE'].includes(view);
  }
};
