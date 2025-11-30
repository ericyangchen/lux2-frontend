export enum BalanceAction {
  // init
  INIT = 'INIT', // initial balance

  // deposit
  DEPOSIT_SUCCESS = 'DEPOSIT_SUCCESS', // +availableAmount (or +depositUnsettledAmount)
  DEPOSIT_SETTLED = 'DEPOSIT_SETTLED', // -depositUnsettledAmount and +availableAmount

  // withdrawal
  WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED', // -availableAmount and +withdrawalPendingAmount
  WITHDRAWAL_SUCCESS = 'WITHDRAWAL_SUCCESS', // -withdrawalPendingAmount
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED', // +availableAmount and -withdrawalPendingAmount
  WITHDRAWAL_FAILED_REFUNDED = 'WITHDRAWAL_FAILED_REFUNDED', // +availableAmount

  // revenue
  REVENUE_DISTRIBUTED = 'REVENUE_DISTRIBUTED', // +availableAmount
  REVENUE_ROLLBACK_DUE_TO_WITHDRAWAL_REFUNDED = 'REVENUE_ROLLBACK_DUE_TO_WITHDRAWAL_REFUNDED', // -availableAmount

  // manual operation
  FREEZE_BALANCE = 'FREEZE_BALANCE', // -availableAmount and +frozenAmount
  UNFREEZE_BALANCE = 'UNFREEZE_BALANCE', // +availableAmount and -frozenAmount
  DIRECT_MODIFY_ADD_BALANCE = 'DIRECT_MODIFY_ADD_BALANCE', // +availableAmount (no txn record created)
  DIRECT_MODIFY_SUBTRACT_BALANCE = 'DIRECT_MODIFY_SUBTRACT_BALANCE', // -availableAmount (no txn record created)
  TRANSFER_OUT = 'TRANSFER_OUT', // -availableAmount from source org
  TRANSFER_IN = 'TRANSFER_IN', // +availableAmount to destination org
}
