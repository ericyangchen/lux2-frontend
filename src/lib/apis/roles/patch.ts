import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiUpdateRole = async ({
  roleId,
  name,
  permissionIds,
  accessToken,
}: {
  roleId: string;
  name?: string;
  permissionIds?: string[];
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/roles/${encodeURIComponent(roleId)}`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      name,
      permissionIds,
    }),
  });
};

