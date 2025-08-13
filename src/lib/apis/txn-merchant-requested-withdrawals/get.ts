import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetMerchantRequestedWithdrawals = async ({
  merchantId,
  merchantOrderId,
  paymentMethod,
  status,
  internalStatus,
  createdAtStart,
  createdAtEnd,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  internalStatus?: string;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    merchantId,
    merchantOrderId,
    paymentMethod,
    internalStatus,
    status,
    createdAtStart,
    createdAtEnd,
    limit,
    cursorCreatedAt,
    cursorId,
  });

  return fetch(
    `${getBackendUrl()}/merchant-requested-withdrawal?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetMerchantRequestedWithdrawalsSummary = async ({
  merchantId,
  merchantOrderId,
  paymentMethod,
  status,
  internalStatus,
  createdAtStart,
  createdAtEnd,
  amount,
  accessToken,
}: {
  merchantId?: string;
  merchantOrderId?: string;
  paymentMethod?: string;
  internalStatus?: string;
  status?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  amount?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    merchantId,
    merchantOrderId,
    paymentMethod,
    internalStatus,
    status,
    createdAtStart,
    createdAtEnd,
    amount,
  });

  return fetch(
    `${getBackendUrl()}/merchant-requested-withdrawal/summary?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
