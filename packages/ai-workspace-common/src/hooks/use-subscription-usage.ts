import { useGetSubscriptionUsage } from '@refly-packages/ai-workspace-common/queries/queries';

export const useSubscriptionUsage = () => {
  const {
    data,
    isLoading: isUsageLoading,
    refetch,
  } = useGetSubscriptionUsage({}, [], {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 60 * 1000, // Cache for 1 minute
  });
  const { token, storage, fileParsing } = data?.data ?? {};

  const refetchUsage = () =>
    setTimeout(async () => {
      try {
        await refetch();
      } catch (error) {
        console.error('Failed to refetch usage:', error);
      }
    }, 2000);

  return {
    tokenUsage: token,
    storageUsage: storage,
    fileParsingUsage: fileParsing,
    isUsageLoading,
    refetchUsage,
  };
};
