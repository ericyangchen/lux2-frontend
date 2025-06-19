import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { Transaction } from "@/lib/types/transaction";
import { backendUrl } from "@/lib/constants/common";

export const ApiCreateManualNotification = async ({
  transaction,
  accessToken,
}: {
  transaction: Transaction;
  accessToken: string;
}) => {
  return fetch(`${backendUrl}/transaction-notifications/manual-create`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      transaction,
    }),
  });
};

export const ApiRetryTransactionNotification = async ({
  notificationId,
  accessToken,
}: {
  notificationId: string;
  accessToken: string;
}) => {
  return fetch(
    `${backendUrl}/transaction-notifications/${notificationId}/retry`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
