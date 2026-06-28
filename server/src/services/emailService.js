import nodemailer from 'nodemailer';

import { env, isEmailConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

let transporter = null;

const getTransporter = () => {
  if (!isEmailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured) {
    logger.info(`[Email Dev Mode] To: ${to} | Subject: ${subject}`);
    logger.info(`[Email Dev Mode] Body: ${html}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      throw new ApiError(500, 'Failed to send email. Please try again later.');
    }
  }
};

export const sendVerificationEmail = async (email, firstName, token) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email — AI Career Platform',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${firstName}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p style="margin-top: 24px; color: #71717a; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });

  if (env.NODE_ENV === 'development') {
    logger.info(`[Dev] Verification URL: ${verifyUrl}`);
  }

  return verifyUrl;
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password — AI Career Platform',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hi ${firstName}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p style="margin-top: 24px; color: #71717a; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });

  if (env.NODE_ENV === 'development') {
    logger.info(`[Dev] Password reset URL: ${resetUrl}`);
  }

  return resetUrl;
};
