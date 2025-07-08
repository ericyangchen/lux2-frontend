import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetOrganizationBalanceModifications = async ({
  organizationId,
  paymentMethod,
  createdAtStart,
  createdAtEnd,
  accessToken,
}: {
  organizationId: string;
  paymentMethod?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  accessToken: string;
}) => {
  const queryParams = new URLSearchParams();
  if (paymentMethod) {
    queryParams.append("paymentMethod", paymentMethod);
  }
  if (createdAtStart) {
    queryParams.append("createdAtStart", createdAtStart);
  }
  if (createdAtEnd) {
    queryParams.append("createdAtEnd", createdAtEnd);
  }

  const queryString = queryParams.toString();
  const url = `${getBackendUrl()}/organizations/${encodeURIComponent(
    organizationId
  )}/balance-modifications${queryString ? `?${queryString}` : ""}`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
