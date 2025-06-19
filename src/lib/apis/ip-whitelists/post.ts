import { IpWhitelistType } from "@/lib/enums/ip-whitelists/ip-whitelist-type.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateIpWhitelist = async ({
  organizationId,
  ipAddress,
  type,
  accessToken,
}: {
  organizationId: string;
  ipAddress: string;
  type: IpWhitelistType;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/ip-whitelists`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ organizationId, type, ipAddress }),
  });
};
