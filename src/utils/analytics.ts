
import { supabase } from "@/lib/supabase";

type AnalyticsEvent = {
  event_name: string;
  properties?: Record<string, any>;
};

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    console.log('Analytics event:', {
      userId: session.user.id,
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Here you would typically send this to your analytics service
    // For now, we'll just log it to the console
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};
