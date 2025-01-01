import { Balance, SystemBalance } from "@/lib/types/balance";
import {
  USD_SYSTEM_BALANCE_REFRESH_INTERVAL,
  USE_BALANCES_REFRESH_INTERVAL,
} from "./constants";

import { ApplicationError } from "@/lib/types/applicationError";
import { getApplicationCookies } from "@/lib/cookie";
import { getOrganizationBalancesApi } from "@/lib/apis/organizations/balance";
import { getSystemBalanceApi } from "@/lib/apis/balances/getSystemBalance";
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

export const useBalances = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
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

const fetchSystemBalance = async ({ accessToken }: { accessToken: string }) => {
  const response = await getSystemBalanceApi({
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

// GENERAL_AGENT
export const useSystemBalance = () => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "systemBalance", accessToken } : null,
    fetchSystemBalance,
    { refreshInterval: USD_SYSTEM_BALANCE_REFRESH_INTERVAL }
  );

  return {
    systemBalance: data as SystemBalance,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
