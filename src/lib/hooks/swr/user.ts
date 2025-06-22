import { ApiGetOrganizationUsers, ApiGetUserById } from "@/lib/apis/users/get";
import {
  USE_USERS_REFRESH_INTERVAL,
  USE_USER_REFRESH_INTERVAL,
} from "../../constants/swr-refresh-interval";

import { ApplicationError } from "@/lib/error/applicationError";
import { User } from "@/lib/types/user";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchUserById = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  const response = await ApiGetUserById({
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
  const { accessToken, userId } = getApplicationCookies();

  const shouldFetch = accessToken && userId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "user", userId, accessToken } : null,
    fetchUserById,
    { refreshInterval: USE_USER_REFRESH_INTERVAL }
  );

  return {
    user: data as User,
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
  const response = await ApiGetOrganizationUsers({
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
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "users", organizationId, accessToken } : null,
    fetchUsersByOrganizationId,
    { refreshInterval: USE_USERS_REFRESH_INTERVAL }
  );

  return {
    users: (data as User[]) || [],
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
