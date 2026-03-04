import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder";

// Check dev mode to prevent background client errors
const isDevMode = typeof window !== 'undefined' && localStorage.getItem('devMode') === 'true';

// We know this specific URL in .env is broken/paused, which causes ERR_NAME_NOT_RESOLVED.
// Additionally, a corrupted token in localStorage will cause infinite refresh loops.
const isBrokenUrl = SUPABASE_URL.includes("placeholder") || SUPABASE_URL.includes("evwjffiiahxlbrwkltht");

// Purge the stale session from localStorage to prevent the GoTrueClient from trying to fetch/refresh
if (typeof window !== 'undefined' && (isDevMode || isBrokenUrl)) {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Failed to clear local storage", e);
  }
}

// Ensure background refresh is totally disabled if the URL is known to be dead or dev mode is on
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: !(isDevMode || isBrokenUrl),
    persistSession: !(isDevMode || isBrokenUrl),
    detectSessionInUrl: !(isDevMode || isBrokenUrl)
  }
});
