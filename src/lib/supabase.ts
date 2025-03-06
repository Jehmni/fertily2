
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}

// Validate URL format
const validateSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase')) {
      throw new Error('Invalid Supabase URL format');
    }
    return true;
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error('Invalid Supabase URL format');
  }
};

// Validate URL format
validateSupabaseUrl(supabaseUrl);

// Create the Supabase client with configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token',
    storage: window.localStorage,
  },
  global: {
    fetch: (url: RequestInfo | URL, init?: RequestInit) => {
      return fetch(url, init).catch(err => {
        if (err.message === 'Failed to fetch') {
          throw new Error('Network error: Please check your internet connection');
        }
        throw err;
      });
    }
  }
});

// Test auth configuration
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});

