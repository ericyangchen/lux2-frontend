import { PaymentMethod } from "../enums/transactions/payment-method.enum";

export interface Balance {
  id: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  availableAmount: string;
  depositUnsettledAmount: string;
  withdrawalPendingAmount: string;
  frozenAmount: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface SystemBalance {
  totalAvailableAmount: string;
  totalDepositUnsettledAmount: string;
  totalWithdrawalPendingAmount: string;
  totalFrozenAmount: string;
}
