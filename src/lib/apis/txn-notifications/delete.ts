import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export const ApiCancelTransactionNotification = async ({
  notificationId,
  accessToken,
}: {
  notificationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/transaction-notifications/${notificationId}/cancel`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
