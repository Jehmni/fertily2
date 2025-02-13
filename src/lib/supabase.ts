
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid VITE_SUPABASE_URL format. It should be like: https://your-project-id.supabase.co'
  );
}

console.log('Initializing Supabase client with URL:', supabaseUrl); // Debug log

// Create the main client with full configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true, // Enable debug mode
    storage: window.localStorage,
    storageKey: 'supabase-auth-token',
  }
});

// Test the auth configuration
(async () => {
  try {
    console.log('Testing Supabase auth configuration...'); // Debug log
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
