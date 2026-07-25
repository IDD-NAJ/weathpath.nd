import Stripe from 'stripe'

export let stripe: Stripe | null = null

// Only initialize Stripe if the key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-15.acacia',
  })
}

// Helper to ensure Stripe is initialized
export function getStripe(): Stripe {
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return stripe
}
