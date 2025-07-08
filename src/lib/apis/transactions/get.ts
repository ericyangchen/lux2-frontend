import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetTransactionById = async ({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/transactions/${id}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetTransactionByMerchantIdAndMerchantOrderId = async ({
  merchantId,
  merchantOrderId,
  accessToken,
}: {
  merchantId: string;
  merchantOrderId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transactions/merchants/${merchantId}/orders/${merchantOrderId}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetTransactionsByMerchantId = async ({
  type,
  merchantId,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  amount,
  amountMin,
  amountMax,
  createdAtStart,
  createdAtEnd,
  successAtStart,
  successAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  type?: string;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  internalStatus?: string;
  revenueDistributed?: boolean;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  successAtStart?: string;
  successAtEnd?: string;
  amount?: string;
  amountMin?: string;
  amountMax?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
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
    successAtStart,
    successAtEnd,
    limit,
    cursorCreatedAt,
    cursorId,
    amount,
    amountMin,
    amountMax,
  });

  return fetch(
    `${getBackendUrl()}/transactions/merchants/${merchantId}?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetTransactions = async ({
  type,
  merchantId,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  amount,
  amountMin,
  amountMax,
  createdAtStart,
  createdAtEnd,
  successAtStart,
  successAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  type?: string;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  internalStatus?: string;
  revenueDistributed?: boolean;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  successAtStart?: string;
  successAtEnd?: string;
  amount?: string;
  amountMin?: string;
  amountMax?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
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
    successAtStart,
    successAtEnd,
    limit,
    cursorCreatedAt,
    cursorId,
    amount,
    amountMin,
    amountMax,
  });

  return fetch(`${getBackendUrl()}/transactions?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetTransactionCountAndSumOfAmountAndFee = async ({
  type,
  merchantId,
  merchantOrderId,
  paymentMethod,
  paymentChannel,
  internalStatus,
  revenueDistributed,
  status,
  amount,
  amountMin,
  amountMax,
  createdAtStart,
  createdAtEnd,
  successAtStart,
  successAtEnd,
  accessToken,
}: {
  type?: string;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  internalStatus?: string;
  revenueDistributed?: boolean;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  successAtStart?: string;
  successAtEnd?: string;
  amount?: string;
  amountMin?: string;
  amountMax?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    type,
    merchantId,
    merchantOrderId,
    paymentMethod,
    paymentChannel,
    internalStatus,
    revenueDistributed,
    status,
    amount,
    amountMin,
    amountMax,
    createdAtStart,
    createdAtEnd,
    successAtStart,
    successAtEnd,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/count-and-sum-of-amount-and-fee?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetSystemTransactionCount = async ({
  period,
  date,
  accessToken,
}: {
  period?: string;
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    period,
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/system?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetTransactionCountByOrganizationId = async ({
  organizationId,
  period,
  date,
  accessToken,
}: {
  organizationId: string;
  period?: string;
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    period,
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/organizations/${organizationId}?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetSystemWeeklyTransactionTrends = async ({
  date,
  accessToken,
}: {
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/system/weekly-trends?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetWeeklyTransactionTrendsByOrganizationId = async ({
  organizationId,
  date,
  accessToken,
}: {
  organizationId: string;
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/organizations/${organizationId}/weekly-trends?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetSystemPaymentMethodDistribution = async ({
  date,
  accessToken,
}: {
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/system/payment-method-distribution?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetSystemChannelPerformance = async ({
  date,
  accessToken,
}: {
  date?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    date,
  });

  return fetch(
    `${getBackendUrl()}/transactions/statistics/system/channel-performance?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
