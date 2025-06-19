import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiDeleteRevenue = async ({
  revenueId,
  accessToken,
}: {
  revenueId: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/revenues/${revenueId}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
