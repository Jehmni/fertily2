type EventName = 'page_view' | 'button_click' | 'error' | 'chat_message';

interface EventProperties {
  [key: string]: string | number | boolean;
}

export const analytics = {
  track: (eventName: EventName, properties?: EventProperties) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, properties);
      return;
    }
    
    // Implement real analytics tracking
  },
  
  page: (pageName: string) => {
    analytics.track('page_view', { page: pageName });
  },
  
  error: (error: Error) => {
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
    });
  },
}; 