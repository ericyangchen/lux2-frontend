import { SMPayWebHeaderWithAccessToken } from "../../../smpay-web-header";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiDeveloperGenerateTotpQrCode = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/users/${encodeURIComponent(
      userId
    )}/totp/qr-code`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiDeveloperGenerateTotpVerificationCode = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/developer/users/${encodeURIComponent(
      userId
    )}/totp/verification-code`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
