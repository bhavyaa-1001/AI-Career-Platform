import dns from 'node:dns';

import mongoose from 'mongoose';

export const configureDnsForAtlas = (uri) => {
  if (!uri?.startsWith('mongodb+srv://')) return;

  const customServers = process.env.MONGODB_DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean);
  const servers = customServers?.length ? customServers : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

  dns.setServers(servers);
};

export const connectMongoose = async (uri, options = {}) => {
  configureDnsForAtlas(uri);
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    ...options,
  });
};

export const srvDnsHelpMessage =
  'Atlas SRV DNS lookup failed. Set MONGODB_DNS_SERVERS=8.8.8.8,8.8.4.4 in .env '
  + 'or use a standard mongodb:// URI from Atlas.';
