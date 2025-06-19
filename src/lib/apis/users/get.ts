import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiGetUserById = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  const url = `${backendUrl}/users/${encodeURIComponent(userId)}`;

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
  const url = `${backendUrl}/organizations/${encodeURIComponent(
    organizationId
  )}/users`;

  return fetch(url, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
