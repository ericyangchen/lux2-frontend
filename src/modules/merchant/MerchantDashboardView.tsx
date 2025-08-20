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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
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

// Enhanced color palette for professional look
const COLORS = {
  primary: "#0f172a", // slate-900
  success: "#059669", // emerald-600
  warning: "#d97706", // amber-600
  danger: "#dc2626", // red-600
  neutral: "#64748b", // slate-500
  accent: "#3b82f6", // blue-500
};

const CHART_COLORS = ["#0f172a", "#059669", "#d97706", "#dc2626", "#3b82f6"];

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
        return "text-emerald-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-slate-500";
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
    <Card className="group relative overflow-hidden border-slate-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">
                {title}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">
                {isVisible ? `${currencySymbol} ${value}` : "••••••"}
              </div>

              {change && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm",
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
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 transition-all"
            >
              {isVisible ? (
                <EyeSlashIcon className="h-4 w-4 text-slate-400" />
              ) : (
                <EyeIcon className="h-4 w-4 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      label: "查看交易",
      href: "/merchant/transactions",
      color: "bg-slate-900",
    },
    {
      label: "申請下發",
      href: "/merchant/merchant-requested-withdrawals",
      color: "bg-emerald-600",
    },
    { label: "用戶管理", href: "/merchant/users", color: "bg-blue-600" },
    {
      label: "生成報表",
      href: "/merchant/reports/balance",
      color: "bg-amber-600",
    },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          快速操作
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={cn(
              "flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium",
              "hover:opacity-90 transition-all duration-200",
              action.color
            )}
          >
            {action.label}
          </a>
        ))}
      </CardContent>
    </Card>
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
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          今日交易
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumberInInteger(data.total || "0")}
            </div>
            <div className="text-sm text-slate-600">總筆數</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {successRate}%
            </div>
            <div className="text-sm text-slate-600">成功率</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">成功</span>
            </div>
            <span className="font-medium text-slate-900">
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
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">失敗</span>
            </div>
            <span className="font-medium text-slate-900">
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
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-slate-600">處理中</span>
            </div>
            <span className="font-medium text-slate-900">
              {formatNumberInInteger(
                (
                  parseInt(data.depositPendingTotal || "0") +
                  parseInt(data.withdrawalPendingTotal || "0")
                ).toString()
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
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
  <Card className={cn("border-slate-200", className)}>
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-semibold text-slate-900">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80">{children}</div>
    </CardContent>
  </Card>
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
    <div className="space-y-6">
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
          changeType="increase"
          change="+2.5%"
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
          changeType="decrease"
          change="-0.8%"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Weekly Transaction Trends */}
          <ChartContainer title="週交易趨勢">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={COLORS.accent}
                  radius={[4, 4, 0, 0]}
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
