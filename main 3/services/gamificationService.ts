
import { LeaderboardEntry, League, UserStats, Badge } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
    STATS: 'kalvi_user_stats',
    LAST_ACTIVITY: 'kalvi_last_activity'
};

const LEVEL_XP_STEP = 500;

// Helper to check if string is a valid UUID to prevent Supabase type errors
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const BADGES: Badge[] = [
    { id: 'b1', name: { en: "AI Pioneer", ta: "AI முன்னோடி" }, description: { en: "Completed your first AI module!", ta: "உங்கள் முதல் AI பாடத்தை முடித்துவிட்டீர்கள்!" }, icon: "🚀", unlocked: false },
    { id: 'b2', name: { en: "Flash Learner", ta: "மின்னல் கற்றவர்" }, description: { en: "Finished a module in record time!", ta: "குறுகிய நேரத்தில் ஒரு பாடத்தை முடித்தீர்கள்!" }, icon: "⚡", unlocked: false },
    { id: 'b3', name: { en: "Quiz Whiz", ta: "வினாடி வினா வித்தகர்" }, description: { en: "Scored 100% in a practice quiz!", ta: "வினாடி வினாவில் 100% மதிப்பெண் பெற்றீர்கள்!" }, icon: "🎯", unlocked: false },
    { id: 'b4', name: { en: "Streak Master", ta: "தொடர் கற்றல் நாயகன்" }, description: { en: "Maintained a 7-day learning streak!", ta: "7 நாட்கள் தொடர்ந்து கற்றல் மேற்கொண்டீர்கள்!" }, icon: "🔥", unlocked: false },
    { id: 'b5', name: { en: "Global Guru", ta: "உலகளாவிய குரு" }, description: { en: "Shared 5 study packets with friends!", ta: "5 பாடத் தொகுப்புகளை நண்பர்களுடன் பகிர்ந்தீர்கள்!" }, icon: "🌍", unlocked: false },
    { id: 'b6', name: { en: "Silver Scout", ta: "வெள்ளி சாரணர்" }, description: { en: "Reached the Silver League!", ta: "வெள்ளி லீக்கை அடைந்தீர்கள்!" }, icon: "🥈", unlocked: false }
];

const defaultStats: UserStats = {
    coins: 100,
    xp: 0,
    level: 1,
    league: 'Novice',
    badges: [],
    streak: 0
};

export const gamificationService = {
    getStats: (): UserStats => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.STATS);
            const stats = stored ? JSON.parse(stored) : { ...defaultStats };
            return gamificationService.updateStreak(stats);
        } catch { return { ...defaultStats }; }
    },

    syncFromSupabase: async (userId: string): Promise<UserStats> => {
        if (!supabase || !userId || !isUuid(userId)) return gamificationService.getStats();
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('xp, coins, streak, badges, level, league')
                .eq('id', userId)
                .maybeSingle();
            
            if (error) {
                // Silently fallback if table is missing or schema cache is stale
                if (error.code !== '42P01' && error.code !== 'PGRST103') {
                   console.debug("Supabase sync info:", error.message);
                }
                return gamificationService.getStats();
            }
            
            if (data) {
                const cloudStats: UserStats = {
                    xp: data.xp || 0,
                    coins: data.coins || 0,
                    streak: data.streak || 0,
                    badges: data.badges || [],
                    level: data.level || 1,
                    league: (data.league as League) || 'Novice'
                };
                localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(cloudStats));
                return cloudStats;
            }
        } catch (e: any) {
            // Silently ignore sync exceptions for mock/invalid users
        }
        return gamificationService.getStats();
    },

    updateStreak: (stats: UserStats): UserStats => {
        const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        if (!lastActivityStr) return stats;

        const lastActivity = new Date(lastActivityStr);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));

        if (diffDays > 1) {
            stats.streak = 0;
            gamificationService.saveStats(stats);
        }
        return stats;
    },

    saveStats: async (stats: UserStats, userId?: string) => {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, new Date().toISOString());
        window.dispatchEvent(new CustomEvent('gamification-update', { detail: stats }));

        if (supabase && userId && isUuid(userId)) {
            try {
                const { error } = await supabase.from('profiles').upsert({
                    id: userId,
                    xp: stats.xp,
                    coins: stats.coins,
                    streak: stats.streak,
                    badges: stats.badges,
                    level: stats.level,
                    league: stats.league,
                    updated_at: new Date().toISOString()
                });
                if (error) throw error;
            } catch (e: any) {
                // Ignore sync errors for local/demo accounts
            }
        }
    },

    calculateLevel: (xp: number): number => Math.floor(xp / LEVEL_XP_STEP) + 1,

    calculateLeague: (level: number): League => {
        if (level >= 20) return 'Grandmaster';
        if (level >= 15) return 'Master';
        if (level >= 10) return 'Expert';
        if (level >= 5) return 'Apprentice';
        return 'Novice';
    },

    calculateRank: (xp: number): number => {
        const baseRank = 1500;
        return Math.max(1, baseRank - Math.floor(xp / 50));
    },

    awardXpAndCoins: async (xpAmount: number, coinAmount: number, reason: string, userId?: string) => {
        const stats = gamificationService.getStats();
        const oldLevel = stats.level;
        const oldLeague = stats.league;

        stats.xp += xpAmount;
        stats.coins += coinAmount;
        
        const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        const today = new Date();
        if (lastActivityStr) {
            const lastActivity = new Date(lastActivityStr);
            if (today.toDateString() !== lastActivity.toDateString()) {
                stats.streak += 1;
            }
        } else {
            stats.streak = 1;
        }

        stats.level = gamificationService.calculateLevel(stats.xp);
        stats.league = gamificationService.calculateLeague(stats.level);

        if (stats.level > oldLevel) {
            stats.coins += stats.level * 50;
            window.dispatchEvent(new CustomEvent('level-up', { detail: { level: stats.level } }));
        }

        if (stats.league !== oldLeague) {
            stats.coins += 500;
            window.dispatchEvent(new CustomEvent('league-promotion', { detail: { league: stats.league } }));
        }

        await gamificationService.saveStats(stats, userId);
        
        window.dispatchEvent(new CustomEvent('coins-updated', { 
            detail: { amount: coinAmount, xp: xpAmount, reason, newBalance: stats.coins } 
        }));
    },

    unlockBadge: async (badgeId: string, userId?: string) => {
        const stats = gamificationService.getStats();
        if (!stats.badges.includes(badgeId)) {
            stats.badges.push(badgeId);
            await gamificationService.saveStats(stats, userId);
            const badge = BADGES.find(b => b.id === badgeId);
            window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: badge }));
        }
    },

    getLeaderboard: (): LeaderboardEntry[] => {
        return [
            { rank: 1, name: "Arun Kumar", school: "Govt HSS Chennai", coins: 4500, xp: 12500, league: 'Grandmaster' },
            { rank: 2, name: "Priya S", school: "Sunshine Academy", coins: 3800, xp: 9200, league: 'Master' },
            { rank: 124, name: "You", school: "My School", coins: 0, xp: 0, league: 'Novice' }
        ];
    },

    getBadges: (): Badge[] => {
        const stats = gamificationService.getStats();
        return BADGES.map(b => ({
            ...b,
            unlocked: stats.badges.includes(b.id)
        }));
    }
};
