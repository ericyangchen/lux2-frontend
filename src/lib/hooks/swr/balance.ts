import {
  ApiGetOrganizationBalance,
  ApiGetSystemBalances,
} from "@/lib/apis/balances/get";
import { Balance, SystemBalancesByPaymentMethod } from "@/lib/types/balance";
import {
  USD_SYSTEM_BALANCE_REFRESH_INTERVAL,
  USE_BALANCES_REFRESH_INTERVAL,
} from "../../constants/swr-refresh-interval";

import { ApplicationError } from "@/lib/error/applicationError";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchBalancesByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationBalance({
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

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "balances", organizationId, accessToken } : null,
    fetchBalancesByOrganizationId,
    { refreshInterval: USE_BALANCES_REFRESH_INTERVAL }
  );

  return {
    balances: (data as Balance[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchSystemBalance = async ({ accessToken }: { accessToken: string }) => {
  const response = await ApiGetSystemBalances({
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

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "systemBalance", accessToken } : null,
    fetchSystemBalance,
    { refreshInterval: USD_SYSTEM_BALANCE_REFRESH_INTERVAL }
  );

  return {
    systemBalances: (data as SystemBalancesByPaymentMethod) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
