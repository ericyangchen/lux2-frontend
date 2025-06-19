import { NotificationStatus } from "../enums/txn-notifications/notification-status.enum";

export interface TransactionNotification {
  id: string;
  transactionId: string;
  notifyUrl: string;
  payload: any;
  attemptCount: number;
  maxAttempts: number;
  status: NotificationStatus;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  lastError?: string;
  lastResponse?: any;
  lastHttpStatus?: number;
  cloudTaskName?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}
