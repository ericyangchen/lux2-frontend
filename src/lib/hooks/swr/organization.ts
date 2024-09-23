import {
  USE_ORGANIZATION_INFO_REFRESH_INTERVAL,
  USE_ORGANIZATION_WITH_CHILDREN_REFRESH_INTERVAL,
} from "./constants";
import {
  getOrganizationInfoApi,
  getOrganizationWithChildrenApi,
} from "../../apis/organizations/organization";

import { ApplicationError } from "@/lib/types/applicationError";
import { Organization } from "@/lib/types/organization";
import { getApplicationCookies } from "@/lib/cookie";
import useSWR from "swr";

const fetchOrganizationWithChildren = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getOrganizationWithChildrenApi({
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

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? { key: "organizationWithChildren", organizationId, accessToken }
      : null,
    fetchOrganizationWithChildren,
    { refreshInterval: USE_ORGANIZATION_WITH_CHILDREN_REFRESH_INTERVAL }
  );

  return {
    organization: data?.organization as Organization,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};

const fetchOrganizationInfo = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const response = await getOrganizationInfoApi({
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

export const useOrganizationInfo = ({
  organizationId,
}: {
  organizationId?: string;
}) => {
  const { accessToken } = getApplicationCookies();

  const shouldFetch = accessToken && organizationId;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? { key: "organizationInfo", organizationId, accessToken }
      : null,
    fetchOrganizationInfo,
    {
      refreshInterval: USE_ORGANIZATION_INFO_REFRESH_INTERVAL,
    }
  );

  return {
    organization: data?.organization as Organization,
    isLoading: isLoading,
    isError: error,
    mutate,
  };
};
