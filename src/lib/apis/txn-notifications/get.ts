import { NotificationStatus } from "@/lib/enums/txn-notifications/notification-status.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { buildQueryString } from "@/lib/utils/build-query-string";
import { getBackendUrl } from "@/lib/constants/common";

export const ApiGetTransactionNotifications = async ({
  limit,
  cursorId,
  cursorCreatedAt,
  status,
  accessToken,
}: {
  status?: NotificationStatus;
  limit?: number;
  cursorId?: string;
  cursorCreatedAt?: string;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    limit,
    cursorId,
    cursorCreatedAt,
    status,
  });

  return fetch(`${getBackendUrl()}/transaction-notifications?${queryString}`, {
    method: "GET",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
  });
};

export const ApiGetTransactionNotificationByTransactionId = async ({
  transactionId,
  accessToken,
}: {
  transactionId: string;
  accessToken: string;
}) => {
  return fetch(
    `${getBackendUrl()}/transaction-notifications/by-transaction/${transactionId}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};

export const ApiGetTransactionNotificationCount = async ({
  status,
  accessToken,
}: {
  status?: NotificationStatus;
  accessToken: string;
}) => {
  const queryString = buildQueryString({
    status,
  });

  return fetch(
    `${getBackendUrl()}/transaction-notifications/count?${queryString}`,
    {
      method: "GET",
      headers: SMPayWebHeaderWithAccessToken(accessToken),
    }
  );
};
