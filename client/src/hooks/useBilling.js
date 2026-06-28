import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { billingApi } from '@/lib/api/billing';

export const BILLING_OVERVIEW_KEY = ['billing', 'overview'];
export const BILLING_USAGE_KEY = ['billing', 'usage'];
export const BILLING_PLANS_KEY = ['billing', 'plans'];

export const useBillingOverview = () =>
  useQuery({ queryKey: BILLING_OVERVIEW_KEY, queryFn: () => billingApi.overview() });

export const useBillingUsage = () =>
  useQuery({ queryKey: BILLING_USAGE_KEY, queryFn: () => billingApi.usage() });

export const useBillingPlans = () =>
  useQuery({ queryKey: BILLING_PLANS_KEY, queryFn: () => billingApi.plans() });

export const useStripeStatus = () =>
  useQuery({ queryKey: ['billing', 'stripe'], queryFn: () => billingApi.stripeStatus() });

export const useCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.checkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY }),
  });
};

export const useBillingPortal = () =>
  useMutation({ mutationFn: () => billingApi.portal() });

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_OVERVIEW_KEY }),
  });
};

export const usePaymentHistory = (params) =>
  useQuery({ queryKey: ['billing', 'payments', params], queryFn: () => billingApi.payments(params) });

export const useInvoices = (params) =>
  useQuery({ queryKey: ['billing', 'invoices', params], queryFn: () => billingApi.invoices(params) });

export const useReferralDashboard = () =>
  useQuery({ queryKey: ['billing', 'referrals'], queryFn: () => billingApi.referrals() });

export const usePreferences = () =>
  useQuery({ queryKey: ['settings', 'preferences'], queryFn: () => billingApi.getPreferences() });

export const useUpdatePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.updatePreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'preferences'] }),
  });
};

export const useSecurityOverview = () =>
  useQuery({ queryKey: ['settings', 'security'], queryFn: () => billingApi.security() });

export const useDeveloperDashboard = () =>
  useQuery({ queryKey: ['developer'], queryFn: () => billingApi.developerDashboard() });

export const useApiKeys = () =>
  useQuery({ queryKey: ['developer', 'keys'], queryFn: () => billingApi.listApiKeys() });

export const useWebhooks = () =>
  useQuery({ queryKey: ['developer', 'webhooks'], queryFn: () => billingApi.listWebhooks() });
