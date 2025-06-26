import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetOrganizationBalanceModifications = async ({
  organizationId,
  paymentMethod,
  accessToken,
}: {
  organizationId: string;
  paymentMethod?: string;
  accessToken: string;
}) => {
  const queryParams = new URLSearchParams();
  if (paymentMethod) {
    queryParams.append("paymentMethod", paymentMethod);
  }

  const queryString = queryParams.toString();
  const url = `${getBackendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/balance-modifications${queryString ? `?${queryString}` : ""}`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
