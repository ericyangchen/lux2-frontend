import {
  ChartIcon,
  CreditCardIcon,
  TrendingUpIcon,
} from "../icons/DashboardIcons";

import { SystemDailyTransactionCount } from "@/lib/types/transaction";
import { TransactionStatCard } from "../cards/TransactionStatCard";

export const TransactionSection = ({
  systemDailyTransactionCount,
}: {
  systemDailyTransactionCount: SystemDailyTransactionCount;
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">今日交易概況</h2>
        <p className="text-gray-600">今日交易統計與成功率</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionStatCard
          title="今日訂單總數"
          value={systemDailyTransactionCount?.total || "0"}
          icon={ChartIcon}
        />
        <TransactionStatCard
          title="代收訂單"
          value={(
            parseInt(systemDailyTransactionCount?.depositSuccessTotal || "0") +
            parseInt(systemDailyTransactionCount?.depositFailedTotal || "0")
          ).toString()}
          successCount={systemDailyTransactionCount?.depositSuccessTotal || "0"}
          failedCount={systemDailyTransactionCount?.depositFailedTotal || "0"}
          icon={TrendingUpIcon}
        />
        <TransactionStatCard
          title="代付訂單"
          value={(
            parseInt(
              systemDailyTransactionCount?.withdrawalSuccessTotal || "0"
            ) +
            parseInt(systemDailyTransactionCount?.withdrawalFailedTotal || "0")
          ).toString()}
          successCount={
            systemDailyTransactionCount?.withdrawalSuccessTotal || "0"
          }
          failedCount={
            systemDailyTransactionCount?.withdrawalFailedTotal || "0"
          }
          icon={CreditCardIcon}
        />
      </div>
    </div>
  );
};
