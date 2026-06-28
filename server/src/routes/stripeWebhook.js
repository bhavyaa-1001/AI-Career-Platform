import express from 'express';

import { env, isStripeWebhookConfigured } from '../config/env.js';
import { getStripe } from '../config/stripe.js';
import { handleStripeWebhook } from '../services/saas/stripeService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    if (!isStripeWebhookConfigured) {
      throw new ApiError(503, 'Stripe webhook is not configured');
    }

    const stripe = getStripe();
    const signature = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
    }

    await handleStripeWebhook(event);
    res.json({ received: true });
  }),
);

export default router;
