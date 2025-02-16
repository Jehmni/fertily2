
interface Config {
  env: 'development' | 'production' | 'test';
  supabaseUrl: string;
  supabaseKey: string;
  features: {
    analytics: boolean;
    chat: boolean;
    voice: boolean;
  };
}

export const Config: Config = {
  env: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  features: {
    analytics: true,
    chat: true,
    voice: true,
  },
};
