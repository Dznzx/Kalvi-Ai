
import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/notificationService';
import { TRANSLATIONS } from '../../constants';
import { EmptyState } from './EmptyState';

interface NotificationMenuProps {
    language: 'en' | 'ta';
    onNavigate?: (tab: string) => void;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({ language, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const t = TRANSLATIONS[language];

    const fetchNotifications = async () => {
        const list = await notificationService.getNotifications();
        setNotifications(list);
        setUnreadCount(list.length); // Since service only returns unread by default now
    };

    // Poll for notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // 15s polling
        return () => clearInterval(interval);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
    };

    const handleItemClick = async (notification: AppNotification) => {
        // 1. Mark as read in DB
        await notificationService.markAsRead(notification.id);
        
        // 2. Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // 3. Redirect if applicable
        if (notification.linkTo && onNavigate) {
            onNavigate(notification.linkTo);
        }
        setIsOpen(false);
    };

    const handleMarkSingleRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="relative">
            <button 
                onClick={toggleOpen}
                className="relative p-2 text-gray-500 hover:text-kalvi-blue transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#111827] animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animate-fade-in-up">
                        <div className="p-4 border-b bg-gray-50 dark:bg-black/20 flex justify-between items-center border-gray-100 dark:border-white/5">
                            <h3 className="font-bold text-gray-700 dark:text-white text-sm">Notifications ({unreadCount})</h3>
                            <div className="flex gap-3">
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-kalvi-blue hover:underline">
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)}><X size={16} className="text-gray-400" /></button>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-[#1A1F2E]">
                            {notifications.length === 0 ? (
                                <div className="p-6">
                                    <EmptyState 
                                        title={t.noNotificationsTitle} 
                                        description={t.noNotificationsDesc} 
                                        icon={<Bell size={24} />}
                                    />
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => handleItemClick(notif)}
                                        className="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer group"
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                                notif.type === 'success' ? 'bg-green-500' : 
                                                notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`} />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{notif.title[language]}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message[language]}</p>
                                                <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleMarkSingleRead(e, notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-400 transition-all"
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
