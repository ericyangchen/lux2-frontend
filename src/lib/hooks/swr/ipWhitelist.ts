import { ApplicationError } from "@/lib/types/applicationError";
import { IpWhitelist } from "@/lib/types/ip-whitelist";
import { USE_ORGANIZATION_IP_WHITELISTS_REFRESH_INTERVAL } from "./constants";
import { getApplicationCookies } from "@/lib/cookie";
import { getOrganizationIpWhitelistsByOrganizationIdApi } from "@/lib/apis/organizations/ip-whitelist";
import useSWR from "swr";

const fetchOrganizationIpWhitelistsByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getOrganizationIpWhitelistsByOrganizationIdApi({
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

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "ip-whitelists", organizationId, accessToken } : null,
    fetchOrganizationIpWhitelistsByOrganizationId,
    { refreshInterval: USE_ORGANIZATION_IP_WHITELISTS_REFRESH_INTERVAL }
  );

  return {
    ipWhitelists: (data?.ipWhitelists as IpWhitelist[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
