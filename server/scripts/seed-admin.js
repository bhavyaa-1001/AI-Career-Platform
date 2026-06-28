import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { connectMongoose, srvDnsHelpMessage } from '../src/config/mongoConnect.js';
import { User } from '../src/models/User.js';

const seedAdmin = async () => {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL || 'admin@aicareerplatform.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await connectMongoose(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    firstName: 'Platform',
    lastName: 'Admin',
    email,
    password: hashed,
    role: 'admin',
    isEmailVerified: true,
  });

  console.log(`Admin created: ${email}`);
  console.log(`Password: ${password}`);
  console.log('Change the password after first login.');
  process.exit(0);
};

seedAdmin().catch((err) => {
  if (err.message?.includes('querySrv ECONNREFUSED')) {
    console.error(srvDnsHelpMessage);
  }
  console.error(err);
  process.exit(1);
});
