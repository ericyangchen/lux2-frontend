import {
  ApiGetOrganizationDailyBalanceSnapshots,
  ApiGetSystemDailyBalanceSnapshots,
} from "../../apis/balance-snapshots/get";
import {
  OrganizationDailyBalanceSnapshots,
  SystemDailyBalanceSnapshots,
} from "../../types/balance-snapshot";

import { ApplicationError } from "@/lib/error/applicationError";
import { USE_BALANCES_REFRESH_INTERVAL } from "../../constants/swr-refresh-interval";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchSystemDailyBalanceSnapshots = async ({
  days,
  endDate,
  startDate,
  paymentMethod,
  accessToken,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
  startDate?: string; // YYYY-MM-DD format
  paymentMethod?: string;
  accessToken: string;
}) => {
  const response = await ApiGetSystemDailyBalanceSnapshots({
    days,
    endDate,
    startDate,
    paymentMethod,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useSystemDailyBalanceSnapshots = ({
  days,
  endDate,
  startDate,
  paymentMethod,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
  startDate?: string; // YYYY-MM-DD format
  paymentMethod?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } =
    useSwrWithAuth<SystemDailyBalanceSnapshots>(
      shouldFetch
        ? {
            key: "system-daily-balance-snapshots",
            days,
            endDate,
            startDate,
            paymentMethod,
            accessToken,
          }
        : null,
      fetchSystemDailyBalanceSnapshots,
      {
        refreshInterval: USE_BALANCES_REFRESH_INTERVAL,
        revalidateOnFocus: false,
        dedupingInterval: 2 * 60 * 1000, // 2 minutes
      }
    );

  return {
    systemDailyBalanceSnapshots: data as SystemDailyBalanceSnapshots,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchOrganizationDailyBalanceSnapshots = async ({
  days,
  endDate,
  startDate,
  paymentMethod,
  organizationId,
  accessToken,
}: {
  days?: number; // Default 7 days, max 365
  endDate?: string; // YYYY-MM-DD format
  startDate?: string; // YYYY-MM-DD format
  paymentMethod?: string;
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationDailyBalanceSnapshots({
    days,
    endDate,
    startDate,
    paymentMethod,
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

export const useOrganizationDailyBalanceSnapshots = ({
  days,
  endDate,
  startDate,
  paymentMethod,
  organizationId,
}: {
  days?: number;
  endDate?: string;
  startDate?: string;
  paymentMethod?: string;
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? {
          key: "organization-daily-balance-snapshots",
          days,
          endDate,
          startDate,
          paymentMethod,
          organizationId,
          accessToken,
        }
      : null,
    fetchOrganizationDailyBalanceSnapshots,
    {
      refreshInterval: USE_BALANCES_REFRESH_INTERVAL,
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
    }
  );

  return {
    organizationDailyBalanceSnapshots:
      data as OrganizationDailyBalanceSnapshots,
    isLoading,
    isError: error,
    mutate,
  };
};
