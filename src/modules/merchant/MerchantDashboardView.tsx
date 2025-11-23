import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";
import {
  useDailyTransactionCountByOrganizationId,
  useWeeklyTransactionTrendsByOrganizationId,
} from "@/lib/hooks/swr/transaction";

import { Calculator } from "@/lib/utils/calculator";
import MerchantPaymentMethodInfo from "./MerchantPaymentMethodInfo";
import { cn } from "@/lib/utils/classname-utils";
import { currencySymbol } from "@/lib/constants/common";
import { format } from "date-fns";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useOrganizationDailyBalanceSnapshots } from "@/lib/hooks/swr/balance-snapshots";

// Minimal color palette for business style
const COLORS = {
  primary: "#111827", // gray-900
  secondary: "#6b7280", // gray-500
  accent: "#4b5563", // gray-600
  success: "#065f46", // muted green
  error: "#991b1b", // muted red
  warning: "#92400e", // muted amber
};

const CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db"];

// Modern Balance Card Component
const BalanceCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  isVisible = true,
  onToggleVisibility,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ElementType;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-gray-700";
      case "decrease":
        return "text-gray-900";
      default:
        return "text-gray-500";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <ArrowUpIcon className="h-3 w-3" />;
      case "decrease":
        return <ArrowDownIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="group relative border border-gray-200 bg-white">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {title}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-semibold text-gray-900 tracking-tight">
                {isVisible ? `${currencySymbol} ${value}` : "••••••"}
              </div>

              {change && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    getChangeColor()
                  )}
                >
                  {getChangeIcon()}
                  <span>{change}</span>
                </div>
              )}
            </div>
          </div>

          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="opacity-0 group-hover:opacity-100 p-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-all"
            >
              {isVisible ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      label: "查看交易",
      href: "/merchant/transactions",
    },
    {
      label: "申請下發",
      href: "/merchant/merchant-requested-withdrawals",
    },
    { label: "用戶管理", href: "/merchant/users" },
    {
      label: "生成報表",
      href: "/merchant/reports/balance",
    },
  ];

  return (
    <div className="border border-gray-200 bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          快速操作
        </h3>
      </div>
      <div className="p-6 space-y-2">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {action.label}
          </a>
        ))}
      </div>
    </div>
  );
};

// Transaction Summary Card
const TransactionSummary = ({ data }: { data: any }) => {
  if (!data) return null;

  const totalTransactions = parseInt(data.total || "0");
  const successRate =
    totalTransactions > 0
      ? (
          ((parseInt(data.depositSuccessTotal || "0") +
            parseInt(data.withdrawalSuccessTotal || "0")) /
            totalTransactions) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="border border-gray-200 bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          今日交易
        </h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">
              {formatNumberInInteger(data.total || "0")}
            </div>
            <div className="text-xs text-gray-600 mt-1 uppercase tracking-wide">
              總筆數
            </div>
          </div>
          <div className="text-center p-4 border border-gray-200">
            <div className="text-2xl font-semibold text-gray-900">
              {successRate}%
            </div>
            <div className="text-xs text-gray-600 mt-1 uppercase tracking-wide">
              成功率
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">成功</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatNumberInInteger(
                (
                  parseInt(data.depositSuccessTotal || "0") +
                  parseInt(data.withdrawalSuccessTotal || "0")
                ).toString()
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">失敗</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatNumberInInteger(
                (
                  parseInt(data.depositFailedTotal || "0") +
                  parseInt(data.withdrawalFailedTotal || "0")
                ).toString()
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-600">處理中</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatNumberInInteger(
                (
                  parseInt(data.depositPendingTotal || "0") +
                  parseInt(data.withdrawalPendingTotal || "0")
                ).toString()
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Container Component
const ChartContainer = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("border border-gray-200 bg-white", className)}>
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-6">
      <div className="h-80">{children}</div>
    </div>
  </div>
);

export default function MerchantDashboardView() {
  const { organizationId } = getApplicationCookies();
  const [balanceVisibility, setBalanceVisibility] = useState({
    total: true,
    available: true,
    unsettled: true,
    frozen: true,
  });

  // Data hooks
  const { balances } = useBalances({ organizationId });
  const { organizationDailyBalanceSnapshots } =
    useOrganizationDailyBalanceSnapshots({
      organizationId,
      days: 7,
    });
  const { dailyTransactionCountByOrganizationId } =
    useDailyTransactionCountByOrganizationId({ organizationId });
  const { weeklyTransactionTrendsByOrganizationId } =
    useWeeklyTransactionTrendsByOrganizationId({ organizationId });

  // Balance calculations
  const totalBalance = balances?.reduce((acc, balance) => {
    const totalBalance = Calculator.plus(
      balance.availableAmount,
      balance.depositUnsettledAmount
    );
    return Calculator.plus(acc, totalBalance);
  }, "0");

  const totalAvailableAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.availableAmount),
    "0"
  );
  const totalDepositUnsettledAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.depositUnsettledAmount),
    "0"
  );
  const totalFrozenAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.frozenAmount),
    "0"
  );

  // Chart data
  const dailyBalanceData = (
    organizationDailyBalanceSnapshots?.balanceSnapshots || []
  ).map((item: any) => ({
    name: format(new Date(item.date), "MM/dd"),
    balance: formatNumber(item.totalBalance),
    available: formatNumber(item.availableBalance),
    frozen: formatNumber(item.frozenBalance),
    unsettled: formatNumber(item.unsettledBalance),
  }));

  const weeklyData = weeklyTransactionTrendsByOrganizationId?.weeklyData || [];

  const toggleBalanceVisibility = (type: keyof typeof balanceVisibility) => {
    setBalanceVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Hero Section - Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BalanceCard
          title="總餘額"
          value={formatNumber(totalBalance) || "0.000"}
          icon={WalletIcon}
          isVisible={balanceVisibility.total}
          onToggleVisibility={() => toggleBalanceVisibility("total")}
        />
        <BalanceCard
          title="可用餘額"
          value={formatNumber(totalAvailableAmount) || "0.000"}
          icon={CreditCardIcon}
          isVisible={balanceVisibility.available}
          onToggleVisibility={() => toggleBalanceVisibility("available")}
        />
        <BalanceCard
          title="未結算額度"
          value={formatNumber(totalDepositUnsettledAmount) || "0.000"}
          icon={ClockIcon}
          isVisible={balanceVisibility.unsettled}
          onToggleVisibility={() => toggleBalanceVisibility("unsettled")}
        />
        <BalanceCard
          title="凍結額度"
          value={formatNumber(totalFrozenAmount) || "0.000"}
          icon={ArrowUpIcon}
          isVisible={balanceVisibility.frozen}
          onToggleVisibility={() => toggleBalanceVisibility("frozen")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* Balance Trend Chart */}
          <ChartContainer title="餘額趨勢 (近7天)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.05}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Weekly Transaction Trends */}
          <ChartContainer title="週交易趨勢">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={COLORS.primary}
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          <TransactionSummary data={dailyTransactionCountByOrganizationId} />
          <QuickActions />
        </div>
      </div>

      {/* Payment Method Information */}
      <MerchantPaymentMethodInfo organizationId={organizationId} />
    </div>
  );
}
