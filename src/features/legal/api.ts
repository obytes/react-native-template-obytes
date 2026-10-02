import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/api/client';

export type LegalStatus = {
  currentVersion: string;
  acceptedVersion: string | null;
  ageConfirmed: boolean;
  needsAcceptance: boolean;
};

const legalStatusKey = (userId: string | undefined) => ['legal', 'status', userId];

/** GET /api/legal/status — whether the member must accept the terms / confirm 18+. */
export function useLegalStatus(userId: string | undefined) {
  return useQuery({
    queryKey: legalStatusKey(userId),
    queryFn: async () => {
      const { data } = await client.get('/api/legal/status');
      return data as LegalStatus;
    },
    enabled: !!userId,
  });
}

/**
 * POST /api/legal/accept — records the current terms and the 18+ confirmation.
 * The version comes from the status response, so a terms bump on the server
 * needs no app release.
 */
export function useAcceptTerms(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (version: string) => {
      await client.post('/api/legal/accept', {
        version,
        over18: true,
        source: 'mobile_prompt',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: legalStatusKey(userId) }),
  });
}
