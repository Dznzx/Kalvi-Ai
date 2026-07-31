
interface QueuedSubmission {
    moduleId: string;
    answer: string;
    timestamp: number;
}

const STORAGE_KEYS = {
    COMPLETED_MODULES: 'bharatStack_completed_modules',
    DOWNLOADED_MODULES: 'bharatStack_downloaded_modules',
    SUBMISSION_QUEUE: 'bharatStack_submission_queue'
};

export const offlineStorage = {
    // --- Progress Management ---
    getCompletedModules: (): string[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED_MODULES);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    },

    saveCompletedModule: (moduleId: string) => {
        const current = offlineStorage.getCompletedModules();
        if (!current.includes(moduleId)) {
            const updated = [...current, moduleId];
            localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify(updated));
        }
    },

    // --- Offline Content Management (Simulation) ---
    getDownloadedModules: (): string[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.DOWNLOADED_MODULES);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    },

    toggleModuleDownload: (moduleId: string): boolean => {
        const current = offlineStorage.getDownloadedModules();
        let updated;
        let isDownloaded = false;

        if (current.includes(moduleId)) {
            updated = current.filter(id => id !== moduleId);
            isDownloaded = false;
        } else {
            updated = [...current, moduleId];
            isDownloaded = true;
        }
        localStorage.setItem(STORAGE_KEYS.DOWNLOADED_MODULES, JSON.stringify(updated));
        return isDownloaded;
    },

    // --- Assessment Queue ---
    queueSubmission: (moduleId: string, answer: string) => {
        const queue: QueuedSubmission[] = offlineStorage.getQueue();
        queue.push({ moduleId, answer, timestamp: Date.now() });
        localStorage.setItem(STORAGE_KEYS.SUBMISSION_QUEUE, JSON.stringify(queue));
    },

    getQueue: (): QueuedSubmission[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSION_QUEUE);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    },

    clearQueue: () => {
        localStorage.removeItem(STORAGE_KEYS.SUBMISSION_QUEUE);
    },

    // Sync Logic
    syncPendingSubmissions: async (): Promise<number> => {
        const queue = offlineStorage.getQueue();
        if (queue.length === 0) return 0;

        // In a real app, we would POST these to the backend here.
        // For this demo, we assume "syncing" simply means processing them 
        // and ensuring they are marked as completed in the main state.
        
        console.log(`Syncing ${queue.length} items to server...`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // After successful sync, clear queue
        offlineStorage.clearQueue();
        return queue.length;
    }
};
