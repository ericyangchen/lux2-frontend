import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export interface UserRoleAssociation {
  userId: string;
  roleId: string;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  userRoles?: UserRoleAssociation[]; // Included when fetching roles by organization
}

export const ApiGetRolesByOrganization = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${getBackendUrl()}/roles/organizations/${encodeURIComponent(
    organizationId
  )}`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetRoleById = async ({
  roleId,
  accessToken,
}: {
  roleId: string;
  accessToken: string;
}) => {
  const url = `${getBackendUrl()}/roles/${encodeURIComponent(roleId)}`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetRolePermissions = async ({
  roleId,
  accessToken,
}: {
  roleId: string;
  accessToken: string;
}) => {
  const url = `${getBackendUrl()}/roles/${encodeURIComponent(
    roleId
  )}/permissions`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
