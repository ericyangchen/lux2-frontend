import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiUpdateUser = async ({
  userId,
  name,
  email,
  password,
  role,
  accessToken,
}: {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({ name, email, password, role }),
  });
};
