import * as moment from "moment-timezone";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";
import {
  PHILIPPINES_TIMEZONE,
  convertToPhilippinesTimezone,
} from "@/lib/utils/timezone";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { formatNumber } from "@/lib/utils/number";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useTransactionStatisticsCounts } from "@/lib/hooks/swr/transaction";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { PaymentMethodCurrencyMapping } from "@/lib/constants/transaction";

// Color constants
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
  amountSum: number;
}

// Helper function to get payment method from payment channel
function getPaymentMethodFromChannel(
  paymentChannel: PaymentChannel,
  isDeposit: boolean
): PaymentMethod | null {
  const categories = isDeposit
    ? DepositPaymentChannelCategories
    : WithdrawalPaymentChannelCategories;

  for (const [method, channels] of Object.entries(categories)) {
    if (channels.includes(paymentChannel)) {
      return method as PaymentMethod;
    }
  }
  return null;
}

// Helper function to get currency from payment method
function getCurrencyForPaymentMethod(
  paymentMethod: PaymentMethod
): string | null {
  for (const [currency, paymentMethods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (paymentMethods.includes(paymentMethod)) {
      return currency;
    }
  }
  return null;
}

// Helper function to get currency from payment channel
function getCurrencyFromChannel(
  paymentChannel: PaymentChannel,
  isDeposit: boolean
): string | null {
  const paymentMethod = getPaymentMethodFromChannel(paymentChannel, isDeposit);
  if (!paymentMethod) return null;
  return getCurrencyForPaymentMethod(paymentMethod);
}

export function TransactionStatistics({
  organizationId,
}: TransactionStatisticsProps) {
  const { organization } = useOrganization({ organizationId });

  // Date range state
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).startOf("day").toDate();
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).endOf("day").toDate();
  });

  // Query state - auto query when organization is selected, manual query for date changes
  const [shouldQuery, setShouldQuery] = useState(false);

  // Auto-query when organization is selected
  const shouldAutoQuery = organizationId && !shouldQuery;

  // Quick time range functions
  const setToday = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("day").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("day").toDate());
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setLastHour = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "hour").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).toDate());
    setShouldQuery(true); // Auto query when quick selection is used
  };
  const setLastTwoHours = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).subtract(2, "hour").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).toDate());
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setYesterday = () => {
    setStartDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "day").startOf("day").toDate()
    );
    setEndDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "day").endOf("day").toDate()
    );
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setTheDayBeforeYesterday = () => {
    setStartDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(2, "day").startOf("day").toDate()
    );
    setEndDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(2, "day").endOf("day").toDate()
    );
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setThisWeek = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("week").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("week").toDate());
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setLastWeek = () => {
    setStartDate(
      moment
        .tz(PHILIPPINES_TIMEZONE)
        .subtract(1, "week")
        .startOf("week")
        .toDate()
    );
    setEndDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "week").endOf("week").toDate()
    );
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setThisMonth = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("month").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("month").toDate());
    setShouldQuery(true); // Auto query when quick selection is used
  };

  const setLastMonth = () => {
    setStartDate(
      moment
        .tz(PHILIPPINES_TIMEZONE)
        .subtract(1, "month")
        .startOf("month")
        .toDate()
    );
    setEndDate(
      moment
        .tz(PHILIPPINES_TIMEZONE)
        .subtract(1, "month")
        .endOf("month")
        .toDate()
    );

    setShouldQuery(true); // Auto query when quick selection is used
  };

  const handleQuery = () => {
    setShouldQuery(true);
  };

  // Reset query state when organization changes
  const prevOrganizationId = useRef(organizationId);
  useEffect(() => {
    if (prevOrganizationId.current !== organizationId) {
      setShouldQuery(false);
      prevOrganizationId.current = organizationId;
    }
  }, [organizationId]);

  // Get statistics data
  const { statistics, isLoading, isError } = useTransactionStatisticsCounts({
    merchantId:
      organization?.type === OrgType.ADMIN ? undefined : organizationId,
    startOfCreatedAt: startDate
      ? convertToPhilippinesTimezone(startDate.toISOString())
      : undefined,
    endOfCreatedAt: endDate
      ? convertToPhilippinesTimezone(endDate.toISOString())
      : undefined,
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

  // Group deposit and withdrawal data by currency
  const dataByCurrency = useMemo(() => {
    const depositByCurrency = new Map<
      string,
      {
        total: number;
        success: number;
        pending: number;
        fail: number;
        amountSum: number;
      }
    >();
    const withdrawalByCurrency = new Map<
      string,
      {
        total: number;
        success: number;
        pending: number;
        fail: number;
        amountSum: number;
      }
    >();

    processedData.deposit.forEach((item) => {
      const currency = getCurrencyFromChannel(item.paymentChannel, true);
      if (!currency) return;

      const current = depositByCurrency.get(currency) || {
        total: 0,
        success: 0,
        pending: 0,
        fail: 0,
        amountSum: 0,
      };

      depositByCurrency.set(currency, {
        total: current.total + item.total,
        success: current.success + item.success,
        pending: current.pending + item.pending,
        fail: current.fail + item.fail,
        amountSum: current.amountSum + item.amountSum,
      });
    });

    processedData.withdrawal.forEach((item) => {
      const currency = getCurrencyFromChannel(item.paymentChannel, false);
      if (!currency) return;

      const current = withdrawalByCurrency.get(currency) || {
        total: 0,
        success: 0,
        pending: 0,
        fail: 0,
        amountSum: 0,
      };

      withdrawalByCurrency.set(currency, {
        total: current.total + item.total,
        success: current.success + item.success,
        pending: current.pending + item.pending,
        fail: current.fail + item.fail,
        amountSum: current.amountSum + item.amountSum,
      });
    });

    // Get all currencies and sort them
    const allCurrencies = new Set([
      ...Array.from(depositByCurrency.keys()),
      ...Array.from(withdrawalByCurrency.keys()),
    ]);

    return {
      currencies: Array.from(allCurrencies).sort(),
      deposit: depositByCurrency,
      withdrawal: withdrawalByCurrency,
    };
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
            <div className="flex gap-4 items-center">
              <Label className="whitespace-nowrap">快速查詢</Label>
              <div className="flex items-center gap-2 flex-wrap">
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
                  onClick={setLastTwoHours}
                  className="text-xs"
                >
                  前兩小時
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
                  onClick={setTheDayBeforeYesterday}
                  className="text-xs"
                >
                  前天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setThisWeek}
                  className="text-xs"
                >
                  這週
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setLastWeek}
                  className="text-xs"
                >
                  上週
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setThisMonth}
                  className="text-xs"
                >
                  這個月
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
          {/* <div className="flex items-end flex-wrap">
            <Button onClick={handleQuery} className="w-[120px]">
              查詢
            </Button>
          </div> */}
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
          {/* Summary Section - Grouped by Currency */}
          <div className="flex flex-col gap-6">
            {/* Deposit Summary by Currency */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  總代收統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataByCurrency.currencies.filter((currency) =>
                  dataByCurrency.deposit.has(currency)
                ).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            幣種
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            總比數
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            成功
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            處理中
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            失敗
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            成功率
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            總金額
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dataByCurrency.currencies
                          .filter((currency) =>
                            dataByCurrency.deposit.has(currency)
                          )
                          .map((currency) => {
                            const data = dataByCurrency.deposit.get(currency)!;
                            const successRate =
                              data.total > 0
                                ? `${(
                                    (data.success / data.total) *
                                    100
                                  ).toFixed(2)}%`
                                : "None";
                            const currencySymbol = getCurrencySymbol(currency);
                            return (
                              <tr
                                key={`deposit-${currency}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {currencySymbol} {currency}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                                  {data.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-green-600 text-right whitespace-nowrap">
                                  {data.success.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-yellow-600 text-right whitespace-nowrap">
                                  {data.pending.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-red-600 text-right whitespace-nowrap">
                                  {data.fail.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                                  {successRate}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                                  {currencySymbol}{" "}
                                  {formatNumber(data.amountSum.toString())}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    無代收數據
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal Summary by Currency */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  總代付統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataByCurrency.currencies.filter((currency) =>
                  dataByCurrency.withdrawal.has(currency)
                ).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            幣種
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            總比數
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            成功
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            處理中
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            失敗
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            成功率
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            總金額
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dataByCurrency.currencies
                          .filter((currency) =>
                            dataByCurrency.withdrawal.has(currency)
                          )
                          .map((currency) => {
                            const data =
                              dataByCurrency.withdrawal.get(currency)!;
                            const successRate =
                              data.total > 0
                                ? `${(
                                    (data.success / data.total) *
                                    100
                                  ).toFixed(2)}%`
                                : "None";
                            const currencySymbol = getCurrencySymbol(currency);
                            return (
                              <tr
                                key={`withdrawal-${currency}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {currencySymbol} {currency}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                                  {data.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-green-600 text-right whitespace-nowrap">
                                  {data.success.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-yellow-600 text-right whitespace-nowrap">
                                  {data.pending.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-red-600 text-right whitespace-nowrap">
                                  {data.fail.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                                  {successRate}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                                  {currencySymbol}
                                  {formatNumber(data.amountSum.toString())}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    無代付數據
                  </div>
                )}
              </CardContent>
            </Card>
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
  data: {
    total: number;
    success: number;
    pending: number;
    fail: number;
    amountSum: number;
  };
  color: "blue" | "green";
  currency?: string;
}

function SummaryCard({
  title,
  data,
  color,
  currency = "PHP",
}: SummaryCardProps) {
  const successRate =
    data.total > 0
      ? `${((data.success / data.total) * 100).toFixed(2)}%`
      : "None";

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <Card className="hover:shadow-sm transition-shadow border border-gray-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Key Metrics - 重點強調的三個指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 總比數 */}
          <div className="text-center p-3 border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">總比數</div>
            <div className="text-xl font-bold text-gray-900">
              {data.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">筆交易</div>
          </div>

          {/* 成功率 */}
          <div className="text-center p-3 border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">成功率</div>
            <div className="text-xl font-bold text-gray-900">{successRate}</div>
            <div className="text-xs text-gray-500 mt-1">
              {data.success} / {data.total}
            </div>
          </div>
        </div>

        {/* 總金額 - 獨立行 */}
        <div className="mb-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-xs text-gray-600 mb-1">總金額</div>
            <div className="text-2xl font-bold text-gray-900">
              {currencySymbol}
              {formatNumber(data.amountSum.toString())}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-xs text-green-600">成功</span>
              <span className="text-sm font-medium text-green-700">
                {data.success.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-yellow-600">處理中</span>
              <span className="text-sm font-medium text-yellow-700">
                {data.pending.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-xs text-red-600">失敗</span>
              <span className="text-sm font-medium text-red-700">
                {data.fail.toLocaleString()}
              </span>
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
  // Get currency for this payment method
  const currency = getCurrencyForPaymentMethod(paymentMethod) || "PHP";
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate totals for deposit and withdrawal
  const depositTotals = data.deposit.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      success: acc.success + item.success,
      pending: acc.pending + item.pending,
      fail: acc.fail + item.fail,
      amountSum: acc.amountSum + item.amountSum,
    }),
    { total: 0, success: 0, pending: 0, fail: 0, amountSum: 0 }
  );

  const withdrawalTotals = data.withdrawal.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      success: acc.success + item.success,
      pending: acc.pending + item.pending,
      fail: acc.fail + item.fail,
      amountSum: acc.amountSum + item.amountSum,
    }),
    { total: 0, success: 0, pending: 0, fail: 0, amountSum: 0 }
  );

  return (
    <Card className="hover:shadow-sm transition-shadow border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          {PaymentMethodDisplayNames[paymentMethod]}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        {/* Upper Section: Deposit and Withdrawal Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Deposit Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900">代收統計</h4>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* 總比數 */}
              <div className="text-center p-2 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">總比數</div>
                <div className="text-lg font-bold text-gray-900">
                  {depositTotals.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">筆交易</div>
              </div>

              {/* 成功率 */}
              <div className="text-center p-2 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">成功率</div>
                <div className="text-lg font-bold text-gray-900">
                  {depositTotals.total > 0
                    ? `${(
                        (depositTotals.success / depositTotals.total) *
                        100
                      ).toFixed(2)}%`
                    : "None"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {depositTotals.success} / {depositTotals.total}
                </div>
              </div>
            </div>

            {/* 總金額 - 獨立行 */}
            <div className="mb-4">
              <div className="text-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">總金額</div>
                <div className="text-xl font-bold text-gray-900">
                  {currencySymbol}
                  {formatNumber(depositTotals.amountSum.toString())}
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-green-600">成功</span>
                  <span className="text-xs font-medium text-green-700">
                    {depositTotals.success.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600">處理中</span>
                  <span className="text-xs font-medium text-yellow-700">
                    {depositTotals.pending.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-xs text-red-600">失敗</span>
                  <span className="text-xs font-medium text-red-700">
                    {depositTotals.fail.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900">代付統計</h4>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* 總比數 */}
              <div className="text-center p-2 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">總比數</div>
                <div className="text-lg font-bold text-gray-900">
                  {withdrawalTotals.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">筆交易</div>
              </div>

              {/* 成功率 */}
              <div className="text-center p-2 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">成功率</div>
                <div className="text-lg font-bold text-gray-900">
                  {withdrawalTotals.total > 0
                    ? `${(
                        (withdrawalTotals.success / withdrawalTotals.total) *
                        100
                      ).toFixed(2)}%`
                    : "None"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {withdrawalTotals.success} / {withdrawalTotals.total}
                </div>
              </div>
            </div>

            {/* 總金額 - 獨立行 */}
            <div className="mb-4">
              <div className="text-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">總金額</div>
                <div className="text-xl font-bold text-gray-900">
                  {currencySymbol}
                  {formatNumber(withdrawalTotals.amountSum.toString())}
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-green-600">成功</span>
                  <span className="text-xs font-medium text-green-700">
                    {withdrawalTotals.success.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600">處理中</span>
                  <span className="text-xs font-medium text-yellow-700">
                    {withdrawalTotals.pending.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-xs text-red-600">失敗</span>
                  <span className="text-xs font-medium text-red-700">
                    {withdrawalTotals.fail.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section: Channel Details */}
        <div className="space-y-6">
          {/* Deposit Channels */}
          {data.deposit.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-lg font-semibold text-gray-900">
                  代收上游詳情
                </h5>
              </div>
              <div className="space-y-3">
                {data.deposit.map((item) => (
                  <ChannelDetailRow
                    key={item.paymentChannel}
                    data={item}
                    currency={currency}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Channels */}
          {data.withdrawal.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-lg font-semibold text-gray-900">
                  代付上游詳情
                </h5>
              </div>
              <div className="space-y-3">
                {data.withdrawal.map((item) => (
                  <ChannelDetailRow
                    key={item.paymentChannel}
                    data={item}
                    currency={currency}
                  />
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
  currency: string;
}

function ChannelDetailRow({ data, currency }: ChannelDetailRowProps) {
  const successRate =
    data.total > 0
      ? `${((data.success / data.total) * 100).toFixed(2)}%`
      : "None";

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow flex-wrap">
      {/* Channel Name */}
      <div className="flex">
        <div className="text-sm font-semibold text-gray-900">
          {PaymentChannelDisplayNames[data.paymentChannel] ||
            data.paymentChannel}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="flex items-center gap-3 mx-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <span className="text-xs text-gray-600">總比數</span>
          <span className="text-xs font-medium text-gray-900">
            {data.total.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span className="text-xs text-green-600">成功</span>
          <span className="text-xs font-medium text-green-700">
            {data.success.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-yellow-600">處理中</span>
          <span className="text-xs font-medium text-yellow-700">
            {data.pending.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          <span className="text-xs text-red-600">失敗</span>
          <span className="text-xs font-medium text-red-700">
            {data.fail.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="text-center min-w-[140px] mx-2">
        <div className="text-xs text-gray-600">總金額</div>
        <div
          className="text-sm font-bold text-gray-900 truncate"
          title={`${currencySymbol}${formatNumber(data.amountSum.toString())}`}
        >
          {currencySymbol}
          {formatNumber(data.amountSum.toString())}
        </div>
      </div>

      {/* Success Rate */}
      <div className="text-center min-w-[80px]">
        <div className="text-xs text-gray-600">成功率</div>
        <div className="text-sm font-bold text-gray-900">{successRate}</div>
      </div>
    </div>
  );
}
