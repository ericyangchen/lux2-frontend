import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";
import { buildQueryString } from "@/lib/utils/build-query-string";

export const ApiGetProblemWithdrawals = async ({
  limit,
  cursorCreatedAt,
  cursorId,
  organizationId,
  paymentMethod,
  internalStatus,
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
    createdAtStart,
    createdAtEnd,
  });

  return fetch(`${backendUrl}/problem-withdrawals?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
