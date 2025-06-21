import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiDeleteIpWhitelist = async ({
  ipWhitelistId,
  accessToken,
}: {
  ipWhitelistId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/ip-whitelists/${encodeURIComponent(ipWhitelistId)}`,
    {
      method: "DELETE",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
