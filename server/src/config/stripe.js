import Stripe from 'stripe';

import { env, isStripeConfigured, isStripeTestMode, stripeMode } from './env.js';
import { logger } from './logger.js';

let stripeClient = null;

export const getStripe = () => {
  if (!isStripeConfigured) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
    logger.info(`Stripe initialized in ${stripeMode} mode${isStripeTestMode ? ' (test cards only)' : ''}`);
  }
  return stripeClient;
};

export const getStripeConfig = () => ({
  mode: stripeMode,
  testMode: isStripeTestMode,
  configured: isStripeConfigured,
  publishableKey: env.STRIPE_PUBLISHABLE_KEY || null,
  webhookConfigured: Boolean(env.STRIPE_WEBHOOK_SECRET),
});
