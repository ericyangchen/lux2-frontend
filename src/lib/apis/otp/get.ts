import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiGenerateTotpQrCode = async ({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/users/${encodeURIComponent(userId)}/totp/qr-code`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
