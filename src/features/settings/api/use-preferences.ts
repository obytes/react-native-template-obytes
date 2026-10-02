import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/api/client';

export type PushPreferences = {
  horseDeclared?: boolean;
  raceResult?: boolean;
  horseUpdates?: boolean;
  trainerPost?: boolean;
  newsPost?: boolean;
  circleMention?: boolean;
  circleReply?: boolean;
  circleReaction?: boolean;
  circleDm?: boolean;
  circleHorseDiscussion?: boolean;
  insideTrack?: boolean;
  events?: boolean;
  polls?: boolean;
  postComments?: boolean;
};

export type EmailPreferences = {
  newsPost?: boolean;
};

export type UserPreferences = {
  pushEnabled: boolean;
  pushPreferences: PushPreferences;
  emailPreferences: EmailPreferences;
};

const QUERY_KEY = ['user', 'preferences'];

export function mergePreferences(current: UserPreferences, patch: Partial<UserPreferences>): UserPreferences {
  return {
    ...current,
    ...patch,
    pushPreferences: { ...current.pushPreferences, ...patch.pushPreferences },
    emailPreferences: { ...current.emailPreferences, ...patch.emailPreferences },
  };
}

export function usePreferences() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await client.get('/api/users/preferences');
      return data as UserPreferences;
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<UserPreferences>) => {
      const { data } = await client.put('/api/users/preferences', input);
      return data as UserPreferences;
    },
    // Optimistic: merge the patch into the cached prefs, roll back on error.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<UserPreferences>(QUERY_KEY);
      if (previous)
        queryClient.setQueryData(QUERY_KEY, mergePreferences(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous)
        queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
