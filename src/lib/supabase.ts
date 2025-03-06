
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

// Initialize storage configuration without trying to create buckets
const storageConfig = {
  buckets: ['embryo-images', 'consultant-images']
};

export const supabase = createClient(validatedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase-auth-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  }
});

// Only log auth state changes in development, and only if they represent actual changes
if (process.env.NODE_ENV === 'development') {
  let previousAuthState = null;
  supabase.auth.onAuthStateChange((event, session) => {
    // Only log if the auth state actually changed
    if (event !== previousAuthState) {
      if (event === 'SIGNED_IN') {
        console.log('Successfully authenticated:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
      previousAuthState = event;
    }
  });
}
