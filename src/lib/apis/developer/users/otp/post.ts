import { SMPayWebHeaderWithAccessToken } from "../../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiDeveloperEnableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/users/${encodeURIComponent(
      userId
    )}/totp/enable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiDeveloperDisableTotp = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/users/${encodeURIComponent(
      userId
    )}/totp/disable`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
