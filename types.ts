export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  type: 'short-reply' | 'viral-tweet';
  input: any;
  result: string;
  createdAt: Date;
}

export interface SocialPost {
  hook: string;
  body: string;
}

// New types for Subscription Management
export type PlanId = 'hobby' | 'pro' | 'team';

export interface Subscription {
    plan: PlanId;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: Date;
}
