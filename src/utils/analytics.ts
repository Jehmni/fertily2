
import { supabase } from "@/lib/supabase";

type AnalyticsEventType = 'page_view' | 'feature_usage' | 'error' | 'user_engagement' | 'performance';

type AnalyticsEvent = {
  event_type: AnalyticsEventType;
  event_name: string;
  properties?: Record<string, any>;
};

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: session.user.id,
        event_type: event.event_type,
        event_name: event.event_name,
        properties: event.properties,
      });

    if (error) throw error;

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics event:', {
        userId: session.user.id,
        ...event,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Utility functions for common events
export const trackPageView = (pageName: string) => {
  return trackEvent({
    event_type: 'page_view',
    event_name: `viewed_${pageName}`,
    properties: { page: pageName },
  });
};

export const trackFeatureUsage = (featureName: string, properties?: Record<string, any>) => {
  return trackEvent({
    event_type: 'feature_usage',
    event_name: `used_${featureName}`,
    properties,
  });
};

export const trackError = (errorName: string, error: any) => {
  return trackEvent({
    event_type: 'error',
    event_name: errorName,
    properties: {
      message: error.message,
      stack: error.stack,
    },
  });
};
