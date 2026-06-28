import { useState } from 'react';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { useApiKeys, useDeveloperDashboard, useWebhooks } from '@/hooks/useBilling';
import { billingApi } from '@/lib/api/billing';

export function DeveloperPage() {
  const { data: dashData, isLoading } = useDeveloperDashboard();
  const { data: keysData, refetch: refetchKeys } = useApiKeys();
  const { data: hooksData, refetch: refetchHooks } = useWebhooks();
  const [newKeyName, setNewKeyName] = useState('');
  const [newSecret, setNewSecret] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState(null);

  if (isLoading) return <Loader className="py-20" />;

  const dash = dashData?.data || {};
  const keys = keysData?.data?.keys || [];
  const webhooks = hooksData?.data?.webhooks || [];

  const createKey = async () => {
    const res = await billingApi.createApiKey({ name: newKeyName || 'Default Key' });
    setNewSecret(res.data?.secret);
    setNewKeyName('');
    refetchKeys();
  };

  const createHook = async () => {
    const res = await billingApi.createWebhook({ url: webhookUrl });
    setWebhookSecret(res.data?.secret);
    setWebhookUrl('');
    refetchHooks();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Developer Portal</h1>
        <p className="text-muted-foreground">API keys, webhooks, and usage monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">API Keys</p><p className="text-2xl font-bold">{dash.apiKeys || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Webhooks</p><p className="text-2xl font-bold">{dash.webhooks || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">API Usage</p><p className="text-2xl font-bold">{dash.totalApiUsage || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Key name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
            <Button onClick={createKey}>Create Key</Button>
          </div>
          {newSecret && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <p className="font-medium">Save this key — it won&apos;t be shown again:</p>
              <code className="block break-all mt-1">{newSecret}</code>
            </div>
          )}
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between rounded border p-2 text-sm">
                <span>{k.name} <Badge variant="outline">{k.keyPrefix}…</Badge></span>
                <Button size="sm" variant="ghost" onClick={() => billingApi.revokeApiKey(k.id).then(() => refetchKeys())}>Revoke</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Webhooks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="https://your-app.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
            <Button onClick={createHook}>Add Webhook</Button>
          </div>
          {webhookSecret && (
            <div className="rounded-lg border p-3 text-sm">
              <p>Webhook signing secret:</p>
              <code className="block break-all">{webhookSecret}</code>
            </div>
          )}
          <ul className="space-y-2">
            {webhooks.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded border p-2 text-sm">
                <span className="truncate">{h.url}</span>
                <Button size="sm" variant="ghost" onClick={() => billingApi.deleteWebhook(h.id).then(() => refetchHooks())}>Delete</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
