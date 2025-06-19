import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiGetOrganizationBalance = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/balances`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetSystemBalances = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/balances/system`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
