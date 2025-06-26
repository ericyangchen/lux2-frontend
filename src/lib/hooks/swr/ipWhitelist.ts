import { ApiGetOrganizationIpWhitelists } from "@/lib/apis/ip-whitelists/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { IpWhitelist } from "@/lib/types/ip-whitelist";
import { USE_ORGANIZATION_IP_WHITELISTS_REFRESH_INTERVAL } from "../../constants/swr-refresh-interval";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchOrganizationIpWhitelistsByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationIpWhitelists({
    organizationId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useIpWhitelists = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "ip-whitelists", organizationId, accessToken } : null,
    fetchOrganizationIpWhitelistsByOrganizationId,
    { refreshInterval: USE_ORGANIZATION_IP_WHITELISTS_REFRESH_INTERVAL }
  );

  return {
    ipWhitelists: (data as IpWhitelist[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
