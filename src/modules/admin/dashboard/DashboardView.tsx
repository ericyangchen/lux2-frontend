import { AnalyticsSection } from "./components/sections/AnalyticsSection";
import { BalanceSection } from "./components/sections/BalanceSection";
import { PaymentChannelSection } from "./components/sections/PaymentChannelSection";
import { TransactionSection } from "./components/sections/TransactionSection";
import { useDashboardData } from "./hooks/useDashboardData";

export default function DashboardView() {
  const {
    systemBalance,
    totalBalance,
    systemDailyTransactionCount,
    systemWeeklyTransactionTrends,
    systemPaymentMethodDistribution,
    systemChannelPerformance,
    systemBalanceHistory,
  } = useDashboardData();

  return (
    <div className="space-y-8">
      <BalanceSection
        totalBalance={totalBalance}
        systemBalance={systemBalance}
      />

      <TransactionSection
        systemDailyTransactionCount={systemDailyTransactionCount}
      />

      <AnalyticsSection
        systemWeeklyTransactionTrends={systemWeeklyTransactionTrends}
        systemDailyTransactionCount={systemDailyTransactionCount}
        systemBalanceHistory={systemBalanceHistory}
      />

      <PaymentChannelSection
        systemPaymentMethodDistribution={systemPaymentMethodDistribution}
        systemChannelPerformance={systemChannelPerformance}
      />
    </div>
  );
}
