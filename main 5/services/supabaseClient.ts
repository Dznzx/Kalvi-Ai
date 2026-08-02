
import { createClient } from '@supabase/supabase-js';

// Loaded from environment variables at build time — see vite.config.ts
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

let client = null;

try {
    if (SUPABASE_URL && SUPABASE_KEY) {
        client = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.error("Failed to initialize Supabase client:", e);
}

export const supabase = client;
export const isSupabaseConfigured = !!client;
