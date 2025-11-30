import { TransactionInternalStatus } from "../enums/transactions/transaction-internal-status.enum";

/**
 * Internal statuses that represent problematic withdrawal transactions
 * These are withdrawal transactions that are stuck in PENDING status due to issues
 */
export const PROBLEM_WITHDRAWAL_INTERNAL_STATUSES = [
  TransactionInternalStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE,
  TransactionInternalStatus.WITHDRAWAL_REQUIRE_MANUAL_REVIEW,
];
