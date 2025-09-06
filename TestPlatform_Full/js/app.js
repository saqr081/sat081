// Shared app helpers (Supabase client integration placeholder)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { supabaseUrl, supabaseKey } from '../config/supabaseConfig.js';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Simple helper to show errors
export function showErr(e){ console.error(e); alert(e.message || e); }
