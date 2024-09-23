import {
  USE_USERS_REFRESH_INTERVAL,
  USE_USER_REFRESH_INTERVAL,
} from "./constants";
import {
  getUserByIdApi,
  getUsersByOrganizationIdApi,
} from "../../apis/organizations/users";

import { ApplicationError } from "@/lib/types/applicationError";
import { User } from "@/lib/types/user";
import { getApplicationCookies } from "@/lib/cookie";
import useSWR from "swr";

const fetchUserById = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  const response = await getUserByIdApi({
    organizationId,
    userId,
    accessToken,
  });

  if (!response.ok) {
    const errorData = await response.json();

    const error = new ApplicationError(errorData);

    throw error;
  }

  return response.json();
};

export const useUser = () => {
  const { accessToken, organizationId, userId } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId && userId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "user", organizationId, userId, accessToken } : null,
    fetchUserById,
    { refreshInterval: USE_USER_REFRESH_INTERVAL }
  );

  return {
    user: data?.user as User,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchUsersByOrganizationId = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getUsersByOrganizationIdApi({
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

export const useUsersByOrganizationId = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? { key: "users", organizationId, accessToken } : null,
    fetchUsersByOrganizationId,
    { refreshInterval: USE_USERS_REFRESH_INTERVAL }
  );

  return {
    users: (data?.users as User[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
