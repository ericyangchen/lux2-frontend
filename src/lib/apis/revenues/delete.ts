import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiDeleteRevenue = async ({
  revenueId,
  accessToken,
}: {
  revenueId: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/revenues/${revenueId}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
