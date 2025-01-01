import {
  DailyTransactionCountByOrganizationId,
  SystemDailyTransactionCount,
  Transaction,
} from "@/lib/types/transaction";
import {
  USE_DAILY_TRANSACTION_COUNT_BY_ORGANIZATION_ID_REFRESH_INTERVAL,
  USE_SYSTEM_DAILY_TRANSACTION_COUNT_REFRESH_INTERVAL,
  USE_TRANSACTION_REFRESH_INTERVAL,
} from "./constants";
import {
  getSystemDailyTransactionCountApi,
  getTransactionByIdApi,
} from "@/lib/apis/transactions";

import { ApplicationError } from "@/lib/types/applicationError";
import { getApplicationCookies } from "@/lib/cookie";
import { getDailyTransactionCountByOrganizationIdApi } from "@/lib/apis/organizations/transaction";
import useSWR from "swr";

const fetchTransactionById = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const response = await getTransactionByIdApi({
    transactionId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useTransaction = ({
  transactionId,
}: {
  transactionId: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && transactionId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "transaction", transactionId, accessToken } : null,
    fetchTransactionById,
    { refreshInterval: USE_TRANSACTION_REFRESH_INTERVAL }
  );

  return {
    transaction: data?.transaction as Transaction,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchSystemDailyTransactionCount = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const response = await getSystemDailyTransactionCountApi({
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useSystemDailyTransactionCount = () => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "systemDailyTransactionCount", accessToken } : null,
    fetchSystemDailyTransactionCount,
    { refreshInterval: USE_SYSTEM_DAILY_TRANSACTION_COUNT_REFRESH_INTERVAL }
  );

  return {
    systemDailyTransactionCount: data as SystemDailyTransactionCount,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchDailyTransactionCountByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getDailyTransactionCountByOrganizationIdApi({
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

export const useDailyTransactionCountByOrganizationId = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? {
          key: "dailyTransactionCountByOrganizationId",
          organizationId,
          accessToken,
        }
      : null,
    fetchDailyTransactionCountByOrganizationId,
    {
      refreshInterval:
        USE_DAILY_TRANSACTION_COUNT_BY_ORGANIZATION_ID_REFRESH_INTERVAL,
    }
  );

  return {
    dailyTransactionCountByOrganizationId:
      data as DailyTransactionCountByOrganizationId,
    isLoading,
    isError: error,
    mutate,
  };
};
