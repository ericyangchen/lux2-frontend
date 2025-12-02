import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetTestingAccountCleanupInfo = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transactions/testing-accounts/${encodeURIComponent(
      organizationId
    )}/cleanup-info`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
