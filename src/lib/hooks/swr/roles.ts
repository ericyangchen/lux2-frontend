import { ApiGetRolesByOrganization, Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchRolesByOrganization = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}): Promise<Role[]> => {
  const response = await ApiGetRolesByOrganization({
    organizationId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch roles");
  }

  return response.json();
};

export const useRolesByOrganization = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "roles", organizationId, accessToken } : null,
    fetchRolesByOrganization,
    { refreshInterval: 0 } // Don't auto-refresh roles
  );

  return {
    roles: (data as Role[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
