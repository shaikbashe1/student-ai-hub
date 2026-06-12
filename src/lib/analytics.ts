/**
 * Analytics tracking helper for Google Analytics 4 (GA4)
 */

export function track(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined") {
    // If real gtag is configured, use it
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params);
    }
    
    // Always log to console in development block to confirm tracking triggers
    console.info(`[Analytics Tracking]: Event "${eventName}" recorded`, params || {});

    // Option to push to simple local diagnostics or server logs
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, params, timestamp: new Date().toISOString() }),
    }).catch(() => {
      // Slient catch for offline or standalone states
    });
  }
}
