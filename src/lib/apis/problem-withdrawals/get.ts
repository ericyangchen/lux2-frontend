import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetProblemWithdrawals = async ({
  limit,
  cursorCreatedAt,
  cursorId,
  organizationId,
  paymentMethod,
  internalStatus,
  amount,
  amountMin,
  amountMax,
  createdAtStart,
  createdAtEnd,
  accessToken,
}: {
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  organizationId?: string;
  paymentMethod?: string;
  internalStatus?: string;
  amount?: string;
  amountMin?: string;
  amountMax?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    limit,
    cursorCreatedAt,
    cursorId,
    organizationId,
    paymentMethod,
    internalStatus,
    amount,
    amountMin,
    amountMax,
    createdAtStart,
    createdAtEnd,
  });

  return fetch(`${getBackendUrl()}/problem-withdrawals?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
