import { ApiGetUserRoles } from "@/lib/apis/user-roles/get";
import { Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchUserRoles = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}): Promise<Role[]> => {
  const response = await ApiGetUserRoles({
    userId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user roles");
  }

  return response.json();
};

export const useUserRoles = ({ userId }: { userId?: string }) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && userId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "user-roles", userId, accessToken } : null,
    fetchUserRoles,
    { refreshInterval: 0 } // Don't auto-refresh user roles
  );

  return {
    roles: (data as Role[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
