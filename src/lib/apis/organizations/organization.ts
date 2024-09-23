import { backendUrl } from "@/lib/constants";

export const getOrganizationInfoApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getOrganizationWithChildrenApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/children`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createOrganizationApi = async ({
  name,
  type,
  parentId,
  accessToken,
}: {
  name: string;
  type: string;
  parentId?: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
      type,
      parentId,
    }),
  });
};

export const updateOrganizationInfoApi = async ({
  organizationId,
  name,
  accessToken,
}: {
  organizationId: string;
  name: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
    }),
  });
};
