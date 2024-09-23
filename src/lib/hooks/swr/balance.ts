import { ApplicationError } from "@/lib/types/applicationError";
import { Balance } from "@/lib/types/balance";
import { USE_BALANCES_REFRESH_INTERVAL } from "./constants";
import { getApplicationCookies } from "@/lib/cookie";
import { getOrganizationBalancesApi } from "@/lib/apis/organizations/balance";
import useSWR from "swr";

const fetchBalancesByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getOrganizationBalancesApi({
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

export const useBalances = ({ organizationId }: { organizationId: string }) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "balances", organizationId, accessToken } : null,
    fetchBalancesByOrganizationId,
    { refreshInterval: USE_BALANCES_REFRESH_INTERVAL }
  );

  return {
    balances: (data?.balances as Balance[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
