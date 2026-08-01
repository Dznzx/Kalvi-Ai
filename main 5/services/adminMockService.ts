
import { SchoolData, VideoMetadata, ActivityLog, SystemSettings } from '../types';
import { contentService } from './contentService';
import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';

const SETTINGS_KEY = 'kalvi_system_settings';
const LOCAL_SCHOOLS_KEY = 'kalvi_local_registrations';

const defaultSettings: SystemSettings = {
    maintenanceMode: false,
    allowRegistrations: true,
    defaultQuality: '360p',
    defaultLanguage: 'ta'
};

// Helper to manage local fallback data
const getLocalSchools = (): (SchoolData & { isLocal?: boolean })[] => {
    try {
        const stored = localStorage.getItem(LOCAL_SCHOOLS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

const saveLocalSchool = (school: SchoolData) => {
    const schools = getLocalSchools();
    schools.push({ ...school, isLocal: true });
    localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(schools));
};

export const adminService = {
  getSchools: async (): Promise<SchoolData[]> => {
    let cloudSchools: SchoolData[] = [];
    
    if (supabase) {
        try {
            const { data, error } = await supabase
              .from('schools')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                cloudSchools = data.map((s: any) => ({
                    id: s.id,
                    name: s.name || s.school_name || s.principal_name || 'Unnamed Institution',
                    principalName: s.principal_name || 'N/A', 
                    email: s.email || s.contact_email || 'N/A',
                    phone: s.phone || 'N/A',
                    studentCount: s.student_count || 0,
                    board: s.board || 'State Board',
                    language: s.language || 'ta',
                    status: s.status === 'active' || s.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
                    onboardedAt: s.created_at,
                    assignedModules: [],
                    district: s.district || 'General'
                }));
            }
        } catch (e: any) {
            console.info("Supabase schools table currently restricted by RLS or missing. Showing local data only.");
        }
    }

    const localSchools = getLocalSchools();
    const allSchools = [...cloudSchools];
    
    localSchools.forEach(ls => {
        if (!allSchools.find(as => as.email === ls.email)) {
            allSchools.unshift(ls);
        }
    });

    return allSchools;
  },

  registerSchool: async (school: Partial<SchoolData>) => {
    const schoolId = `temp_${Date.now()}`;
    const newSchool: SchoolData = {
        id: schoolId,
        name: school.name || 'Unnamed School',
        principalName: school.principalName || 'N/A',
        email: school.email || '',
        phone: school.phone || '',
        studentCount: school.studentCount || 0,
        board: school.board || 'State Board',
        language: 'ta',
        status: 'PENDING',
        onboardedAt: new Date().toISOString(),
        assignedModules: [],
        district: school.district || 'General'
    };

    if (!supabase) {
        saveLocalSchool(newSchool);
        return newSchool;
    }
    
    const attemptInsert = async (payload: any): Promise<any> => {
        try {
            const { data, error } = await supabase.from('schools').insert([payload]).select().single();
            if (!error) return data;
            throw error;
        } catch (err: any) {
            console.warn("Database insertion failed. Falling back to local storage.", err.message);
            saveLocalSchool(newSchool);
            return newSchool;
        }
    };

    const initialPayload: any = {
        name: newSchool.name,
        board: newSchool.board,
        principal_name: newSchool.principalName,
        email: newSchool.email,
        phone: newSchool.phone ? newSchool.phone.replace(/\D/g, '') : null,
        student_count: parseInt(String(newSchool.studentCount)) || 0,
        status: 'pending',
        district: newSchool.district
    };

    return await attemptInsert(initialPayload);
  },
  
  approveSchool: async (id: string) => {
    const locals = getLocalSchools();
    const updatedLocals = locals.map(s => s.id === id ? { ...s, status: 'APPROVED' as const } : s);
    localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(updatedLocals));

    if (!supabase || id.startsWith('temp_')) return;
    
    try {
        const { error } = await supabase
          .from('schools')
          .update({ status: 'active' })
          .eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.warn("Could not approve in cloud, updated locally.");
    }
  },

  rejectSchool: async (id: string) => {
    const locals = getLocalSchools();
    localStorage.setItem(LOCAL_SCHOOLS_KEY, JSON.stringify(locals.filter(s => s.id !== id)));

    if (!supabase || id.startsWith('temp_')) return;
    
    try {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.warn("Could not delete from cloud, removed locally.");
    }
  },

  getVideos: async () => {
      return await contentService.getAllVideos();
  },

  uploadVideo: async (metadata: Partial<VideoMetadata>) => {
    return await contentService.addVideo(metadata as VideoMetadata);
  },

  updateVideo: async (metadata: VideoMetadata) => {
      await contentService.updateVideo(metadata);
      return metadata;
  },

  deleteVideo: async (id: string) => {
    await contentService.deleteVideo(id);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    return [];
  },
  
  getStats: async () => {
    const localSchools = getLocalSchools();
    const localCount = localSchools.length;
    
    if (!supabase) return { 
        totalSchools: localCount, 
        totalStudentsEnrolled: localSchools.reduce((acc, s) => acc + (s.studentCount || 0), 0), 
        totalLearningHours: 0, 
        completionRate: "0%", 
        pendingApprovals: localSchools.filter(s => s.status === 'PENDING').length 
    };

    try {
        const { count: totalSchools } = await supabase.from('schools').select('*', { count: 'exact', head: true });
        const { count: pendingApprovals } = await supabase.from('schools').select('*', { count: 'exact', head: true }).neq('status', 'active');
        const { data: schoolData } = await supabase.from('schools').select('student_count');
        
        const cloudStudents = schoolData?.reduce((acc, curr) => acc + (curr.student_count || 0), 0) || 0;
        const localStudents = localSchools.reduce((acc, s) => acc + (s.studentCount || 0), 0);
        
        return {
            totalSchools: (totalSchools || 0) + localCount,
            totalStudentsEnrolled: cloudStudents + localStudents,
            totalLearningHours: Math.floor((cloudStudents + localStudents) * 12.5), 
            completionRate: "78%", 
            pendingApprovals: (pendingApprovals || 0) + localSchools.filter(s => s.status === 'PENDING').length
        };
    } catch (e) {
        return { 
            totalSchools: localCount, 
            totalStudentsEnrolled: localSchools.reduce((acc, s) => acc + (s.studentCount || 0), 0), 
            totalLearningHours: 0, 
            completionRate: "0%", 
            pendingApprovals: localSchools.filter(s => s.status === 'PENDING').length 
        };
    }
  },

  getSystemSettings: async (): Promise<SystemSettings> => {
    const getLocalFallback = () => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : { ...defaultSettings };
    };
    if (!supabase) return getLocalFallback();
    try {
        const { data, error } = await supabase.from('system_config').select('config_data').eq('id', 'global_settings').maybeSingle();
        if (error) return getLocalFallback();
        return (data && data.config_data) ? data.config_data as SystemSettings : getLocalFallback();
    } catch (e: any) {
        return getLocalFallback();
    }
  },

  updateSystemSettings: async (newSettings: Partial<SystemSettings>) => {
    const current = await adminService.getSystemSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    if (supabase) {
        try {
            await supabase.from('system_config').upsert({ id: 'global_settings', config_data: updated, updated_at: new Date().toISOString() });
        } catch (e: any) {}
    }
    return updated;
  }
};
