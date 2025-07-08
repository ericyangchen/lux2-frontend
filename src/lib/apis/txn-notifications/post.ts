import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { Transaction } from "@/lib/types/transaction";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { getBackendUrl } from "@/lib/constants/common";

export interface CreateManualNotificationData {
  id: string;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: string;
  amount: string;
  totalFee: string;
  balanceChanged: string;
  status: TransactionStatus;
  message?: string;
  successAt?: string;
  notifyUrl: string;
  maxAttempts?: number;
}

export const ApiCreateManualNotification = async ({
  data,
  accessToken,
}: {
  data: CreateManualNotificationData;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/transaction-notifications/manual-create`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
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
    `${getBackendUrl()}/transaction-notifications/${notificationId}/retry`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
