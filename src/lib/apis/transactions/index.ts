import {
  CreateDepositTransactionRequestBody,
  PaymentChannel,
  PaymentMethod,
  TransactionDetailedStatus,
  TransactionStatus,
  TransactionType,
} from "@/lib/types/transaction";

export const getTransactionByIdApi = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/transactions/${encodeURIComponent(transactionId)}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getTransactionByMerchantOrderIdApi = async ({
  merchantId,
  merchantOrderId,
  accessToken,
}: {
  merchantId: string;
  merchantOrderId: string;
  accessToken: string;
}) => {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("merchantId", merchantId);
  urlSearchParams.append("merchantOrderId", merchantOrderId);

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/transactions/merchantOrderId?${urlSearchParams.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface GetTransactionsApiQuery {
  type?: TransactionType;
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  status?: TransactionStatus;
  detailedStatus?: TransactionDetailedStatus;
  revenueDistributed?: boolean;
  createdAtStart?: string;
  createdAtEnd?: string;
}

export const getTransactionsApi = async ({
  query,
  cursor,
  limit = 30,
  accessToken,
}: {
  query: GetTransactionsApiQuery;
  cursor?: string;
  limit?: number;
  accessToken: string;
}) => {
  const urlSearchParams = new URLSearchParams();
  if (query.type) urlSearchParams.append("type", query.type);
  if (query.paymentMethod)
    urlSearchParams.append("paymentMethod", query.paymentMethod);
  if (query.paymentChannel)
    urlSearchParams.append("paymentChannel", query.paymentChannel);
  if (query.merchantId) urlSearchParams.append("merchantId", query.merchantId);
  if (query.merchantOrderId)
    urlSearchParams.append("merchantOrderId", query.merchantOrderId);
  if (query.status) urlSearchParams.append("status", query.status);
  if (query.detailedStatus)
    urlSearchParams.append("detailedStatus", query.detailedStatus);
  if (query.revenueDistributed)
    urlSearchParams.append(
      "revenueDistributed",
      query.revenueDistributed.toString()
    );
  if (query.createdAtStart)
    urlSearchParams.append("createdAtStart", query.createdAtStart);
  if (query.createdAtEnd)
    urlSearchParams.append("createdAtEnd", query.createdAtEnd);
  if (cursor) urlSearchParams.append("cursor", cursor);
  if (limit) urlSearchParams.append("limit", limit.toString());

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/transactions?${urlSearchParams.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const generalAgentCreateApiDepositTransactionApi = async ({
  body,
  accessToken,
}: {
  body: CreateDepositTransactionRequestBody;
  accessToken: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/deposit`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
};

export interface ResendWithdrawalTransactionsRequestBody {
  transactionIds: string[];
}

export const resendWithdrawalTransactionsApi = async ({
  body,
  accessToken,
}: {
  body: ResendWithdrawalTransactionsRequestBody;
  accessToken: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/withdrawal-resend`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
};

// GENERAL_AGENT
export const getSystemDailyTransactionCountApi = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/system/daily-count`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
