import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

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
    `${getBackendUrl()}/organizations/${encodeURIComponent(
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
    `${getBackendUrl()}/organizations/${encodeURIComponent(
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

  return fetch(`${getBackendUrl()}/revenues?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
