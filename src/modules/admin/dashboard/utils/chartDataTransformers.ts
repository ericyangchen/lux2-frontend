import { format } from "date-fns";
import { PaymentMethodCurrencyMapping } from "@/lib/constants/transaction";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Calculator } from "@/lib/utils/calculator";

export const COLORS = {
  primary: "#8b5cf6", // purple-500
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  secondary: "#6b7280", // gray-500
};

const CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db"];

// Get currency for a payment method
const getCurrencyForPaymentMethod = (
  paymentMethod: PaymentMethod | string
): string | null => {
  for (const [currency, paymentMethods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (paymentMethods.includes(paymentMethod as PaymentMethod)) {
      return currency;
    }
  }
  return null;
};

// Transform balance snapshots grouped by currency
export const transformDailyBalanceDataByCurrency = (
  dailyBalances: any[]
): { chartData: any[]; currencies: string[] } => {
  if (!dailyBalances || dailyBalances.length === 0) {
    return { chartData: [], currencies: [] };
  }

  // Group by date and currency
  const dateCurrencyMap = new Map<string, Map<string, any>>();

  for (const balance of dailyBalances) {
    const date = balance.date;
    const currency = getCurrencyForPaymentMethod(balance.paymentMethod || "");

    if (!currency) continue;

    if (!dateCurrencyMap.has(date)) {
      dateCurrencyMap.set(date, new Map());
    }

    const currencyMap = dateCurrencyMap.get(date)!;

    if (!currencyMap.has(currency)) {
      currencyMap.set(currency, {
        date,
        currency,
        totalBalance: "0",
        availableBalance: "0",
        frozenBalance: "0",
        unsettledBalance: "0",
      });
    }

    const existing = currencyMap.get(currency)!;
    existing.totalBalance = Calculator.plus(
      existing.totalBalance,
      String(balance.totalBalance || 0)
    );
    existing.availableBalance = Calculator.plus(
      existing.availableBalance,
      String(balance.availableBalance || 0)
    );
    existing.frozenBalance = Calculator.plus(
      existing.frozenBalance,
      String(balance.frozenBalance || 0)
    );
    existing.unsettledBalance = Calculator.plus(
      existing.unsettledBalance,
      String(balance.unsettledBalance || 0)
    );
  }

  // Get all unique dates and currencies
  const allDates = Array.from(dateCurrencyMap.keys()).sort();
  const allCurrencies = new Set<string>();
  dateCurrencyMap.forEach((currencyMap) => {
    currencyMap.forEach((_, currency) => allCurrencies.add(currency));
  });
  const currencies = Array.from(allCurrencies).sort();

  // Build chart data: array of objects, one per date, with currency fields
  const chartData = allDates.map((date) => {
    const dataPoint: any = {
      name: format(new Date(date), "MM/dd"),
    };

    const currencyMap = dateCurrencyMap.get(date)!;
    currencies.forEach((currency) => {
      const balance = currencyMap.get(currency);
      if (balance) {
        dataPoint[`${currency}_total`] = parseFloat(balance.totalBalance);
        dataPoint[`${currency}_available`] = parseFloat(
          balance.availableBalance
        );
        dataPoint[`${currency}_frozen`] = parseFloat(balance.frozenBalance);
        dataPoint[`${currency}_unsettled`] = parseFloat(
          balance.unsettledBalance
        );
      } else {
        dataPoint[`${currency}_total`] = 0;
        dataPoint[`${currency}_available`] = 0;
        dataPoint[`${currency}_frozen`] = 0;
        dataPoint[`${currency}_unsettled`] = 0;
      }
    });

    return dataPoint;
  });

  return { chartData, currencies };
};

// Legacy function for backwards compatibility (aggregates all currencies)
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
