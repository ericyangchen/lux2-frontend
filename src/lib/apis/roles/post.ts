import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
import { Role } from "./get";

export const ApiCreateRole = async ({
  organizationId,
  name,
  permissionIds,
  accessToken,
}: {
  organizationId: string;
  name: string;
  permissionIds?: string[];
  accessToken: string;
}): Promise<Response> => {
  return fetch(`${getBackendUrl()}/roles`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      name,
      permissionIds,
    }),
  });
};

