import {
  SMPayWebHeader,
  SMPayWebHeaderWithAccessToken,
} from "../smpay-web-header";

import { IpWhitelistType } from "@/lib/enums/ip-whitelists/ip-whitelist-type.enum";
import { backendUrl } from "@/lib/constants/common";
import { buildQueryString } from "@/lib/utils/build-query-string";

export const ApiTestIpDetection = async () => {
  return fetch(`${backendUrl}/ip-detection`, {
    method: "GET",
    headers: SMPayWebHeader(),
  });
};

export const ApiGetOrganizationIpWhitelists = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/ip-whitelists`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiCheckIpWhitelisted = async ({
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
  const queryString = buildQueryString({
    type,
  });

  return fetch(
    `${backendUrl}/organizations/${encodeURIComponent(
      organizationId
    )}/ip-whitelists/ip-check/${encodeURIComponent(ipAddress)}?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
