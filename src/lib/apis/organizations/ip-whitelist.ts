import { backendUrl } from "@/lib/constants";

export const getOrganizationIpWhitelistsByOrganizationIdApi = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/ip-whitelists`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createOrganizationIpWhitelistApi = async ({
  organizationId,
  creatorId,
  type,
  ipAddress,
  accessToken,
}: {
  organizationId: string;
  creatorId: string;
  ipAddress: string;
  type: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/ip-whitelists`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ creatorId, type, ipAddress }),
  });
};

export const deleteOrganizationIpWhitelistApi = async ({
  organizationId,
  ipWhitelistId,
  accessToken,
}: {
  organizationId: string;
  ipWhitelistId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/ip-whitelists/${encodeURIComponent(ipWhitelistId)}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
