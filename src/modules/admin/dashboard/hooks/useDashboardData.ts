import {
  useSystemChannelPerformance,
  useSystemDailyTransactionCount,
  useSystemPaymentMethodDistribution,
  useSystemWeeklyTransactionTrends,
} from "@/lib/hooks/swr/transaction";

import { Calculator } from "@/lib/utils/calculator";
import { useSystemBalance } from "@/lib/hooks/swr/balance";
import { useSystemDailyBalanceSnapshots } from "@/lib/hooks/swr/balance-snapshots";

export const useDashboardData = () => {
  const { systemBalance } = useSystemBalance();
  const { systemDailyTransactionCount } = useSystemDailyTransactionCount();
  const { systemWeeklyTransactionTrends } = useSystemWeeklyTransactionTrends();
  const { systemPaymentMethodDistribution } =
    useSystemPaymentMethodDistribution();
  const { systemChannelPerformance } = useSystemChannelPerformance();
  const { systemDailyBalanceSnapshots } = useSystemDailyBalanceSnapshots({
    days: 7,
  });

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
    systemDailyBalanceSnapshots,
  };
};
