import {
  useSystemChannelPerformance,
  useSystemDailyTransactionCount,
  useSystemPaymentMethodDistribution,
  useSystemWeeklyTransactionTrends,
} from "@/lib/hooks/swr/transaction";

import { Calculator } from "@/lib/utils/calculator";
import { useSystemBalance } from "@/lib/hooks/swr/balance";
import { useSystemDailyBalanceSnapshots } from "@/lib/hooks/swr/balance-snapshots";
import { PaymentMethodCurrencyMapping } from "@/lib/constants/transaction";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SystemBalanceByPaymentMethod } from "@/lib/types/balance";

// Get currency for a payment method
const getCurrencyForPaymentMethod = (
  paymentMethod: PaymentMethod
): string | null => {
  for (const [currency, paymentMethods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (paymentMethods.includes(paymentMethod)) {
      return currency;
    }
  }
  return null;
};

// Group balances by currency
const groupBalancesByCurrency = (
  balances: SystemBalanceByPaymentMethod[] | undefined
): Map<string, SystemBalanceByPaymentMethod[]> => {
  const grouped = new Map<string, SystemBalanceByPaymentMethod[]>();

  if (!balances) {
    return grouped;
  }

  for (const balance of balances) {
    const currency = getCurrencyForPaymentMethod(balance.paymentMethod);
    if (currency) {
      if (!grouped.has(currency)) {
        grouped.set(currency, []);
      }
      grouped.get(currency)!.push(balance);
    }
  }

  return grouped;
};

export const useDashboardData = () => {
  const { systemBalances } = useSystemBalance();
  const { systemDailyTransactionCount } = useSystemDailyTransactionCount();
  const { systemWeeklyTransactionTrends } = useSystemWeeklyTransactionTrends();
  const { systemPaymentMethodDistribution } =
    useSystemPaymentMethodDistribution();
  const { systemChannelPerformance } = useSystemChannelPerformance();
  const { systemDailyBalanceSnapshots } = useSystemDailyBalanceSnapshots({
    days: 7,
  });

  // Group balances by currency
  const balancesByCurrency = groupBalancesByCurrency(systemBalances);

  // Calculate aggregated balances per currency
  const currencyBalances = Array.from(balancesByCurrency.entries()).map(
    ([currency, currencyBalanceList]) => {
      const totalBalance = currencyBalanceList.reduce((acc, balance) => {
        const balanceTotal = Calculator.plus(
          balance.availableAmount,
          balance.depositUnsettledAmount
        );
        return Calculator.plus(acc, balanceTotal);
      }, "0");

      const totalAvailableAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.availableAmount),
        "0"
      );

      const totalDepositUnsettledAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.depositUnsettledAmount),
        "0"
      );

      const totalFrozenAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.frozenAmount),
        "0"
      );

      return {
        currency,
        totalBalance,
        totalAvailableAmount,
        totalDepositUnsettledAmount,
        totalFrozenAmount,
      };
    }
  );

  return {
    systemBalances,
    currencyBalances,
    systemDailyTransactionCount,
    systemWeeklyTransactionTrends,
    systemPaymentMethodDistribution,
    systemChannelPerformance,
    systemDailyBalanceSnapshots,
  };
};
