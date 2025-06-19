import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";
import { buildQueryString } from "@/lib/utils/build-query-string";

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

  return fetch(`${backendUrl}/merchant-requested-withdrawal?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
