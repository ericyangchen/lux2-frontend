import {
  ApiGetOrganizationById,
  ApiGetOrganizationWithChildren,
} from "@/lib/apis/organizations/get";
import {
  USE_ORGANIZATION_REFRESH_INTERVAL,
  USE_ORGANIZATION_WITH_CHILDREN_REFRESH_INTERVAL,
} from "../../constants/swr-refresh-interval";

import { ApplicationError } from "@/lib/error/applicationError";
import { Organization } from "@/lib/types/organization";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useSwrWithAuth } from "../useSwrWithAuth";

const fetchOrganizationWithChildren = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationWithChildren({
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

export const useOrganizationWithChildren = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch
      ? { key: "organization-with-children", organizationId, accessToken }
      : null,
    fetchOrganizationWithChildren,
    { refreshInterval: USE_ORGANIZATION_WITH_CHILDREN_REFRESH_INTERVAL }
  );

  return {
    organization: data as Organization,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchOrganizationById = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await ApiGetOrganizationById({
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

export const useOrganization = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSwrWithAuth(
    shouldFetch ? { key: "organization", organizationId, accessToken } : null,
    fetchOrganizationById,
    {
      refreshInterval: USE_ORGANIZATION_REFRESH_INTERVAL,
    }
  );

  return {
    organization: data as Organization,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
