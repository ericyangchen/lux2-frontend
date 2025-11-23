import { AnalyticsSection } from "./components/sections/AnalyticsSection";
import { BalanceSection } from "./components/sections/BalanceSection";
import { PaymentChannelSection } from "./components/sections/PaymentChannelSection";
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
  } = useDashboardData();

  return (
    <div className="space-y-8">
      <BalanceSection currencyBalances={currencyBalances} />

      <TransactionSection
        systemDailyTransactionCount={systemDailyTransactionCount}
      />

      <AnalyticsSection
        systemWeeklyTransactionTrends={systemWeeklyTransactionTrends}
        systemDailyTransactionCount={systemDailyTransactionCount}
        systemDailyBalanceSnapshots={systemDailyBalanceSnapshots}
      />

      <PaymentChannelSection
        systemPaymentMethodDistribution={systemPaymentMethodDistribution}
        systemChannelPerformance={systemChannelPerformance}
      />
    </div>
  );
}
