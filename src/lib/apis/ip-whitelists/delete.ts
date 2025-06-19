import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiDeleteIpWhitelist = async ({
  ipWhitelistId,
  accessToken,
}: {
  ipWhitelistId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/ip-whitelists/${encodeURIComponent(ipWhitelistId)}`,
    {
      method: "DELETE",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
