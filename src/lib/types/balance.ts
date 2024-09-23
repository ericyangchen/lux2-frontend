export interface Balance {
  id: string;
  organizationId: string;
  paymentMethod: string;
  balance: string;
  availableAmount: string;
  depositUnsettledAmount: string;
  withdrawalPendingAmount: string;
  frozenBalance: string;
  action: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
