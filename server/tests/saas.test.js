import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isUnlimited, SAAS_PLANS, USAGE_TO_LIMIT_MAP } from '../src/config/saasConstants.js';

describe('SaaS Constants', () => {
  it('defines four subscription tiers', () => {
    assert.equal(SAAS_PLANS.length, 4);
    assert.deepEqual(SAAS_PLANS.map((p) => p.slug), ['free', 'starter', 'pro', 'enterprise']);
  });

  it('maps usage metrics to plan limits', () => {
    assert.equal(USAGE_TO_LIMIT_MAP.aiCredits, 'aiCredits');
    assert.equal(USAGE_TO_LIMIT_MAP.resumeCount, 'resumeLimit');
    assert.equal(USAGE_TO_LIMIT_MAP.jobApplications, 'jobApplications');
  });

  it('treats -1 as unlimited', () => {
    assert.equal(isUnlimited(-1), true);
    assert.equal(isUnlimited(100), false);
  });

  it('enterprise plan has unlimited AI credits', () => {
    const enterprise = SAAS_PLANS.find((p) => p.slug === 'enterprise');
    assert.ok(isUnlimited(enterprise.limits.aiCredits));
    assert.equal(enterprise.limits.prioritySupport, true);
  });

  it('free plan has conservative limits', () => {
    const free = SAAS_PLANS.find((p) => p.slug === 'free');
    assert.equal(free.price, 0);
    assert.ok(free.limits.aiCredits > 0);
    assert.equal(free.limits.interviewSessions, 0);
  });
});
