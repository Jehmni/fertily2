import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Config } from '@/config';
import type { User, Profile, ChatMessage, AnalyticsEvent } from '@/types';
import { AuthError, ValidationError, ApiError } from '@/lib/errors';

class ApiClient {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(Config.supabaseUrl, Config.supabaseKey);
  }

  auth = {
    getSession: async () => {
      return this.client.auth.getSession();
    },
    signIn: async (email: string, password: string) => {
      return this.client.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      return this.client.auth.signUp({ email, password });
    },
    signOut: async () => {
      return this.client.auth.signOut();
    },
  };

  users = {
    getProfile: async (userId: string) => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    updateProfile: async (userId: string, profile: Partial<Profile>) => {
      const { data, error } = await this.client
        .from('profiles')
        .update(profile)
        .eq('id', userId);
      
      if (error) throw error;
      return data;
    },
  };

  chat = {
    sendMessage: async (message: string) => {
      const { data, error } = await this.client
        .functions.invoke('chat', {
          body: { message }
        });
      
      if (error) throw error;
      return data as { response: string };
    },
    getHistory: async () => {
      const { data, error } = await this.client
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
  };

  analytics = {
    trackEvent: async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
      const { error } = await this.client
        .from('analytics_events')
        .insert(event);
      
      if (error) throw error;
    },
    getEvents: async (startDate: Date, endDate: Date) => {
      const { data, error } = await this.client
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      return data as AnalyticsEvent[];
    },
  };

  private handleError(error: any): never {
    if (error.status === 401) {
      throw new AuthError(error.message);
    }
    
    if (error.code === 'VALIDATION_ERROR') {
      throw new ValidationError(error.message);
    }
    
    throw new ApiError(error.message || 'An unexpected error occurred');
  }
}

export const apiClient = new ApiClient(); 