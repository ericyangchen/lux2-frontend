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

// System balances grouped by payment method (returned from API)
export interface SystemBalanceByPaymentMethod {
  paymentMethod: PaymentMethod;
  availableAmount: string;
  depositUnsettledAmount: string;
  withdrawalPendingAmount: string;
  frozenAmount: string;
}

export type SystemBalancesByPaymentMethod = SystemBalanceByPaymentMethod[];
