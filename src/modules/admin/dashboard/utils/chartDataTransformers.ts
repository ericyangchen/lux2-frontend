import { format } from "date-fns";

export const COLORS = {
  primary: "#8b5cf6", // purple-500
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  secondary: "#6b7280", // gray-500
};

export const transformBalanceHistoryData = (balanceHistory: any[]) => {
  return balanceHistory.map((item) => ({
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
  return [
    {
      name: "成功",
      value:
        parseInt(systemDailyTransactionCount?.depositSuccessTotal || "0") +
        parseInt(systemDailyTransactionCount?.withdrawalSuccessTotal || "0"),
      color: COLORS.success,
    },
    {
      name: "失敗",
      value:
        parseInt(systemDailyTransactionCount?.depositFailedTotal || "0") +
        parseInt(systemDailyTransactionCount?.withdrawalFailedTotal || "0"),
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
      failed: parseInt(systemDailyTransactionCount?.depositFailedTotal || "0"),
    },
    {
      name: "代付",
      success: parseInt(
        systemDailyTransactionCount?.withdrawalSuccessTotal || "0"
      ),
      failed: parseInt(
        systemDailyTransactionCount?.withdrawalFailedTotal || "0"
      ),
    },
  ];
};
