import { useQuery } from '@tanstack/react-query';

import { healthApi } from '@/lib/api/health';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthApi.getHealth,
  });
}
