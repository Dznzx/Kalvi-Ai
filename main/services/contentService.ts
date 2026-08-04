
import { supabase } from './supabaseClient';
import { Module, GradeGroup, VideoMetadata, VideoAsset } from '../types';

// Helper to check if string is a valid UUID
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const contentService = {
    getModules: async (grade: GradeGroup): Promise<Module[]> => {
        if (!supabase) return [];

        try {
            let query = supabase
                .from('courses')
                .select('*')
                .eq('visibility', 'public')
                .order('created_at', { ascending: false });

            if (grade === '6-8') {
                query = query.in('grade_level', ['6-8', '6', '7', '8']);
            } else if (grade === '9-12') {
                query = query.in('grade_level', ['9-12', '9', '10', '11', '12']);
            }

            const { data, error } = await query;
            if (error) {
                if (error.code === '42P01') {
                    console.warn("Courses table not found in database.");
                    return [];
                }
                throw error;
            }

            return (data || []).map(row => ({
                id: row.id,
                title: { en: row.title, ta: row.title }, 
                description: { en: row.description || '', ta: row.description || '' },
                category: row.category || undefined,
                video: {
                    id: `v_${row.id}`,
                    status: 'ready',
                    cdnUrl: row.video_url,
                    posterUrl: row.thumbnail_url
                } as VideoAsset,
                content: { 
                    en: row.description || "Video lesson content.", 
                    ta: row.description || "வீடியோ பாடம் உள்ளடக்கம்." 
                },
                assessmentTask: {
                    en: "Watch the video and summarize key points.",
                    ta: "வீடியோவைப் பார்த்து முக்கிய குறிப்புகளை சுருக்கவும்."
                }
            }));
        } catch (err: any) {
            console.error("Error fetching modules:", err?.message || "Unknown error");
            return [];
        }
    },

    getStudentProgress: async (userId: string): Promise<string[]> => {
        // Prevent UUID syntax error for mock IDs
        if (!supabase || !userId || !isUuid(userId)) return [];
        try {
            const { data, error } = await supabase
                .from('student_progress')
                .select('course_id')
                .eq('user_id', userId);
            
            if (error) {
                if (error.code === '42P01') return [];
                throw error;
            }
            return (data || []).map(p => p.course_id);
        } catch (e: any) {
            // Silently handle invalid UUID or missing table for demo
            return [];
        }
    },

    markModuleComplete: async (userId: string, moduleId: string) => {
        // Prevent UUID syntax error for mock IDs
        if (!supabase || !userId || !isUuid(userId)) return;
        try {
            const { error } = await supabase
                .from('student_progress')
                .upsert({
                    user_id: userId,
                    course_id: moduleId,
                    completed_at: new Date().toISOString()
                }, { onConflict: 'user_id, course_id' });

            if (error) throw error;
        } catch (e: any) {
            // Silent failure for cloud sync on mock/invalid accounts
        }
    },

    getAllVideos: async (): Promise<VideoMetadata[]> => {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(row => ({
                id: row.id,
                titleEn: row.title,
                titleTa: row.title, 
                descEn: row.description,
                descTa: row.description,
                status: 'ready',
                visibility: row.visibility || 'public',
                category: row.category || 'AI Design',
                gradeGroup: row.grade_level as GradeGroup,
                isMobileOptimized: true,
                assignedSchoolIds: [],
                createdAt: new Date(row.created_at).toLocaleDateString(),
                views: 0,
                thumbnailUrl: row.thumbnail_url,
                hlsUrl: row.video_url
            }));
        } catch (err: any) {
            console.error("Error in getAllVideos:", err?.message || "Unknown error");
            return [];
        }
    },

    addVideo: async (video: VideoMetadata): Promise<Module | null> => {
        if (!supabase) throw new Error("Database connection missing.");
        try {
            const { data, error } = await supabase
                .from('courses')
                .insert([{
                    title: video.titleEn,
                    description: video.descEn,
                    video_url: video.hlsUrl,
                    thumbnail_url: video.thumbnailUrl,
                    grade_level: video.gradeGroup,
                    category: video.category,
                    visibility: video.visibility
                }])
                .select()
                .single();
            if (error) throw error;
            return {
                id: data.id,
                title: { en: data.title, ta: data.title },
                description: { en: data.description, ta: data.description },
                video: { id: `v_${data.id}`, status: 'ready', cdnUrl: data.video_url, posterUrl: data.thumbnail_url },
                content: { en: data.description, ta: data.description },
                assessmentTask: { en: "Watch the video.", ta: "வீடியோவைப் பார்க்கவும்." }
            };
        } catch (err: any) {
            throw new Error(err?.message || "Failed to add video to database.");
        }
    },

    updateVideo: async (video: VideoMetadata) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    title: video.titleEn,
                    description: video.descEn,
                    video_url: video.hlsUrl,
                    thumbnail_url: video.thumbnailUrl,
                    grade_level: video.gradeGroup,
                    category: video.category,
                    visibility: video.visibility
                })
                .eq('id', video.id);
            
            if (error) throw error;
        } catch (err: any) {
            throw new Error(err?.message || "Database update failed.");
        }
    },

    deleteVideo: async (id: string) => {
        if (!supabase) throw new Error("Database not connected.");
        try {
            // 1. Clear progress records
            await supabase.from('student_progress').delete().eq('course_id', id);

            // 2. Fetch metadata for cleanup
            const { data: course } = await supabase
                .from('courses')
                .select('video_url, thumbnail_url')
                .eq('id', id)
                .maybeSingle();

            // 3. Delete record
            const { error: dbError } = await supabase.from('courses').delete().eq('id', id);
            if (dbError) throw dbError;

            // 4. Background cleanup
            if (course) {
                const extractPath = (url: string) => {
                    if (!url || !url.includes('/videos/')) return null;
                    return url.split('/videos/').pop();
                };
                const paths = [extractPath(course.video_url), extractPath(course.thumbnail_url)].filter(Boolean) as string[];
                if (paths.length > 0) {
                    supabase.storage.from('videos').remove(paths).catch(() => {});
                }
            }
            return true;
        } catch (err: any) {
            console.error("Purge failed:", err?.message || "Internal database error");
            throw err;
        }
    }
};
