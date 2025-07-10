import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetSystemDailyBalanceSnapshots = async ({
  days,
  endDate,
  startDate,
  paymentMethod,
  accessToken,
}: {
  days?: number;
  endDate?: string;
  startDate?: string;
  paymentMethod?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    days,
    endDate,
    startDate,
    paymentMethod,
  });

  return fetch(
    `${getBackendUrl()}/balance-snapshots/daily-balance-snapshots/system?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetOrganizationDailyBalanceSnapshots = async ({
  days,
  startDate,
  endDate,
  paymentMethod,
  organizationId,
  accessToken,
}: {
  days?: number;
  endDate?: string;
  startDate?: string;
  paymentMethod?: string;
  organizationId: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    days,
    endDate,
    startDate,
    paymentMethod,
    organizationId,
  });

  return fetch(
    `${getBackendUrl()}/balance-snapshots/daily-balance-snapshots/organization?${queryString}`,
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
