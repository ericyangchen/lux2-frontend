import {
  ChartIcon,
  CreditCardIcon,
  TrendingUpIcon,
  WalletIcon,
} from "../icons/DashboardIcons";

import { StatCard } from "../cards/StatCard";
import { SystemBalance } from "@/lib/types/balance";

interface BalanceSectionProps {
  totalBalance: string;
  systemBalance: SystemBalance;
}

export const BalanceSection = ({
  totalBalance,
  systemBalance,
}: BalanceSectionProps) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">系統總餘額</h2>
        <p className="text-gray-600">即時查看系統內所有餘額狀況</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="總餘額"
          value={totalBalance}
          subtitle="系統內總金額"
          textColor="text-purple-600"
          icon={WalletIcon}
        />
        <StatCard
          title="可用餘額"
          value={systemBalance?.totalAvailableAmount || "0"}
          subtitle="可立即使用"
          textColor="text-green-600"
          icon={ChartIcon}
        />
        <StatCard
          title="未結算額度"
          value={systemBalance?.totalDepositUnsettledAmount || "0"}
          subtitle="待處理金額"
          textColor="text-amber-600"
          icon={CreditCardIcon}
        />
        <StatCard
          title="凍結額度"
          value={systemBalance?.totalFrozenAmount || "0"}
          subtitle="暫時凍結"
          textColor="text-red-600"
          icon={TrendingUpIcon}
        />
      </div>
    </div>
  );
};
