import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiAdminUpdateUser = async ({
  userId,
  name,
  email,
  password,
  accessToken,
}: {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ name, email, password }),
  });
};

export const ApiMerchantUpdateUser = async ({
  organizationId,
  userId,
  name,
  email,
  password,
  accessToken,
}: {
  organizationId: string;
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/organizations/${encodeURIComponent(organizationId)}/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
      body: JSON.stringify({ name, email, password }),
    }
  );
};
