import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiAssignRolesToUserAdmin = async ({
  userId,
  roleIds,
  accessToken,
}: {
  userId: string;
  roleIds: string[];
  accessToken: string;
}): Promise<Response> => {
  return fetch(
    `${getBackendUrl()}/user-roles/admin/users/${encodeURIComponent(
      userId
    )}/roles`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
      body: JSON.stringify({ roleIds }),
    }
  );
};

export const ApiAssignRolesToUserMerchant = async ({
  userId,
  roleIds,
  accessToken,
}: {
  userId: string;
  roleIds: string[];
  accessToken: string;
}): Promise<Response> => {
  return fetch(
    `${getBackendUrl()}/user-roles/merchant/users/${encodeURIComponent(
      userId
    )}/roles`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
      body: JSON.stringify({ roleIds }),
    }
  );
};
