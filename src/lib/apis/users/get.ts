import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";
export const ApiGetUserById = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  const url = `${getBackendUrl()}/users/${encodeURIComponent(userId)}`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetOrganizationUsers = async ({
  organizationId,
  accessToken,
}: {
  organizationId: string;
  accessToken: string;
}) => {
  const url = `${getBackendUrl()}/organizations/${encodeURIComponent(
    organizationId
  )}/users`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
