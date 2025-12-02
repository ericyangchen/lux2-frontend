import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiCalculateReversal = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transactions/testing-accounts/${encodeURIComponent(
      organizationId
    )}/calculate-reversal`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiCleanupTestingAccountTransactions = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transactions/testing-accounts/${encodeURIComponent(
      organizationId
    )}/cleanup`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
