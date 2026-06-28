import { env } from '../../config/env.js';
import { getStripe, getStripeConfig } from '../../config/stripe.js';
import { Plan } from '../../models/admin/Plan.js';
import { Subscription } from '../../models/admin/Subscription.js';
import { Invoice } from '../../models/saas/Invoice.js';
import { Payment } from '../../models/saas/Payment.js';
import { ApiError } from '../../utils/ApiError.js';
import { createNotification } from '../notificationService.js';

import { getOrCreateBillingAccount, getUserPlan } from './billingAccountService.js';
import { sendBillingEmail } from './billingEmailService.js';

const successUrl = () => `${env.CLIENT_URL}/billing?success=1&session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl = () => `${env.CLIENT_URL}/billing?cancelled=1`;

export const ensureStripeCustomer = async (user) => {
  const stripe = getStripe();
  if (!stripe) throw new ApiError(503, 'Stripe is not configured');

  const account = await getOrCreateBillingAccount(user._id);
  if (account.stripeCustomerId) return { stripe, account, customerId: account.stripeCustomerId };

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: { userId: user._id.toString() },
  });

  account.stripeCustomerId = customer.id;
  await account.save();
  return { stripe, account, customerId: customer.id };
};

export const createCheckoutSession = async (user, { planSlug, couponCode } = {}) => {
  const plan = await Plan.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw new ApiError(404, 'Plan not found');
  if (plan.price <= 0) throw new ApiError(400, 'Free plan does not require checkout');

  const { stripe, customerId } = await ensureStripeCustomer(user);

  const sessionParams = {
    mode: 'subscription',
    customer: customerId,
    success_url: successUrl(),
    cancel_url: cancelUrl(),
    line_items: plan.stripePriceId
      ? [{ price: plan.stripePriceId, quantity: 1 }]
      : [{
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: { name: plan.name, description: plan.description },
            unit_amount: Math.round(plan.price * 100),
            recurring: { interval: plan.interval === 'yearly' ? 'year' : 'month' },
          },
          quantity: 1,
        }],
    metadata: { userId: user._id.toString(), planId: plan._id.toString(), planSlug: plan.slug },
    subscription_data: plan.trialDays
      ? { trial_period_days: plan.trialDays, metadata: { userId: user._id.toString(), planId: plan._id.toString() } }
      : { metadata: { userId: user._id.toString(), planId: plan._id.toString() } },
  };

  if (couponCode) sessionParams.discounts = [{ coupon: couponCode }];

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url, sessionId: session.id, testMode: getStripeConfig().testMode };
};

export const confirmCheckoutSession = async (user, sessionId) => {
  const stripe = getStripe();
  if (!stripe) throw new ApiError(503, 'Stripe is not configured');
  if (!sessionId) throw new ApiError(400, 'Session ID is required');

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  if (session.metadata?.userId !== user._id.toString()) {
    throw new ApiError(403, 'Checkout session does not belong to this account');
  }

  if (session.status !== 'complete') {
    throw new ApiError(400, 'Checkout session is not complete yet');
  }

  if (session.subscription) {
    const stripeSub = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;
    await syncSubscriptionFromStripe(stripeSub);
    await createNotification(user._id, {
      type: 'system',
      title: 'Subscription activated',
      message: 'Your subscription is now active.',
      link: '/billing',
    });
  }

  return { confirmed: true, paymentStatus: session.payment_status };
};

export const createPortalSession = async (user) => {
  const { stripe, customerId } = await ensureStripeCustomer(user);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.CLIENT_URL}/billing`,
  });
  return { url: session.url };
};

export const cancelSubscription = async (user, { immediately = false } = {}) => {
  const account = await getOrCreateBillingAccount(user._id);
  if (!account.activeSubscriptionId) throw new ApiError(404, 'No active subscription');

  const sub = await Subscription.findById(account.activeSubscriptionId);
  if (!sub) throw new ApiError(404, 'Subscription not found');

  if (sub.stripeSubscriptionId && getStripe()) {
    if (immediately) {
      await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
    } else {
      await getStripe().subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
      sub.cancelAtPeriodEnd = true;
    }
  } else {
    sub.status = immediately ? 'cancelled' : sub.status;
    sub.cancelAtPeriodEnd = !immediately;
    if (immediately) sub.cancelledAt = new Date();
  }

  await sub.save();
  return sub.toSafeObject();
};

export const syncSubscriptionFromStripe = async (stripeSub) => {
  const userId = stripeSub.metadata?.userId;
  const planId = stripeSub.metadata?.planId;
  if (!userId) return null;

  const statusMap = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    incomplete: 'incomplete',
  };

  let sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
  if (!sub) {
    sub = await Subscription.create({
      userId,
      planId,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: stripeSub.customer,
    });
  }

  sub.status = statusMap[stripeSub.status] || 'active';
  sub.amount = (stripeSub.items?.data?.[0]?.price?.unit_amount || 0) / 100;
  sub.currency = (stripeSub.currency || 'usd').toUpperCase();
  sub.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
  sub.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
  sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
  sub.trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
  if (stripeSub.status === 'canceled') sub.cancelledAt = new Date();
  await sub.save();

  const account = await getOrCreateBillingAccount(userId);
  account.activeSubscriptionId = sub.status === 'cancelled' ? null : sub._id;
  account.planId = planId || account.planId;
  await account.save();

  return sub;
};

export const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.subscription) {
        const stripe = getStripe();
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscriptionFromStripe(stripeSub);
        if (session.metadata?.userId) {
          await createNotification(session.metadata.userId, {
            type: 'system',
            title: 'Subscription activated',
            message: 'Your subscription is now active. Enjoy your upgraded features!',
            link: '/billing',
          });
          await sendBillingEmail(session.metadata.userId, 'subscription_activated', { session });
        }
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscriptionFromStripe(event.data.object);
      break;
    case 'invoice.paid': {
      const inv = event.data.object;
      const userId = inv.metadata?.userId || inv.subscription_details?.metadata?.userId;
      if (userId) {
        await Invoice.findOneAndUpdate(
          { stripeInvoiceId: inv.id },
          {
            userId,
            stripeInvoiceId: inv.id,
            number: inv.number || '',
            status: 'paid',
            amountDue: (inv.amount_due || 0) / 100,
            amountPaid: (inv.amount_paid || 0) / 100,
            tax: (inv.tax || 0) / 100,
            currency: inv.currency?.toUpperCase(),
            pdfUrl: inv.invoice_pdf || '',
            hostedUrl: inv.hosted_invoice_url || '',
            paidAt: new Date(),
          },
          { upsert: true },
        );
        await Payment.create({
          userId,
          stripePaymentIntentId: inv.payment_intent || '',
          amount: (inv.amount_paid || 0) / 100,
          currency: inv.currency?.toUpperCase(),
          status: 'succeeded',
          description: `Invoice ${inv.number || inv.id}`,
        });
        await createNotification(userId, {
          type: 'system',
          title: 'Payment successful',
          message: `Your payment of ${((inv.amount_paid || 0) / 100).toFixed(2)} ${inv.currency?.toUpperCase()} was successful.`,
          link: '/billing/invoices',
        });
      }
      break;
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object;
      const userId = inv.metadata?.userId;
      if (userId) {
        await createNotification(userId, {
          type: 'system',
          title: 'Payment failed',
          message: 'Your subscription payment failed. Please update your payment method.',
          link: '/billing',
        });
        await sendBillingEmail(userId, 'payment_failed', { invoice: inv });
      }
      break;
    }
    default:
      break;
  }
  return { received: true };
};

export const getPaymentHistory = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments({ userId }),
  ]);
  return {
    payments: payments.map((p) => p.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getInvoices = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [invoices, total] = await Promise.all([
    Invoice.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Invoice.countDocuments({ userId }),
  ]);
  return {
    invoices: invoices.map((i) => i.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getStripeStatus = () => getStripeConfig();

export const assignFreePlan = async (userId) => {
  const freePlan = await Plan.findOne({ slug: 'free', isActive: true });
  const account = await getOrCreateBillingAccount(userId);
  if (freePlan) {
    account.planId = freePlan._id;
    await account.save();
  }
  return getUserPlan(userId);
};
