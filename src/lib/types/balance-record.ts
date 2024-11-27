import { PaymentMethod } from "./transaction";

export interface BalanceRecord {
  id: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  availableAmountChanged?: string;
  depositUnsettledAmountChanged?: string;
  withdrawalPendingAmountChanged?: string;
  frozenAmountChanged?: string;
  action: string;
  createdAt: string;
}
