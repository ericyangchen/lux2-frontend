import { PaymentMethod } from "../enums/transactions/payment-method.enum";
import { UnsettledBalanceStatus } from "../enums/unsettled-balances/unsettled-balance-status.enum";
import { UnsettledBalanceType } from "../enums/unsettled-balances/unsettled-balance-type.enum";

export interface UnsettledBalance {
  id: string;
  type: UnsettledBalanceType;
  organizationId: string;
  paymentMethod: PaymentMethod;
  balanceChanged: string;
  fromTransactionId: string;
  willBeSettledAt: string;
  status: UnsettledBalanceStatus;
  lastError?: string;
  settledAt?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
