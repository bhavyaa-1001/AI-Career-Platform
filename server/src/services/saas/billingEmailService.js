import nodemailer from 'nodemailer';

import { env, isEmailConfigured } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { User } from '../../models/User.js';

const TEMPLATES = {
  subscription_activated: (user) => ({
    subject: 'Subscription Activated — AI Career Platform',
    html: `<p>Hi ${user.firstName},</p><p>Your subscription is now active. Visit your billing dashboard to manage your plan.</p>`,
  }),
  payment_failed: (user) => ({
    subject: 'Payment Failed — Action Required',
    html: `<p>Hi ${user.firstName},</p><p>We could not process your subscription payment. Please update your billing details.</p>`,
  }),
  trial_ending: (user, days) => ({
    subject: 'Your Trial Is Ending Soon',
    html: `<p>Hi ${user.firstName},</p><p>Your trial ends in ${days} days. Upgrade to keep premium features.</p>`,
  }),
  referral_reward: (user, credits) => ({
    subject: 'Referral Reward Earned!',
    html: `<p>Hi ${user.firstName},</p><p>You earned ${credits} bonus AI credits from a successful referral.</p>`,
  }),
  welcome: (user) => ({
    subject: 'Welcome to AI Career Platform',
    html: `<p>Hi ${user.firstName},</p><p>Welcome aboard! Start building your career with our AI-powered tools.</p>`,
  }),
};

export const sendBillingEmail = async (userId, template, data = {}) => {
  if (!isEmailConfigured) {
    logger.info(`Billing email skipped (${template}) — SMTP not configured`);
    return null;
  }

  const user = await User.findById(userId);
  if (!user) return null;

  const builder = TEMPLATES[template];
  if (!builder) return null;

  const { subject, html } = typeof builder === 'function'
    ? builder(user, data.days, data.credits)
    : builder;

  try {
    if (!isEmailConfigured) {
      logger.info(`[Email Dev Mode] To: ${user.email} | Subject: ${subject}`);
      return true;
    }
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transporter.sendMail({ from: env.EMAIL_FROM, to: user.email, subject, html });
    return true;
  } catch (err) {
    logger.error('Billing email failed:', err.message);
    return null;
  }
};
