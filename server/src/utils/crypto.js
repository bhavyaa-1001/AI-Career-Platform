import crypto from 'crypto';

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
