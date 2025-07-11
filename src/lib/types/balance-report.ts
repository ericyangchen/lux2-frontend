import { BalanceRecord } from "./balance-record";
import { PaymentMethod } from "../enums/transactions/payment-method.enum";
import { Transaction } from "./transaction";

export interface BalanceBreakdown {
  availableAmount: string;
  depositUnsettledAmount: string;
  withdrawalPendingAmount: string;
  frozenAmount: string;
  totalBalance: string;
}

export interface BalanceReportSummary {
  transactionCount: number;
  totalTransactionAmount: string;
  balanceModificationCount: number;
  totalBalanceModification: string;
  isValid: boolean;
  difference?: string;
}

export interface TransactionsPagination {
  total: number;
  limit: number;
  hasMore: boolean;
  nextCursorSuccessAt?: string;
  nextCursorId?: string;
  prevCursorSuccessAt?: string;
  prevCursorId?: string;
}

// New type for balance summary response (without transactions)
export interface BalanceSummary {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string;
  startBalance: BalanceBreakdown;
  endBalance: BalanceBreakdown;
  balanceModifications: BalanceRecord[];
  summary: BalanceReportSummary;
}

// New type for balance transactions response (with pagination)
export interface BalanceTransactions {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string;
  transactions: Transaction[];
  pagination: TransactionsPagination;
}
