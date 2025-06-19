import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";
import { buildQueryString } from "@/lib/utils/build-query-string";

export const ApiGetOrganizationRevenueByTransactionId = async ({
  organizationId,
  fromTransactionId,
  accessToken,
}: {
  organizationId: string;
  fromTransactionId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/revenues/by-transaction-id/${encodeURIComponent(fromTransactionId)}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetOrganizationRevenues = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/revenues`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetRevenues = async ({
  fromTransactionId,
  organizationId,
  paymentMethod,
  limit,
  cursorCreatedAt,
  cursorId,
  accessToken,
}: {
  fromTransactionId?: string;
  organizationId?: string;
  paymentMethod?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    fromTransactionId,
    organizationId,
    paymentMethod,
    limit,
    cursorCreatedAt,
    cursorId,
  });

  return fetch(`${backendUrl}/revenues?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
