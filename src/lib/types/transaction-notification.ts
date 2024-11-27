export interface TransactionNotification {
  id: string;
  transactionId: string;
  downstreamReceived: boolean;
  notifyCount: number;
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
