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

export interface BatchResendNotificationsData {
  organizationId: string;
  successAtStart: string;
  successAtEnd: string;
}

export interface BatchResendNotificationsResponse {
  success: boolean;
  data: {
    totalTransactionsFound: number;
    notificationsResent: number;
    errors: Array<{
      transactionId: string;
      error: string;
    }>;
    details: Array<{
      transactionId: string;
      notificationId: string;
      status: "resent" | "error";
      message?: string;
    }>;
  };
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

export const ApiRetryNotificationByTransactionId = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transaction-notifications/retry-by-transaction/${transactionId}`,
    {
      method: "POST",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiBatchResendNotifications = async ({
  data,
  accessToken,
}: {
  data: BatchResendNotificationsData;
  accessToken: string;
}) => {
  return fetch(`${getBackendUrl()}/transaction-notifications/batch-resend`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify(data),
  });
};
