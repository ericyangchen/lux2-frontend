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
  type?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  internalStatus?: string;
  revenueDistributed?: boolean;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
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
  createdAtStart,
  createdAtEnd,
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
    limit,
    cursorCreatedAt,
    cursorId,
  });

  return fetch(`${getBackendUrl()}/transactions?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
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
