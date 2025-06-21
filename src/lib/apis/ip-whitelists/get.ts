import {
  SMPayWebHeader,
  SMPayWebHeaderWithAccessToken,
} from "../smpay-web-header";

import { IpWhitelistType } from "@/lib/enums/ip-whitelists/ip-whitelist-type.enum";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiTestIpDetection = async () => {
  return fetch(`${getBackendUrl()}/ip-detection`, {
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
    `${getBackendUrl()}/organizations/${encodeURIComponent(
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
    `${getBackendUrl()}/organizations/${encodeURIComponent(
      organizationId
    )}/ip-whitelists/ip-check/${encodeURIComponent(ipAddress)}?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
