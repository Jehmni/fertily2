interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // First Contentful Paint
    const paintObserver = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entries) => {
      const lastEntry = entries.getEntries().pop();
      if (lastEntry) {
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        if (entry.name === 'first-input') {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public trackPageLoad(pageName: string) {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.timeToFirstByte = navigationEntry.responseStart - navigationEntry.requestStart;
    }
    
    console.log(`Page Load Metrics for ${pageName}:`, this.getMetrics());
  }
}

export const performanceMonitor = new PerformanceMonitor(); 