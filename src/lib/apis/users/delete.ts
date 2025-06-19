import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiDeleteUser = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};
