import { BalanceAction } from "../enums/balances/balance-action.enum";
import { PaymentMethod } from "../enums/transactions/payment-method.enum";

export interface BalanceRecord {
  id: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  action: BalanceAction;
  availableAmountChanged?: string;
  depositUnsettledAmountChanged?: string;
  withdrawalPendingAmountChanged?: string;
  frozenAmountChanged?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
