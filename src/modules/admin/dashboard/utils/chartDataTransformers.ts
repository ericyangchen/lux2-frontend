import { format } from "date-fns";

export const COLORS = {
  primary: "#8b5cf6", // purple-500
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  secondary: "#6b7280", // gray-500
};

export const transformDailyBalanceData = (dailyBalances: any[]) => {
  return dailyBalances.map((item) => ({
    name: format(new Date(item.date), "MM/dd"),
    balance: item.totalBalance,
    available: item.availableBalance,
    frozen: item.frozenBalance,
    unsettled: item.unsettledBalance,
  }));
};

export const transformPaymentMethodData = (paymentMethodData: any[]) => {
  return paymentMethodData.map((item, index) => ({
    ...item,
    color: [
      COLORS.primary,
      COLORS.success,
      COLORS.warning,
      COLORS.danger,
      COLORS.secondary,
    ][index % 5],
  }));
};

export const createSuccessRateData = (systemDailyTransactionCount: any) => {
  const successCount =
    parseInt(systemDailyTransactionCount?.depositSuccessTotal || "0") +
    parseInt(systemDailyTransactionCount?.withdrawalSuccessTotal || "0");

  const pendingCount =
    parseInt(systemDailyTransactionCount?.depositPendingTotal || "0") +
    parseInt(systemDailyTransactionCount?.withdrawalPendingTotal || "0");

  const failedCount =
    parseInt(systemDailyTransactionCount?.depositFailedTotal || "0") +
    parseInt(systemDailyTransactionCount?.withdrawalFailedTotal || "0");

  return [
    {
      name: "成功",
      value: successCount,
      color: COLORS.success,
    },
    {
      name: "處理中",
      value: pendingCount,
      color: COLORS.warning,
    },
    {
      name: "失敗",
      value: failedCount,
      color: COLORS.danger,
    },
  ];
};

export const createTransactionTypeData = (systemDailyTransactionCount: any) => {
  return [
    {
      name: "代收",
      success: parseInt(
        systemDailyTransactionCount?.depositSuccessTotal || "0"
      ),
      pending: parseInt(
        systemDailyTransactionCount?.depositPendingTotal || "0"
      ),
      failed: parseInt(systemDailyTransactionCount?.depositFailedTotal || "0"),
    },
    {
      name: "代付",
      success: parseInt(
        systemDailyTransactionCount?.withdrawalSuccessTotal || "0"
      ),
      pending: parseInt(
        systemDailyTransactionCount?.withdrawalPendingTotal || "0"
      ),
      failed: parseInt(
        systemDailyTransactionCount?.withdrawalFailedTotal || "0"
      ),
    },
  ];
};
