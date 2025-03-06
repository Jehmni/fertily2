
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}

const validateSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase')) {
      throw new Error('Invalid Supabase URL format');
    }
    
    if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    return url;
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error('Invalid Supabase URL format');
  }
};

const validatedUrl = validateSupabaseUrl(supabaseUrl);

export const supabase = createClient(validatedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth-token',
    storage: window.localStorage,
    flowType: 'pkce',
    retryAttempts: 1, // Reduce retry attempts
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5s timeout
      });
      
      try {
        const response = await Promise.race([
          fetch(url, init),
          timeoutPromise
        ]) as Response;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (err) {
        if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
          throw new Error('Unable to connect to Supabase. Please check your network connection and try again.');
        }
        throw err;
      }
    }
  }
});

// Only add listeners in development
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('Successfully authenticated:', session?.user?.email);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
  });
}
