import { ApiGetAvailableChannelsVisualization } from "@/lib/apis/organization-available-channels/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchAvailableChannelsVisualization = async ({
  organizationId,
  accessToken,
}: {
  organizationId?: string;
  accessToken: string;
}) => {
  const response = await ApiGetAvailableChannelsVisualization({
    organizationId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error = new ApplicationError(errorData);
    throw error;
  }

  return response.json();
};

export const useAvailableChannelsVisualization = (organizationId?: string) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? {
          key: `available-channels-visualization-${organizationId}`,
          accessToken,
        }
      : null,
    () =>
      fetchAvailableChannelsVisualization({
        accessToken: accessToken!,
        organizationId,
      }),
    { refreshInterval: 0 }
  );

  return {
    data: data as
      | Array<{
          organizationId: string;
          organizationName: string;
          organizationType: string;
          level: number;
          availableChannels: Array<{
            transactionType: string;
            paymentMethod: string;
            paymentChannel: string;
            isAvailable: boolean;
          }>;
        }>
      | undefined,
    isLoading,
    isError: error,
    mutate,
  };
};
