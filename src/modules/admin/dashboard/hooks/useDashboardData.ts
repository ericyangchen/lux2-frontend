import {
  useSystemChannelPerformance,
  useSystemDailyTransactionCount,
  useSystemPaymentMethodDistribution,
  useSystemWeeklyTransactionTrends,
} from "@/lib/hooks/swr/transaction";

import { Calculator } from "@/lib/utils/calculator";
import { useSystemBalance } from "@/lib/hooks/swr/balance";
import { useSystemBalanceHistory } from "@/lib/hooks/swr/balance-snapshots";

export const useDashboardData = () => {
  const { systemBalance } = useSystemBalance();
  const { systemDailyTransactionCount } = useSystemDailyTransactionCount();
  const { systemWeeklyTransactionTrends } = useSystemWeeklyTransactionTrends();
  const { systemPaymentMethodDistribution } =
    useSystemPaymentMethodDistribution();
  const { systemChannelPerformance } = useSystemChannelPerformance();
  const { systemBalanceHistory } = useSystemBalanceHistory({ days: 7 });

  const totalBalance = systemBalance
    ? Calculator.plus(
        systemBalance.totalAvailableAmount,
        systemBalance.totalDepositUnsettledAmount
      )
    : "0";

  return {
    systemBalance,
    totalBalance,
    systemDailyTransactionCount,
    systemWeeklyTransactionTrends,
    systemPaymentMethodDistribution,
    systemChannelPerformance,
    systemBalanceHistory,
  };
};
