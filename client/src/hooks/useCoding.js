import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { codingApi } from '@/lib/api/coding';

export const CODING_KEY = ['coding'];
export const PROBLEMS_KEY = ['coding', 'problems'];
export const problemKey = (slug) => ['coding', 'problem', slug];
export const DASHBOARD_KEY = ['coding', 'dashboard'];
export const LEADERBOARD_KEY = ['coding', 'leaderboard'];
export const CONTESTS_KEY = ['coding', 'contests'];
export const DAILY_KEY = ['coding', 'daily'];

export function useCodingStatus() {
  return useQuery({ queryKey: [...CODING_KEY, 'status'], queryFn: () => codingApi.status() });
}

export function useProblems(params) {
  return useQuery({
    queryKey: [...PROBLEMS_KEY, params],
    queryFn: () => codingApi.listProblems(params),
  });
}

export function useProblem(slug) {
  return useQuery({
    queryKey: problemKey(slug),
    queryFn: () => codingApi.getProblem(slug),
    enabled: Boolean(slug),
  });
}

export function useCodingDashboard() {
  return useQuery({ queryKey: DASHBOARD_KEY, queryFn: () => codingApi.dashboard() });
}

export function useLeaderboard(period = 'global') {
  return useQuery({
    queryKey: [...LEADERBOARD_KEY, period],
    queryFn: () => codingApi.leaderboard({ period }),
  });
}

export function useDailyChallenge() {
  return useQuery({ queryKey: DAILY_KEY, queryFn: () => codingApi.dailyChallenge() });
}

export function useDailyCalendar() {
  return useQuery({ queryKey: [...DAILY_KEY, 'calendar'], queryFn: () => codingApi.dailyCalendar() });
}

export function useContests(params) {
  return useQuery({
    queryKey: [...CONTESTS_KEY, params],
    queryFn: () => codingApi.listContests(params),
  });
}

export function useContest(id) {
  return useQuery({
    queryKey: [...CONTESTS_KEY, id],
    queryFn: () => codingApi.getContest(id),
    enabled: Boolean(id),
  });
}

export function useSubmissions(params) {
  return useQuery({
    queryKey: ['coding', 'submissions', params],
    queryFn: () => codingApi.listSubmissions(params),
  });
}

export function useCodingProgress() {
  return useQuery({ queryKey: ['coding', 'progress'], queryFn: () => codingApi.progress() });
}

export function useAchievements() {
  return useQuery({ queryKey: ['coding', 'achievements'], queryFn: () => codingApi.achievements() });
}

export function useHeatmap() {
  return useQuery({ queryKey: ['coding', 'heatmap'], queryFn: () => codingApi.heatmap() });
}

export function useHintSession(problemId) {
  return useQuery({
    queryKey: ['coding', 'hints', problemId],
    queryFn: () => codingApi.getHintSession(problemId),
    enabled: Boolean(problemId),
  });
}

export function useCodingMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: CODING_KEY });
    qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    qc.invalidateQueries({ queryKey: PROBLEMS_KEY });
  };

  return {
    runCode: useMutation({ mutationFn: codingApi.runCode }),
    submitCode: useMutation({
      mutationFn: codingApi.submitCode,
      onSuccess: invalidate,
    }),
    saveDraft: useMutation({ mutationFn: codingApi.saveDraft }),
    toggleBookmark: useMutation({
      mutationFn: codingApi.toggleBookmark,
      onSuccess: () => qc.invalidateQueries({ queryKey: CODING_KEY }),
    }),
    toggleFavorite: useMutation({
      mutationFn: codingApi.toggleFavorite,
      onSuccess: () => qc.invalidateQueries({ queryKey: CODING_KEY }),
    }),
    codeReview: useMutation({ mutationFn: codingApi.codeReview }),
    requestHint: useMutation({
      mutationFn: codingApi.requestHint,
      onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['coding', 'hints', vars.problemId] }),
    }),
    requestDryRun: useMutation({ mutationFn: codingApi.requestDryRun }),
    requestVisual: useMutation({ mutationFn: codingApi.requestVisual }),
    joinContest: useMutation({
      mutationFn: codingApi.joinContest,
      onSuccess: () => qc.invalidateQueries({ queryKey: CONTESTS_KEY }),
    }),
    startVirtual: useMutation({
      mutationFn: codingApi.startVirtualContest,
      onSuccess: () => qc.invalidateQueries({ queryKey: CONTESTS_KEY }),
    }),
    adminCreateProblem: useMutation({
      mutationFn: codingApi.adminCreateProblem,
      onSuccess: invalidate,
    }),
    adminUpdateProblem: useMutation({
      mutationFn: ({ id, body }) => codingApi.adminUpdateProblem(id, body),
      onSuccess: invalidate,
    }),
    adminDeleteProblem: useMutation({
      mutationFn: codingApi.adminDeleteProblem,
      onSuccess: invalidate,
    }),
  };
}
