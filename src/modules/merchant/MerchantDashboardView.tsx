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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";
import {
  useDailyTransactionCountByOrganizationId,
  useWeeklyTransactionTrendsByOrganizationId,
} from "@/lib/hooks/swr/transaction";

import { Calculator } from "@/lib/utils/calculator";
import { Label } from "@/components/shadcn/ui/label";
import MerchantPaymentMethodInfo from "./MerchantPaymentMethodInfo";
import { classNames } from "@/lib/utils/classname-utils";
import { currencySymbol } from "@/lib/constants/common";
import { format } from "date-fns";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useOrganizationBalanceHistory } from "@/lib/hooks/swr/balance-snapshots";

// Mock data for merchant charts - replaced with real API data below

const COLORS = {
  primary: "#8b5cf6", // purple-500
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  secondary: "#6b7280", // gray-500
};

const StatCard = ({
  title,
  value,
  subtitle,
  textColor = "text-gray-900",
  bgColor = "bg-white",
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  textColor?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <Card
      className={`${bgColor} border border-gray-200 shadow-md hover:shadow-lg transition-shadow`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${textColor} mb-1`}>
              {currencySymbol} {formatNumber(value)}
            </p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {icon && <div className="ml-4 p-3 bg-gray-50 rounded-lg">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionStatCard = ({
  title,
  value,
  successCount,
  failedCount,
  icon,
}: {
  title: string;
  value: string;
  successCount?: string;
  failedCount?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {formatNumberInInteger(value)}
            </p>
            {successCount !== undefined && failedCount !== undefined && (
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">成功:</span>
                  <span className="font-medium text-green-600 ml-1">
                    {formatNumberInInteger(successCount)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">失敗:</span>
                  <span className="font-medium text-red-600 ml-1">
                    {formatNumberInInteger(failedCount)}
                  </span>
                </div>
              </div>
            )}
          </div>
          {icon && <div className="ml-4 p-3 bg-gray-50 rounded-lg">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="h-80">{children}</div>
      </CardContent>
    </Card>
  );
};

export default function MerchantDashboardView() {
  const { organizationId } = getApplicationCookies();

  const { balances } = useBalances({ organizationId });

  // Get balance history for the chart (last 7 days)
  const { organizationBalanceHistory } = useOrganizationBalanceHistory({
    organizationId,
    days: 7,
  });

  // Transform balance history data for the chart
  const balanceHistoryData = (
    organizationBalanceHistory?.balanceHistory || []
  ).map((item) => ({
    name: format(new Date(item.date), "MM/dd"),
    balance: item.totalBalance,
    available: item.availableBalance,
    frozen: item.frozenBalance,
    unsettled: item.unsettledBalance,
  }));

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

  const { dailyTransactionCountByOrganizationId } =
    useDailyTransactionCountByOrganizationId({ organizationId });
  const { weeklyTransactionTrendsByOrganizationId } =
    useWeeklyTransactionTrendsByOrganizationId({ organizationId });

  // Success rate data for pie chart
  const successRateData = [
    {
      name: "成功",
      value:
        parseInt(
          dailyTransactionCountByOrganizationId?.depositSuccessTotal || "0"
        ) +
        parseInt(
          dailyTransactionCountByOrganizationId?.withdrawalSuccessTotal || "0"
        ),
      color: COLORS.success,
    },
    {
      name: "失敗",
      value:
        parseInt(
          dailyTransactionCountByOrganizationId?.depositFailedTotal || "0"
        ) +
        parseInt(
          dailyTransactionCountByOrganizationId?.withdrawalFailedTotal || "0"
        ),
      color: COLORS.danger,
    },
  ];

  // Transaction type breakdown
  const transactionTypeData = [
    {
      name: "代收",
      success: parseInt(
        dailyTransactionCountByOrganizationId?.depositSuccessTotal || "0"
      ),
      failed: parseInt(
        dailyTransactionCountByOrganizationId?.depositFailedTotal || "0"
      ),
    },
    {
      name: "代付",
      success: parseInt(
        dailyTransactionCountByOrganizationId?.withdrawalSuccessTotal || "0"
      ),
      failed: parseInt(
        dailyTransactionCountByOrganizationId?.withdrawalFailedTotal || "0"
      ),
    },
  ];

  // SVG Icons
  const WalletIcon = (
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );

  const ChartIcon = (
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );

  const CreditCardIcon = (
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );

  const TrendingUpIcon = (
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );

  return (
    <div className="space-y-8">
      {/* Balance Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">系統總餘額</h2>
          <p className="text-gray-600">即時查看您的帳戶餘額狀況</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="總餘額"
            value={totalBalance || "0"}
            subtitle="您的總金額"
            textColor="text-purple-600"
            icon={WalletIcon}
          />
          <StatCard
            title="可用餘額"
            value={totalAvailableAmount || "0"}
            subtitle="可立即使用"
            textColor="text-green-600"
            icon={ChartIcon}
          />
          <StatCard
            title="未結算額度"
            value={totalDepositUnsettledAmount || "0"}
            subtitle="待處理金額"
            textColor="text-amber-600"
            icon={CreditCardIcon}
          />
          <StatCard
            title="凍結額度"
            value={totalFrozenAmount || "0"}
            subtitle="暫時凍結"
            textColor="text-red-600"
            icon={TrendingUpIcon}
          />
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            今日交易概況
          </h2>
          <p className="text-gray-600">今日交易統計與成功率</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TransactionStatCard
            title="今日訂單總數"
            value={dailyTransactionCountByOrganizationId?.total || "0"}
            icon={ChartIcon}
          />
          <TransactionStatCard
            title="代收訂單"
            value={(
              parseInt(
                dailyTransactionCountByOrganizationId?.depositSuccessTotal ||
                  "0"
              ) +
              parseInt(
                dailyTransactionCountByOrganizationId?.depositFailedTotal || "0"
              )
            ).toString()}
            successCount={
              dailyTransactionCountByOrganizationId?.depositSuccessTotal || "0"
            }
            failedCount={
              dailyTransactionCountByOrganizationId?.depositFailedTotal || "0"
            }
            icon={TrendingUpIcon}
          />
          <TransactionStatCard
            title="代付訂單"
            value={(
              parseInt(
                dailyTransactionCountByOrganizationId?.withdrawalSuccessTotal ||
                  "0"
              ) +
              parseInt(
                dailyTransactionCountByOrganizationId?.withdrawalFailedTotal ||
                  "0"
              )
            ).toString()}
            successCount={
              dailyTransactionCountByOrganizationId?.withdrawalSuccessTotal ||
              "0"
            }
            failedCount={
              dailyTransactionCountByOrganizationId?.withdrawalFailedTotal ||
              "0"
            }
            icon={CreditCardIcon}
          />
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">數據分析</h2>
          <p className="text-gray-600">趨勢分析與詳細統計圖表</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Weekly Transaction Trend */}
          <ChartCard title="週交易趨勢" subtitle="過去一週的交易量變化">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyTransactionTrendsByOrganizationId?.weeklyData || []}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Success Rate Pie Chart */}
          <ChartCard title="今日成功率" subtitle="交易成功與失敗比例">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                >
                  {successRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Balance History */}
          <ChartCard title="餘額變化趨勢" subtitle="近期餘額與凍結金額變化">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="available"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="可用餘額"
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="frozen"
                  stroke={COLORS.danger}
                  strokeWidth={2}
                  name="凍結額度"
                  dot={{ fill: COLORS.danger, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Transaction Type Breakdown */}
          <ChartCard title="交易類型分析" subtitle="代收與代付交易成功失敗對比">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="success"
                  fill={COLORS.success}
                  name="成功"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="failed"
                  fill={COLORS.danger}
                  name="失敗"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">支付類型</h2>
          <p className="text-gray-600">您可使用的支付類型</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-md">
          <CardContent className="p-6">
            <MerchantPaymentMethodInfo organizationId={organizationId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
