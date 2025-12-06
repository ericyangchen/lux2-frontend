import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiDeleteRole = async ({
  roleId,
  accessToken,
}: {
  roleId: string;
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/roles/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

