import { CreatorType } from "../enums/transactions/creator-type.enum";
import { TransactionLogAction } from "../enums/transactions/transaction-log-action.enum";

// Display names for transaction log actions
export const TransactionLogActionDisplayNames = {
  [TransactionLogAction.TRANSACTION_CREATED]: "交易創建",
  [TransactionLogAction.SUBMIT_TO_UPSTREAM]: "提交至上游",
  [TransactionLogAction.UPSTREAM_RESPONSE]: "上游回應",
  [TransactionLogAction.TRANSACTION_SUCCESS]: "交易成功",
  [TransactionLogAction.TRANSACTION_FAILED]: "交易失敗",

  // Admin actions
  [TransactionLogAction.SET_TO_FAILED_BY_ADMIN]: "管理員設為失敗",
  [TransactionLogAction.ADMIN_FORCE_MODIFIED]: "管理員強制修改交易",
  [TransactionLogAction.RESUBMISSION_TRIGGERED]: "觸發重送",
  [TransactionLogAction.APPROVED_MERCHANT_REQUESTED_WITHDRAWAL]: "批准下發",
  [TransactionLogAction.REJECTED_MERCHANT_REQUESTED_WITHDRAWAL]: "拒絕下發",

  [TransactionLogAction.SEND_NOTIFICATION_TO_MERCHANT]: "發送異步通知",
  [TransactionLogAction.MANUALLY_TRIGGER_NOTIFICATION_TO_MERCHANT]:
    "手動觸發異步通知",
  [TransactionLogAction.REVENUE_DISTRIBUTED]: "分潤完成",
};

// Display names for creator types
export const CreatorTypeDisplayNames = {
  [CreatorType.MERCHANT_API]: "商戶 API",
  [CreatorType.MERCHANT_WEB]: "商戶 Web",
  [CreatorType.ADMIN_API]: "總代理 API",
  [CreatorType.ADMIN_WEB]: "總代理 Web",
  [CreatorType.INTERNAL_SYSTEM]: "系統",
};
