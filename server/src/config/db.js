import mongoose from 'mongoose';

import { logger } from './logger.js';
import { connectMongoose, srvDnsHelpMessage } from './mongoConnect.js';

export const connectDB = async (uri) => {
  try {
    const conn = await connectMongoose(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);

    if (error.message.includes('querySrv ECONNREFUSED')) {
      logger.error(srvDnsHelpMessage);
    }

    process.exit(1);
  }
};

export const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});
