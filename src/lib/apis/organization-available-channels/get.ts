import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetAvailableChannelsVisualization = async ({
  organizationId,
  accessToken,
}: {
  organizationId?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    organizationId,
  });

  return fetch(
    `${getBackendUrl()}/organization-available-channels/visualization?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

