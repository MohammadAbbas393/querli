import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    queriesLimit: 50,
    connectionsLimit: 1,
    features: ['50 queries/month', '1 database connection', 'Bar & line charts'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    queriesLimit: 500,
    connectionsLimit: 5,
    features: ['500 queries/month', '5 database connections', 'All chart types', 'Query history', 'Priority support'],
  },
  business: {
    name: 'Business',
    price: 79,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    queriesLimit: -1, // unlimited
    connectionsLimit: 20,
    features: ['Unlimited queries', '20 database connections', 'All chart types', 'Query history', 'CSV export', 'Priority support'],
  },
} as const

export type Plan = keyof typeof PLANS
