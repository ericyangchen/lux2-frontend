import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiAdminDeleteUser = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiMerchantDeleteUser = async ({
  organizationId,
  userId,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/${encodeURIComponent(
      organizationId
    )}/users/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
