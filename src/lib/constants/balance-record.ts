import { BalanceAction } from "../enums/balances/balance-action.enum";

export const BalanceActionDisplayNames = {
  [BalanceAction.INIT]: "初始化",

  // deposit
  [BalanceAction.DEPOSIT_SUCCESS]: "代收成功",
  [BalanceAction.DEPOSIT_SETTLED]: "代收結算",

  // withdrawal
  [BalanceAction.WITHDRAWAL_CREATED]: "代付申請建立",
  [BalanceAction.WITHDRAWAL_SUCCESS]: "代付成功",
  [BalanceAction.WITHDRAWAL_FAILED]: "代付失敗",
  [BalanceAction.WITHDRAWAL_FAILED_REFUNDED]: "代付失敗: 退款",

  // revenue
  [BalanceAction.REVENUE_DISTRIBUTED]: "分潤",
  [BalanceAction.REVENUE_ROLLBACK_DUE_TO_WITHDRAWAL_REFUNDED]: "分潤收回",

  // manual operation
  [BalanceAction.DIRECT_MODIFY_ADD_BALANCE]: "加值餘額",
  [BalanceAction.DIRECT_MODIFY_SUBTRACT_BALANCE]: "扣除餘額",
  [BalanceAction.FREEZE_BALANCE]: "凍結餘額",
  [BalanceAction.UNFREEZE_BALANCE]: "解凍餘額",
};
