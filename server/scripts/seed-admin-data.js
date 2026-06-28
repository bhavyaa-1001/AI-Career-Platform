import mongoose from 'mongoose';
import 'dotenv/config';

import { Plan } from '../src/models/admin/Plan.js';
import { PlatformSettings } from '../src/models/admin/PlatformSettings.js';

const DEFAULT_PLANS = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Basic access for students',
    price: 0,
    interval: 'monthly',
    audience: 'student',
    features: ['3 AI analyses/month', '1 resume', 'Job browsing'],
    limits: { aiAnalysis: 3, resumes: 1 },
    sortOrder: 0,
  },
  {
    name: 'Pro Student',
    slug: 'pro-student',
    description: 'Unlimited AI tools for students',
    price: 9.99,
    interval: 'monthly',
    audience: 'student',
    features: ['Unlimited AI analyses', '5 resumes', 'Coding AI hints', 'Job matching'],
    limits: { aiAnalysis: -1, resumes: 5 },
    sortOrder: 1,
  },
  {
    name: 'Recruiter Basic',
    slug: 'recruiter-basic',
    description: 'Post jobs and manage applicants',
    price: 29.99,
    interval: 'monthly',
    audience: 'recruiter',
    features: ['5 job posts', 'Applicant tracking', 'Basic analytics'],
    limits: { jobPosts: 5 },
    sortOrder: 2,
  },
  {
    name: 'Recruiter Premium',
    slug: 'recruiter-premium',
    description: 'Enterprise recruiting tools',
    price: 99.99,
    interval: 'monthly',
    audience: 'recruiter',
    features: ['Unlimited jobs', 'AI candidate ranking', 'Premium badge', 'Advanced analytics'],
    limits: { jobPosts: -1 },
    sortOrder: 3,
  },
];

const seedAdminData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);

  for (const plan of DEFAULT_PLANS) {
    const existing = await Plan.findOne({ slug: plan.slug });
    if (!existing) {
      await Plan.create(plan);
      console.log(`Created plan: ${plan.name}`);
    }
  }

  const categories = ['global', 'branding', 'maintenance', 'features'];
  for (const category of categories) {
    const existing = await PlatformSettings.findOne({ category });
    if (!existing) {
      await PlatformSettings.create({ key: category, category, value: {} });
      console.log(`Created settings: ${category}`);
    }
  }

  console.log('Admin seed data complete');
  process.exit(0);
};

seedAdminData().catch((err) => {
  console.error(err);
  process.exit(1);
});
