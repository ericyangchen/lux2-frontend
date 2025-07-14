import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/shadcn/ui/label";
import {
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { useTransactionStatisticsCounts } from "@/lib/hooks/swr/transaction";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { formatNumber } from "@/lib/utils/number";
import { useState, useMemo } from "react";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// 顏色常數
const COLORS = {
  success: "#10b981", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  primary: "#8b5cf6", // purple-500
  secondary: "#6b7280", // gray-500
};

interface TransactionStatisticsProps {
  organizationId?: string;
}

interface StatisticsData {
  paymentChannel: PaymentChannel;
  total: number;
  success: number;
  pending: number;
  fail: number;
}

export function TransactionStatistics({
  organizationId,
}: TransactionStatisticsProps) {
  const { organization } = useOrganization({ organizationId });

  // Date range state
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Default to start of today
    return today;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Default to end of today
    return today;
  });

  // Query state - only query when this is true
  const [shouldQuery, setShouldQuery] = useState(false);

  // Format dates for API - only when shouldQuery is true
  const startOfCreatedAt =
    shouldQuery && startDate ? startDate.toISOString() : undefined;
  const endOfCreatedAt =
    shouldQuery && endDate ? endDate.toISOString() : undefined;

  // Quick time range functions
  const setToday = () => {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    setStartDate(startOfToday);
    setEndDate(endOfToday);
    setShouldQuery(false); // Reset query state
  };

  const setLastHour = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    setStartDate(oneHourAgo);
    setEndDate(now);
    setShouldQuery(false); // Reset query state
  };

  const setYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    setStartDate(yesterday);
    setEndDate(yesterdayEnd);
    setShouldQuery(false); // Reset query state
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    setStartDate(lastMonth);
    setEndDate(lastMonthEnd);
    setShouldQuery(false); // Reset query state
  };

  const handleQuery = () => {
    setShouldQuery(true);
  };

  // Get statistics data
  const { statistics, isLoading, isError } = useTransactionStatisticsCounts({
    merchantId: organizationId,
    startOfCreatedAt,
    endOfCreatedAt,
  });

  // Process statistics data
  const processedData = useMemo(() => {
    if (!statistics?.data) return { deposit: [], withdrawal: [] };

    const depositData: StatisticsData[] = [];
    const withdrawalData: StatisticsData[] = [];

    statistics.data.forEach((item: StatisticsData) => {
      // Check if this is a deposit or withdrawal channel
      const isDeposit = Object.values(DepositPaymentChannelCategories).some(
        (channels) => channels.includes(item.paymentChannel)
      );

      if (isDeposit) {
        depositData.push(item);
      } else {
        withdrawalData.push(item);
      }
    });

    return { deposit: depositData, withdrawal: withdrawalData };
  }, [statistics]);

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    const deposit = processedData.deposit.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        success: acc.success + item.success,
        pending: acc.pending + item.pending,
        fail: acc.fail + item.fail,
      }),
      { total: 0, success: 0, pending: 0, fail: 0 }
    );

    const withdrawal = processedData.withdrawal.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        success: acc.success + item.success,
        pending: acc.pending + item.pending,
        fail: acc.fail + item.fail,
      }),
      { total: 0, success: 0, pending: 0, fail: 0 }
    );

    return { deposit, withdrawal };
  }, [processedData]);

  // Group data by payment method
  const paymentMethodData = useMemo(() => {
    const result: Record<
      PaymentMethod,
      {
        deposit: StatisticsData[];
        withdrawal: StatisticsData[];
      }
    > = {
      [PaymentMethod.NATIVE_GCASH]: { deposit: [], withdrawal: [] },
      [PaymentMethod.MAYA]: { deposit: [], withdrawal: [] },
      [PaymentMethod.QRPH]: { deposit: [], withdrawal: [] },
    };

    processedData.deposit.forEach((item) => {
      // Find which payment method this channel belongs to
      Object.entries(DepositPaymentChannelCategories).forEach(
        ([method, channels]) => {
          if (channels.includes(item.paymentChannel)) {
            result[method as PaymentMethod].deposit.push(item);
          }
        }
      );
    });

    processedData.withdrawal.forEach((item) => {
      // Find which payment method this channel belongs to
      Object.entries(WithdrawalPaymentChannelCategories).forEach(
        ([method, channels]) => {
          if (channels.includes(item.paymentChannel)) {
            result[method as PaymentMethod].withdrawal.push(item);
          }
        }
      );
    });

    return result;
  }, [processedData]);

  if (!organizationId || !organization) {
    return (
      <div className="border rounded-lg p-4 flex h-full justify-center items-center">
        <p className="text-gray-500">請選擇一個組織來查看交易統計</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 min-h-fit xl:h-[calc(100vh-84px)] xl:overflow-y-scroll">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">交易統計</h2>
        <p className="text-gray-600">查看組織的交易統計數據</p>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-8">
          {/* 左半邊：時間範圍設置 + 快捷按鈕 */}
          <div className="flex-1">
            <Label className="text-lg font-semibold block mb-4">時間範圍</Label>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">開始時間</Label>
                <div className="w-fit min-w-[240px]">
                  <DateTimePicker
                    date={startDate}
                    setDate={setStartDate}
                    placeholder="yyyy/mm/dd HH:mm:ss"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">結束時間</Label>
                <div className="w-fit min-w-[240px]">
                  <DateTimePicker
                    date={endDate}
                    setDate={setEndDate}
                    placeholder="yyyy/mm/dd HH:mm:ss"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="whitespace-nowrap">快速選擇</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setToday}
                  className="text-xs"
                >
                  今天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setLastHour}
                  className="text-xs"
                >
                  前一小時
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setYesterday}
                  className="text-xs"
                >
                  昨天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setLastMonth}
                  className="text-xs"
                >
                  上個月
                </Button>
              </div>
            </div>
          </div>

          {/* 右半邊：查詢按鈕 */}
          <div className="flex items-end">
            <Button onClick={handleQuery} className="w-[120px]">
              查詢
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center h-48">
          <p className="text-red-500">載入失敗</p>
        </div>
      )}

      {/* Statistics Content */}
      {!isLoading && !isError && statistics && (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deposit Summary */}
            <SummaryCard
              title="代收統計"
              data={summaryTotals.deposit}
              color="blue"
            />

            {/* Withdrawal Summary */}
            <SummaryCard
              title="代付統計"
              data={summaryTotals.withdrawal}
              color="green"
            />
          </div>

          {/* Payment Method Details */}
          {Object.entries(paymentMethodData).map(([paymentMethod, data]) => {
            const method = paymentMethod as PaymentMethod;
            const hasData =
              data.deposit.length > 0 || data.withdrawal.length > 0;

            if (!hasData) return null;

            return (
              <PaymentMethodSection
                key={paymentMethod}
                paymentMethod={method}
                data={data}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  data: { total: number; success: number; pending: number; fail: number };
  color: "blue" | "green";
}

function SummaryCard({ title, data, color }: SummaryCardProps) {
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
    green: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
  };

  const textColor = {
    blue: "text-blue-900",
    green: "text-green-900",
  };

  const successRate =
    data.total > 0
      ? `${((data.success / data.total) * 100).toFixed(2)}%`
      : "無法計算";

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${colorClasses[color]}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${textColor[color]}`}>{title}</h3>
          <div className="text-right">
            <span className="text-sm text-gray-600">成功率</span>
            <div className={`font-mono font-medium ${textColor[color]}`}>
              {successRate}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">成功</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {data.success.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">處理中</span>
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                {data.pending.toLocaleString()}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">失敗</span>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                {data.fail.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">總計</span>
              <Badge variant="default" className="font-mono">
                {data.total.toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  data: {
    deposit: StatisticsData[];
    withdrawal: StatisticsData[];
  };
}

function PaymentMethodSection({
  paymentMethod,
  data,
}: PaymentMethodSectionProps) {
  // Calculate totals for deposit and withdrawal
  const depositTotals = data.deposit.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      success: acc.success + item.success,
      pending: acc.pending + item.pending,
      fail: acc.fail + item.fail,
    }),
    { total: 0, success: 0, pending: 0, fail: 0 }
  );

  const withdrawalTotals = data.withdrawal.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      success: acc.success + item.success,
      pending: acc.pending + item.pending,
      fail: acc.fail + item.fail,
    }),
    { total: 0, success: 0, pending: 0, fail: 0 }
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {PaymentMethodDisplayNames[paymentMethod]}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {/* Upper Section: Deposit and Withdrawal Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Deposit Summary - Always show if payment method has any data */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">代收統計</h4>
              <div className="text-right">
                <span className="text-sm text-gray-600">成功率</span>
                <div className="font-mono font-medium text-blue-900">
                  {depositTotals.total > 0
                    ? `${(
                        (depositTotals.success / depositTotals.total) *
                        100
                      ).toFixed(2)}%`
                    : "無法計算"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">成功</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    {depositTotals.success.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">處理中</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {depositTotals.pending.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">失敗</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {depositTotals.fail.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    總計
                  </span>
                  <Badge variant="default" className="font-mono">
                    {depositTotals.total.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Summary - Always show if payment method has any data */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-900">代付統計</h4>
              <div className="text-right">
                <span className="text-sm text-gray-600">成功率</span>
                <div className="font-mono font-medium text-green-900">
                  {withdrawalTotals.total > 0
                    ? `${(
                        (withdrawalTotals.success / withdrawalTotals.total) *
                        100
                      ).toFixed(2)}%`
                    : "無法計算"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">成功</span>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    {withdrawalTotals.success.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">處理中</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {withdrawalTotals.pending.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">失敗</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {withdrawalTotals.fail.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    總計
                  </span>
                  <Badge variant="default" className="font-mono">
                    {withdrawalTotals.total.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section: Channel Details */}
        <div className="space-y-4">
          {/* Deposit Channels */}
          {data.deposit.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">代收渠道詳情</h5>
              <div className="space-y-2">
                {data.deposit.map((item) => (
                  <ChannelDetailRow key={item.paymentChannel} data={item} />
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Channels */}
          {data.withdrawal.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">代付渠道詳情</h5>
              <div className="space-y-2">
                {data.withdrawal.map((item) => (
                  <ChannelDetailRow key={item.paymentChannel} data={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChannelDetailRowProps {
  data: StatisticsData;
}

function ChannelDetailRow({ data }: ChannelDetailRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">
          {PaymentChannelDisplayNames[data.paymentChannel] ||
            data.paymentChannel}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          <span className="text-sm font-mono">
            {data.success.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-mono">
            {data.pending.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircleIcon className="h-4 w-4 text-red-500" />
          <span className="text-sm font-mono">
            {data.fail.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium text-gray-700">總計:</span>
          <span className="text-sm font-mono font-medium">
            {data.total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
