import {
  ApiGetOrganizationBalanceHistory,
  ApiGetSystemBalanceHistory,
} from "../../apis/balance-snapshots/get";
import {
  OrganizationBalanceHistory,
  SystemBalanceHistory,
} from "../../types/balance-snapshot";

import { ApplicationError } from "@/lib/error/applicationError";
import { USE_BALANCES_REFRESH_INTERVAL } from "../../constants/swr-refresh-interval";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchSystemBalanceHistory = async ({
  days,
  endDate,
  accessToken,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
  accessToken: string;
}) => {
  const response = await ApiGetSystemBalanceHistory({
    days,
    endDate,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useSystemBalanceHistory = ({
  days,
  endDate,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } =
    useSwrWithAuth<SystemBalanceHistory>(
      shouldFetch
        ? {
            key: "system-balance-history",
            days,
            endDate,
            accessToken,
          }
        : null,
      fetchSystemBalanceHistory,
      {
        refreshInterval: USE_BALANCES_REFRESH_INTERVAL,
        revalidateOnFocus: false,
        dedupingInterval: 2 * 60 * 1000, // 2 minutes
      }
    );

  return {
    systemBalanceHistory: data as SystemBalanceHistory,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchOrganizationBalanceHistory = async ({
  days,
  endDate,
  organizationId,
  accessToken,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationBalanceHistory({
    days,
    endDate,
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

export const useOrganizationBalanceHistory = ({
  days,
  endDate,
  organizationId,
}: {
  days?: number;
  endDate?: string;
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? {
          key: "organization-balance-history",
          days,
          endDate,
          organizationId,
          accessToken,
        }
      : null,
    fetchOrganizationBalanceHistory,
    {
      refreshInterval: USE_BALANCES_REFRESH_INTERVAL,
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
    }
  );

  return {
    organizationBalanceHistory: data as OrganizationBalanceHistory,
    isLoading,
    isError: error,
    mutate,
  };
};
