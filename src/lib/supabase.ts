
import { createClient } from '@supabase/supabase-js';

// Ensure URL and key are properly formatted
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}

// Validate URL format with improved error messages
const validateSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase')) {
      throw new Error('Invalid Supabase URL format');
    }
    
    // Add protocol if missing
    if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    return url;
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error('Invalid Supabase URL format');
  }
};

// Validate and normalize URL
const validatedUrl = validateSupabaseUrl(supabaseUrl);

// Create the Supabase client with improved configuration
export const supabase = createClient(validatedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token',
    storage: window.localStorage,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url: RequestInfo | URL, init?: RequestInit) => {
      return fetch(url, init).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }).catch(err => {
        if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
          throw new Error('Unable to connect to Supabase. Please check your network connection and try again.');
        }
        throw err;
      });
    }
  }
});

// Test auth configuration with improved error handling
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Successfully authenticated:', session);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else {
    console.log('Auth state changed:', event, session);
  }
});
