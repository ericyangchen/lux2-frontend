import { PaymentMethod } from "@/lib/types/transaction";

export interface GetRevenuesApiQuery {
  transactionId?: string;
  organizationId?: string;
  paymentMethod?: PaymentMethod;
}

export const getRevenuesApi = async ({
  query,
  cursor,
  limit = 30,
  accessToken,
}: {
  query: GetRevenuesApiQuery;
  cursor?: string;
  limit?: number;
  accessToken: string;
}) => {
  const urlSearchParams = new URLSearchParams();
  if (query.transactionId)
    urlSearchParams.append("transactionId", query.transactionId);
  if (query.organizationId)
    urlSearchParams.append("organizationId", query.organizationId);
  if (query.paymentMethod)
    urlSearchParams.append("paymentMethod", query.paymentMethod);
  if (cursor) urlSearchParams.append("cursor", cursor);
  if (limit) urlSearchParams.append("limit", limit.toString());

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/revenues?${urlSearchParams.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
