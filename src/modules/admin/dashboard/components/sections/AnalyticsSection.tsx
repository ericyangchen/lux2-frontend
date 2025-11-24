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
  COLORS,
  createSuccessRateData,
  createTransactionTypeData,
  transformDailyBalanceDataByCurrency,
} from "../../utils/chartDataTransformers";

import { ChartCard } from "../cards/ChartCard";
import { SystemDailyBalanceSnapshots } from "@/lib/types/balance-snapshot";
import { SystemDailyTransactionCount } from "@/lib/types/transaction";
import { SystemWeeklyTransactionTrends } from "@/lib/types/transaction";

export const AnalyticsSection = ({
  systemWeeklyTransactionTrends,
  systemDailyTransactionCount,
  systemDailyBalanceSnapshots,
}: {
  systemWeeklyTransactionTrends: SystemWeeklyTransactionTrends;
  systemDailyTransactionCount: SystemDailyTransactionCount;
  systemDailyBalanceSnapshots: SystemDailyBalanceSnapshots;
}) => {
  const { chartData: dailyBalanceData, currencies } =
    transformDailyBalanceDataByCurrency(
      systemDailyBalanceSnapshots?.balanceSnapshots || []
    );

  const CHART_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db"];
  const successRateData = createSuccessRateData(systemDailyTransactionCount);
  const transactionTypeData = createTransactionTypeData(
    systemDailyTransactionCount
  );

  // Calculate total for percentage calculation
  const totalTransactions = successRateData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // Custom tooltip formatter for pie chart
  const formatPieTooltip = (value: number, name: string) => {
    const percentage =
      totalTransactions > 0
        ? ((value / totalTransactions) * 100).toFixed(2)
        : "0.00";
    return [`${value} (${percentage}%)`, name];
  };

  // Custom tooltip formatter for bar chart
  const formatBarTooltip = (value: number, name: string, props: any) => {
    const data = props.payload;
    const total = data.success + data.pending + data.failed;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
    return [`${value} (${percentage}%)`, name];
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">數據分析</h2>
        <p className="text-gray-600">趨勢分析與詳細統計圖表</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Weekly Transaction Trend */}
        <ChartCard title="週交易趨勢" subtitle="過去一週的交易量變化">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={systemWeeklyTransactionTrends?.weeklyData || []}>
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
        <ChartCard title="今日交易狀態" subtitle="交易成功、處理中與失敗比例">
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
                formatter={formatPieTooltip}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Balance History */}
        <ChartCard title="餘額變化趨勢" subtitle="近期餘額變化（按貨幣分組）">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyBalanceData}>
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
              {currencies.map((currency: string, index: number) => (
                <Line
                  key={`${currency}_total`}
                  type="monotone"
                  dataKey={`${currency}_total`}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  name={`${currency} 總餘額`}
                  dot={{
                    fill: CHART_COLORS[index % CHART_COLORS.length],
                    strokeWidth: 2,
                    r: 4,
                  }}
                />
              ))}
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
                formatter={formatBarTooltip}
              />
              <Legend />
              <Bar
                dataKey="success"
                fill={COLORS.success}
                name="成功"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill={COLORS.warning}
                name="處理中"
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
  );
};
