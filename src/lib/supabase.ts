import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}

// Validate URL format and accessibility
const validateSupabaseUrl = async (url: string) => {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('supabase')) {
      throw new Error('Invalid Supabase URL format');
    }
    
    // Test if the URL is accessible
    const response = await fetch(`${url}/rest/v1/`);
    if (!response.ok) {
      throw new Error('Could not connect to Supabase');
    }
  } catch (error: any) {
    if (error.message.includes('Failed to fetch') || error instanceof TypeError) {
      throw new Error(
        'Cannot connect to Supabase. Please check your internet connection and try again.'
      );
    }
    throw error;
  }
};

// Initialize and validate connection
(async () => {
  try {
    console.log('Validating Supabase URL:', supabaseUrl);
    await validateSupabaseUrl(supabaseUrl);
    console.log('Supabase URL validation successful');
  } catch (error) {
    console.error('Supabase initialization error:', error);
  }
})();

// Create the main client with full configuration
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

// Test the auth configuration
(async () => {
  try {
    console.log('Testing Supabase auth configuration...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase. Session:', data);
    }
  } catch (err) {
    console.error('Caught error testing Supabase connection:', err);
  }
})();
