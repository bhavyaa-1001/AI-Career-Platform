import 'dotenv/config';

import mongoose from 'mongoose';

import { SAAS_PLANS } from '../src/config/saasConstants.js';
import { Plan } from '../src/models/admin/Plan.js';

const seedPlans = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const planData of SAAS_PLANS) {
    const { limits, ...rest } = planData;
    await Plan.findOneAndUpdate(
      { slug: planData.slug },
      {
        ...rest,
        limits,
        prioritySupport: limits.prioritySupport || false,
        isActive: true,
        currency: 'USD',
      },
      { upsert: true, new: true },
    );
    console.log(`Seeded plan: ${planData.name}`);
  }

  const count = await Plan.countDocuments({ slug: { $in: SAAS_PLANS.map((p) => p.slug) } });
  console.log(`Total SaaS plans in DB: ${count}`);
  await mongoose.disconnect();
};

seedPlans().catch((err) => {
  console.error(err);
  process.exit(1);
});
