import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
import { Role } from "../roles/get";

export interface UserRoleAssociation {
  userId: string;
  roleId: string;
  role: Role;
}

export const ApiGetUserRolesByOrganization = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}): Promise<Response> => {
  return fetch(
    `${getBackendUrl()}/user-roles/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetUserRoles = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/user-roles/users/${encodeURIComponent(userId)}/roles`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

