import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetSystemBalanceHistory = async ({
  days,
  endDate,
  accessToken,
}: {
  days?: number;
  endDate?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    days,
    endDate,
  });

  return fetch(
    `${getBackendUrl()}/balance-snapshots/history/system?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetOrganizationBalanceHistory = async ({
  days,
  endDate,
  organizationId,
  accessToken,
}: {
  days?: number;
  endDate?: string;
  organizationId: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    days,
    endDate,
    organizationId,
  });

  return fetch(
    `${getBackendUrl()}/balance-snapshots/history/organization?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiInitializeDailySnapshots = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/balance-snapshots/initialize`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
