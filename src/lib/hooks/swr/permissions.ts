import { ApiGetPermissions, Permission } from "@/lib/apis/permissions/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchPermissions = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<Permission[]> => {
  const response = await ApiGetPermissions({
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch permissions");
  }

  return response.json();
};

export const usePermissions = () => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = !!accessToken;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "permissions", accessToken } : null,
    fetchPermissions,
    { refreshInterval: 0 } // Don't auto-refresh permissions
  );

  return {
    permissions: (data as Permission[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
