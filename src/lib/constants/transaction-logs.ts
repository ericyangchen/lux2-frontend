import { CreatorType } from "../enums/transactions/creator-type.enum";
import { TransactionLogAction } from "../enums/transactions/transaction-log-action.enum";

// Display names for transaction log actions
export const TransactionLogActionDisplayNames = {
  [TransactionLogAction.TRANSACTION_CREATED]: "交易創建",
  [TransactionLogAction.SUBMIT_TO_UPSTREAM]: "提交至上游",
  [TransactionLogAction.UPSTREAM_RESPONSE]: "上游回應",
  [TransactionLogAction.TRANSACTION_SUCCESS]: "交易成功",
  [TransactionLogAction.TRANSACTION_FAILED]: "交易失敗",
  [TransactionLogAction.SET_TO_FAILED_BY_ADMIN]: "管理員設為失敗",
  [TransactionLogAction.FAILED_ADDED_TO_RETRY_QUEUE]: "失敗加入重試隊列",
  [TransactionLogAction.SEND_NOTIFICATION_TO_MERCHANT]: "發送通知給商戶",
  [TransactionLogAction.MANUALLY_TRIGGER_NOTIFICATION_TO_MERCHANT]:
    "手動觸發商戶通知",
  [TransactionLogAction.REVENUE_DISTRIBUTED]: "收益分配",
};

// Display names for creator types
export const CreatorTypeDisplayNames = {
  [CreatorType.MERCHANT_API]: "商戶 API",
  [CreatorType.MERCHANT_WEB]: "商戶網頁",
  [CreatorType.ADMIN_API]: "管理員 API",
  [CreatorType.ADMIN_WEB]: "管理員網頁",
  [CreatorType.INTERNAL_SYSTEM]: "內部系統",
};
