import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiEnableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/users/${encodeURIComponent(userId)}/totp/enable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiDisableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/users/${encodeURIComponent(userId)}/totp/disable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
