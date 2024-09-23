import { ManualTransactionType } from "@/lib/types/manual-transaction";
import { PaymentMethod } from "@/lib/types/transaction";

export const getManualTransactionByIdApi = async ({
  manualTransactionId,
  accessToken,
}: {
  manualTransactionId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/manual-transactions/${encodeURIComponent(manualTransactionId)}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface GetManualTransactionsApiQuery {
  type?: ManualTransactionType;
  organizationId?: string;
  paymentMethod?: PaymentMethod;
  additionalInfo?: Record<string, any>;
}

export const getManualTransactionsApi = async ({
  query,
  cursor,
  limit = 30,
  accessToken,
}: {
  query: GetManualTransactionsApiQuery;
  cursor?: string;
  limit?: number;
  accessToken: string;
}) => {
  const urlSearchParams = new URLSearchParams();
  if (query.type) urlSearchParams.append("type", query.type);
  if (query.organizationId)
    urlSearchParams.append("organizationId", query.organizationId);
  if (query.paymentMethod)
    urlSearchParams.append("paymentMethod", query.paymentMethod);
  if (query.additionalInfo)
    urlSearchParams.append(
      "additionalInfo",
      JSON.stringify(query.additionalInfo)
    );
  if (cursor) urlSearchParams.append("cursor", cursor);
  if (limit) urlSearchParams.append("limit", limit.toString());

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/manual-transactions?${urlSearchParams.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createManualTransactionApi = async ({
  type,
  organizationId,
  paymentMethod,
  amount,
  additionalInfo,
  accessToken,
}: {
  type: ManualTransactionType;
  organizationId: string;
  paymentMethod: string;
  amount: string;
  additionalInfo: Record<string, any>;
  accessToken: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/manual-transactions`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      type,
      organizationId,
      paymentMethod,
      amount,
      additionalInfo,
    }),
  });
};

export const unfreezeFrozenTransactionApi = async ({
  manualTransactionId,
  accessToken,
}: {
  manualTransactionId: string;
  accessToken: string;
}) => {
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/manual-transactions/${encodeURIComponent(manualTransactionId)}/unfrozen`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
