import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { store } from '@/app/store';
import { AuthInitializer } from '@/components/auth';
import { ErrorBoundary } from '@/components/common';
import { clearAuth, setCredentials } from '@/features/auth/authSlice';
import { setupAxiosAuth } from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';

setupAxiosAuth({
  onRefreshSuccess: (data) => store.dispatch(setCredentials(data)),
  onRefreshFail: () => store.dispatch(clearAuth()),
});

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthInitializer>{children}</AuthInitializer>
        </ErrorBoundary>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  );
}
