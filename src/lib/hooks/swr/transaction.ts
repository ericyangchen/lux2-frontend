import {
  ApiGetSystemTransactionCount,
  ApiGetTransactionById,
  ApiGetTransactionCountByOrganizationId,
  ApiGetTransactions,
  ApiGetTransactionsByMerchantId,
} from "@/lib/apis/transactions/get";
import {
  DailyTransactionCountByOrganizationId,
  SystemDailyTransactionCount,
  Transaction,
} from "@/lib/types/transaction";
import {
  USE_DAILY_TRANSACTION_COUNT_BY_ORGANIZATION_ID_REFRESH_INTERVAL,
  USE_SYSTEM_DAILY_TRANSACTION_COUNT_REFRESH_INTERVAL,
  USE_TRANSACTION_REFRESH_INTERVAL,
} from "../../constants/swr-refresh-interval";

import { ApplicationError } from "@/lib/error/applicationError";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchTransactionById = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const response = await ApiGetTransactionById({
    id: transactionId,
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

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "transaction", transactionId, accessToken } : null,
    fetchTransactionById,
    { refreshInterval: USE_TRANSACTION_REFRESH_INTERVAL }
  );

  return {
    transaction: data as Transaction,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchOrganizationTransactions = async ({
  merchantId,
  type,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  createdAtStart,
  createdAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  merchantId: string;
  type?: TransactionType;
  merchantOrderId?: string;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  internalStatus?: TransactionInternalStatus;
  revenueDistributed?: boolean;
  status?: TransactionStatus;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const response = await ApiGetTransactionsByMerchantId({
    merchantId,
    type,
    merchantOrderId,
    paymentMethod,
    paymentChannel,
    internalStatus,
    revenueDistributed,
    status,
    createdAtStart,
    createdAtEnd,
    limit,
    cursorCreatedAt,
    cursorId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useOrganizationTransactions = ({
  merchantId,
  type,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  createdAtStart,
  createdAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
}: {
  merchantId: string;
  type?: TransactionType;
  merchantOrderId?: string;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  internalStatus?: TransactionInternalStatus;
  revenueDistributed?: boolean;
  status?: TransactionStatus;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && merchantId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? {
          key: "transactions-by-merchant-id",
          merchantId,
          type,
          merchantOrderId,
          paymentMethod,
          paymentChannel,
          internalStatus,
          revenueDistributed,
          status,
          createdAtStart,
          createdAtEnd,
          limit,
          cursorCreatedAt,
          cursorId,
          accessToken,
        }
      : null,
    fetchOrganizationTransactions,
    { refreshInterval: 0 }
  );

  return {
    transactions: (data?.data as Transaction[]) || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
};

const fetchTransactions = async ({
  type,
  merchantId,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  createdAtStart,
  createdAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  type?: TransactionType;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  internalStatus?: TransactionInternalStatus;
  revenueDistributed?: boolean;
  status?: TransactionStatus;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const response = await ApiGetTransactions({
    type,
    merchantId,
    merchantOrderId,
    paymentMethod,
    paymentChannel,
    internalStatus,
    revenueDistributed,
    status,
    createdAtStart,
    createdAtEnd,
    limit,
    cursorCreatedAt,
    cursorId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useTransactions = ({
  merchantId,
  type,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  createdAtStart,
  createdAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
}: {
  type?: TransactionType;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  internalStatus?: TransactionInternalStatus;
  revenueDistributed?: boolean;
  status?: TransactionStatus;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && merchantId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? {
          key: "transactions",
          type,
          merchantId,
          merchantOrderId,
          paymentMethod,
          paymentChannel,
          internalStatus,
          revenueDistributed,
          status,
          createdAtStart,
          createdAtEnd,
          limit,
          cursorCreatedAt,
          cursorId,
          accessToken,
        }
      : null,
    fetchTransactions,
    { refreshInterval: 0 }
  );

  return {
    transactions: (data?.data as Transaction[]) || [],
    pagination: data?.pagination,
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
  const response = await ApiGetSystemTransactionCount({
    period: "daily",
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

  const { data, error, isLoading, mutate } = useSwrWithAuth(
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
  const response = await ApiGetTransactionCountByOrganizationId({
    organizationId,
    period: "daily",
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

  const { data, error, isLoading, mutate } = useSwrWithAuth(
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
