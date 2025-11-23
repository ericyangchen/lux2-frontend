import { AnalyticsSection } from "./components/sections/AnalyticsSection";
import { BalanceSection } from "./components/sections/BalanceSection";
import { UpstreamBalancesSection } from "./components/sections/UpstreamBalancesSection";
import { TransactionSection } from "./components/sections/TransactionSection";
import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardView() {
  const {
    currencyBalances,
    systemDailyTransactionCount,
    systemWeeklyTransactionTrends,
    systemPaymentMethodDistribution,
    systemChannelPerformance,
    systemDailyBalanceSnapshots,
    upstreamBalances,
  } = useDashboardData();

  return (
    <div className="space-y-8">
      <BalanceSection currencyBalances={currencyBalances} />

      <UpstreamBalancesSection upstreamBalances={upstreamBalances} />

      <TransactionSection
        systemDailyTransactionCount={systemDailyTransactionCount}
      />

      <AnalyticsSection
        systemWeeklyTransactionTrends={systemWeeklyTransactionTrends}
        systemDailyTransactionCount={systemDailyTransactionCount}
        systemDailyBalanceSnapshots={systemDailyBalanceSnapshots}
      />
    </div>
  );
}
