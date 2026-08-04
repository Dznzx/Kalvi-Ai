
import { supabase } from './supabaseClient';
import { AppNotification } from '../types';

export const notificationService = {
    getNotifications: async (): Promise<AppNotification[]> => {
        if (!supabase) return [];
        
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_read', false)
                .order('created_at', { ascending: false });
            
            if (error) {
                if (error.code === '42P01') return []; // Table missing
                throw error;
            }

            return (data || []).map((n: any) => ({
                id: n.id,
                type: n.type || 'info',
                title: { en: n.title_en || 'Notification', ta: n.title_ta || 'அறிவிப்பு' },
                message: { en: n.message_en || n.message, ta: n.message_ta || '' },
                timestamp: new Date(n.created_at).getTime(),
                read: n.is_read,
                linkTo: n.link_to || 'schools'
            }));
        } catch (err) {
            console.error("Error fetching notifications:", err);
            return [];
        }
    },

    markAsRead: async (id: string) => {
        if (!supabase) return;
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    },

    markAllAsRead: async () => {
        if (!supabase) return;
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('is_read', false);
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    },

    addNotification: async (notification: any) => {
        if (!supabase) return;
        try {
            await supabase.from('notifications').insert({
                type: notification.type,
                title_en: notification.title.en,
                title_ta: notification.title.ta,
                message_en: notification.message.en,
                message_ta: notification.message.ta,
                link_to: notification.linkTo,
                is_read: false
            });
        } catch (err) {
            console.warn("Failed to create record in 'notifications' table.");
        }
    }
};
