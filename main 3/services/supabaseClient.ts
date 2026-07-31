
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for immediate stability
const SUPABASE_URL = 'https://aotawhotdtluhpalqavu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdGF3aG90ZHRsdWhwYWxxYXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTQwNTQsImV4cCI6MjA4MjE3MDA1NH0.3BsGOGiVoHaeccXdN8jAUGak1-5QttCTkOpWMX3q7O4';

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
