import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
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
    queriesLimit: -1,
    connectionsLimit: 20,
    features: ['Unlimited queries', '20 database connections', 'All chart types', 'Query history', 'CSV export', 'Priority support'],
  },
} as const

export type Plan = keyof typeof PLANS
