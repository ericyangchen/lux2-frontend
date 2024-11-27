import {
  PaymentChannel,
  PaymentMethod,
  TransactionDetailedStatus,
  TransactionStatus,
  TransactionType,
} from "@/lib/types/transaction";

export const getOrganizationTransactionByIdApi = async ({
  transactionId,
  organizationId,
  accessToken,
}: {
  transactionId: string;
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/organizations/${encodeURIComponent(
    organizationId
  )}/transactions/${encodeURIComponent(transactionId)}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getOrganizationTransactionByMerchantOrderIdApi = async ({
  organizationId,
  merchantOrderId,
  accessToken,
}: {
  organizationId: string;
  merchantOrderId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/organizations/${encodeURIComponent(
    organizationId
  )}/transactions/merchantOrderId/${encodeURIComponent(merchantOrderId)}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface GetOrganizationTransactionsApiQuery {
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  paymentChannel?: PaymentChannel;
  status?: TransactionStatus;
  detailedStatus?: TransactionDetailedStatus;
  revenueDistributed?: boolean;
}

export const getOrganizationTransactionsApi = async ({
  query,
  organizationId,
  cursor,
  limit = 30,
  accessToken,
}: {
  query: GetOrganizationTransactionsApiQuery;
  organizationId: string;
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
  if (query.status) urlSearchParams.append("status", query.status);
  if (query.detailedStatus)
    urlSearchParams.append("detailedStatus", query.detailedStatus);
  if (query.revenueDistributed)
    urlSearchParams.append(
      "revenueDistributed",
      query.revenueDistributed.toString()
    );
  if (cursor) urlSearchParams.append("cursor", cursor);
  if (limit) urlSearchParams.append("limit", limit.toString());

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/organizations/${encodeURIComponent(
    organizationId
  )}/transactions?${urlSearchParams.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
