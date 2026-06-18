declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      identify: (id: string, props?: Record<string, unknown>) => void;
      reset: () => void;
    };
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (window.posthog) window.posthog.capture(event, properties);
  if (window.gtag) window.gtag('event', event, properties);
}

export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (window.posthog) window.posthog.identify(userId, traits);
  if (window.gtag) window.gtag('set', 'user_id', userId);
}

export const Analytics = {
  aiRequestMade: (toolType: string, plan: string) =>
    trackEvent('ai_request', { tool_type: toolType, plan }),
  resumeAnalyzed: (atsScore: number) =>
    trackEvent('resume_analyzed', { ats_score: atsScore }),
  interviewStarted: (mode: string) =>
    trackEvent('interview_started', { mode }),
  challengeSolved: (difficulty: string, language: string) =>
    trackEvent('challenge_solved', { difficulty, language }),
  internshipViewed: (company: string, role: string) =>
    trackEvent('internship_viewed', { company, role }),
  subscriptionStarted: (plan: string) =>
    trackEvent('subscription_started', { plan }),
  pageViewed: (page: string) =>
    trackEvent('page_view', { page }),
};
