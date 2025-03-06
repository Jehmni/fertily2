
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
    storage: window.localStorage,
    storageKey: 'supabase-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
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
