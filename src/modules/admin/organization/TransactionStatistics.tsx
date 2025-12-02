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
  PauseIcon,
  PlayIcon,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { formatNumber } from "@/lib/utils/number";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useTransactionStatisticsCounts } from "@/lib/hooks/swr/transaction";

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

type PeriodType =
  | "1min"
  | "3min"
  | "5min"
  | "10min"
  | "20min"
  | "30min"
  | "60min"
  | "today"
  | "yesterday"
  | "past7days"
  | "thismonth"
  | "lastmonth"
  | "last2hours"
  | "last6hours"
  | "last12hours"
  | "last2days"
  | "last3days"
  | "lastweek"
  | "thisweek"
  | "custom";

type UpdateInterval = "5s" | "10s" | "30s" | "1min";

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

  // Auto-update state
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(false);
  const [isAutoUpdatePaused, setIsAutoUpdatePaused] = useState(false);
  const [updateInterval, setUpdateInterval] = useState<UpdateInterval>("10s");
  const [selectedPeriodType, setSelectedPeriodType] =
    useState<PeriodType>("custom");
  const [periodDropdownValue, setPeriodDropdownValue] = useState<string>("");
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);
  const [updateTimeDisplay, setUpdateTimeDisplay] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoUpdatingRef = useRef(false);
  const previousStatisticsRef = useRef<any>(null);
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Helper function to set period and update state
  const setPeriod = (periodType: PeriodType) => {
    setSelectedPeriodType(periodType);
    setShouldQuery(true);
  };

  // Quick time range functions - relative periods (update with auto-update)
  const set1Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(1, "minute").toDate());
    setEndDate(now.toDate());
    setPeriod("1min");
  };

  const set3Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(3, "minutes").toDate());
    setEndDate(now.toDate());
    setPeriod("3min");
  };

  const set5Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(5, "minutes").toDate());
    setEndDate(now.toDate());
    setPeriod("5min");
  };

  const set10Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(10, "minutes").toDate());
    setEndDate(now.toDate());
    setPeriod("10min");
  };

  const set20Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(20, "minutes").toDate());
    setEndDate(now.toDate());
    setPeriod("20min");
  };

  const set30Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(30, "minutes").toDate());
    setEndDate(now.toDate());
    setPeriod("30min");
  };

  const set60Min = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(1, "hour").toDate());
    setEndDate(now.toDate());
    setPeriod("60min");
  };

  // Fixed periods (don't update with auto-update, just refresh data)
  const setToday = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("day").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("day").toDate());
    setPeriod("today");
  };

  const setYesterday = () => {
    setStartDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "day").startOf("day").toDate()
    );
    setEndDate(
      moment.tz(PHILIPPINES_TIMEZONE).subtract(1, "day").endOf("day").toDate()
    );
    setPeriod("yesterday");
  };

  const setPast7Days = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(7, "days").startOf("day").toDate());
    setEndDate(now.clone().endOf("day").toDate());
    setPeriod("past7days");
  };

  const setThisMonth = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("month").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("month").toDate());
    setPeriod("thismonth");
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
    setPeriod("lastmonth");
  };

  // Additional periods for dropdown
  const setLast2Hours = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(2, "hours").toDate());
    setEndDate(now.toDate());
    setPeriod("last2hours");
  };

  const setLast6Hours = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(6, "hours").toDate());
    setEndDate(now.toDate());
    setPeriod("last6hours");
  };

  const setLast12Hours = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(12, "hours").toDate());
    setEndDate(now.toDate());
    setPeriod("last12hours");
  };

  const setLast2Days = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(2, "days").startOf("day").toDate());
    setEndDate(now.clone().endOf("day").toDate());
    setPeriod("last2days");
  };

  const setLast3Days = () => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    setStartDate(now.clone().subtract(3, "days").startOf("day").toDate());
    setEndDate(now.clone().endOf("day").toDate());
    setPeriod("last3days");
  };

  const setThisWeek = () => {
    setStartDate(moment.tz(PHILIPPINES_TIMEZONE).startOf("week").toDate());
    setEndDate(moment.tz(PHILIPPINES_TIMEZONE).endOf("week").toDate());
    setPeriod("thisweek");
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
    setPeriod("lastweek");
  };

  const handleQuery = () => {
    setShouldQuery(true);
  };

  // Get statistics data (must be before useEffect that uses mutate)
  const { statistics, isLoading, isError, mutate } =
    useTransactionStatisticsCounts({
      merchantId:
        organization?.type === OrgType.ADMIN ? undefined : organizationId,
      startOfCreatedAt: startDate
        ? convertToPhilippinesTimezone(startDate.toISOString())
        : undefined,
      endOfCreatedAt: endDate
        ? convertToPhilippinesTimezone(endDate.toISOString())
        : undefined,
    });

  // Track when statistics actually update (for auto-update timing)
  const statisticsUpdateTimeRef = useRef<number | null>(null);
  const statisticsUpdateCounterRef = useRef<number>(0);

  // Keep previous statistics during auto-updates to prevent glitches
  useEffect(() => {
    if (statistics) {
      previousStatisticsRef.current = statistics;
      // Update last updated time when new data arrives
      setLastUpdatedTime(new Date());
      // Track when statistics actually updated (use counter to ensure we detect updates even if timestamp is same)
      statisticsUpdateTimeRef.current = Date.now();
      statisticsUpdateCounterRef.current += 1;
    }
  }, [statistics]);

  // Update the display time every second
  useEffect(() => {
    if (!lastUpdatedTime) {
      setUpdateTimeDisplay("");
      return;
    }

    const updateDisplay = () => {
      const now = moment.tz(PHILIPPINES_TIMEZONE);
      const diff = now.diff(moment.tz(lastUpdatedTime, PHILIPPINES_TIMEZONE));
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 60) {
        setUpdateTimeDisplay(`${seconds} 秒前`);
      } else if (minutes < 60) {
        setUpdateTimeDisplay(`${minutes} 分鐘前`);
      } else {
        const hours = Math.floor(minutes / 60);
        setUpdateTimeDisplay(`${hours} 小時前`);
      }
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  // Use previous data during auto-updates if current is loading
  const displayStatistics =
    isAutoUpdatingRef.current && isLoading && previousStatisticsRef.current
      ? previousStatisticsRef.current
      : statistics;

  // Determine if we should show loading (only show during initial load or manual updates, not auto-updates)
  const shouldShowLoading = isLoading && !isAutoUpdatingRef.current;

  // Function to recalculate dates for relative periods
  const recalculateRelativePeriod = useCallback((periodType: PeriodType) => {
    const now = moment.tz(PHILIPPINES_TIMEZONE);
    switch (periodType) {
      case "1min":
        setStartDate(now.clone().subtract(1, "minute").toDate());
        setEndDate(now.toDate());
        break;
      case "3min":
        setStartDate(now.clone().subtract(3, "minutes").toDate());
        setEndDate(now.toDate());
        break;
      case "5min":
        setStartDate(now.clone().subtract(5, "minutes").toDate());
        setEndDate(now.toDate());
        break;
      case "10min":
        setStartDate(now.clone().subtract(10, "minutes").toDate());
        setEndDate(now.toDate());
        break;
      case "20min":
        setStartDate(now.clone().subtract(20, "minutes").toDate());
        setEndDate(now.toDate());
        break;
      case "30min":
        setStartDate(now.clone().subtract(30, "minutes").toDate());
        setEndDate(now.toDate());
        break;
      case "60min":
        setStartDate(now.clone().subtract(1, "hour").toDate());
        setEndDate(now.toDate());
        break;
      case "last2hours":
        setStartDate(now.clone().subtract(2, "hours").toDate());
        setEndDate(now.toDate());
        break;
      case "last6hours":
        setStartDate(now.clone().subtract(6, "hours").toDate());
        setEndDate(now.toDate());
        break;
      case "last12hours":
        setStartDate(now.clone().subtract(12, "hours").toDate());
        setEndDate(now.toDate());
        break;
      case "last2days":
        setStartDate(now.clone().subtract(2, "days").startOf("day").toDate());
        setEndDate(now.clone().endOf("day").toDate());
        break;
      case "last3days":
        setStartDate(now.clone().subtract(3, "days").startOf("day").toDate());
        setEndDate(now.clone().endOf("day").toDate());
        break;
      case "past7days":
        setStartDate(now.clone().subtract(7, "days").startOf("day").toDate());
        setEndDate(now.clone().endOf("day").toDate());
        break;
      case "today":
        setStartDate(now.clone().startOf("day").toDate());
        setEndDate(now.clone().endOf("day").toDate());
        break;
      default:
        // For fixed periods like yesterday, this month, last month, etc., don't recalculate
        break;
    }
  }, []);

  // Helper function to clear all active timeouts
  const clearAllTimeouts = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    activeTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    activeTimeoutsRef.current.clear();
  };

  // Auto-update effect - uses recursive setTimeout to wait for API response before next update
  useEffect(() => {
    // Clear all existing timeouts
    clearAllTimeouts();

    // Set up recursive update if auto-update is enabled and not paused
    if (isAutoUpdateEnabled && !isAutoUpdatePaused && organizationId) {
      const getIntervalMs = (interval: UpdateInterval): number => {
        switch (interval) {
          case "5s":
            return 5000;
          case "10s":
            return 10000;
          case "30s":
            return 30000;
          case "1min":
            return 60000;
          default:
            return 10000;
        }
      };

      // Recursive function that waits for API response before scheduling next update
      const scheduleNextUpdate = () => {
        // Check current state values (not closure values) to ensure we have latest
        // This is important because the effect might not re-run immediately when state changes
        if (!isAutoUpdateEnabled || isAutoUpdatePaused || !organizationId) {
          return;
        }

        const currentIntervalMs = getIntervalMs(updateInterval);

        // Mark that we're auto-updating
        isAutoUpdatingRef.current = true;

        // Recalculate dates for relative periods
        const relativePeriods: PeriodType[] = [
          "1min",
          "3min",
          "5min",
          "10min",
          "20min",
          "30min",
          "60min",
          "last2hours",
          "last6hours",
          "last12hours",
          "last2days",
          "last3days",
          "past7days",
          "today",
        ];

        if (relativePeriods.includes(selectedPeriodType)) {
          recalculateRelativePeriod(selectedPeriodType);
        }

        // Record the current update counter BEFORE making the API call
        // This way we can detect when new data arrives (counter will increment)
        const updateCounterBeforeCall = statisticsUpdateCounterRef.current;

        // Refresh data and schedule next update after API response completes AND data is updated
        mutate(undefined, { revalidate: true })
          .then(() => {
            // Wait for statistics to actually update (poll every 50ms, max wait 5 seconds)
            const waitForStatisticsUpdate = (
              attempts: number = 0,
              maxAttempts: number = 100
            ) => {
              // Check if auto-update is still enabled and not paused before proceeding
              if (
                !isAutoUpdateEnabled ||
                isAutoUpdatePaused ||
                !organizationId
              ) {
                isAutoUpdatingRef.current = false;
                return;
              }

              // Check if statistics have been updated (counter should have increased)
              const currentUpdateCounter = statisticsUpdateCounterRef.current;
              const currentUpdateTime = statisticsUpdateTimeRef.current;

              if (
                currentUpdateCounter > updateCounterBeforeCall &&
                currentUpdateTime
              ) {
                // Statistics have been updated!
                // Now wait the FULL interval from the moment data was updated
                const dataUpdatedTime = currentUpdateTime;
                const now = Date.now();
                const timeSinceUpdate = now - dataUpdatedTime;

                isAutoUpdatingRef.current = false;

                // Double-check state before scheduling next update
                if (
                  isAutoUpdateEnabled &&
                  !isAutoUpdatePaused &&
                  organizationId
                ) {
                  const nextIntervalMs = getIntervalMs(updateInterval);

                  // Calculate remaining wait time
                  // If some time has already passed since data update, subtract it
                  // This ensures we always wait the full interval from when data was updated
                  const remainingWaitTime = Math.max(
                    0,
                    nextIntervalMs - timeSinceUpdate
                  );

                  intervalRef.current = setTimeout(
                    scheduleNextUpdate,
                    remainingWaitTime
                  );
                }
              } else if (attempts < maxAttempts) {
                // Statistics not updated yet, check again in 50ms
                // But first check if we should still continue
                if (
                  isAutoUpdateEnabled &&
                  !isAutoUpdatePaused &&
                  organizationId
                ) {
                  const timeoutId = setTimeout(
                    () => waitForStatisticsUpdate(attempts + 1, maxAttempts),
                    50
                  );
                  activeTimeoutsRef.current.add(timeoutId);
                } else {
                  isAutoUpdatingRef.current = false;
                }
              } else {
                // Timeout - proceed anyway (statistics might not have changed or update was missed)
                // In this case, wait the full interval from now
                isAutoUpdatingRef.current = false;

                // Double-check state before scheduling next update
                if (
                  isAutoUpdateEnabled &&
                  !isAutoUpdatePaused &&
                  organizationId
                ) {
                  const nextIntervalMs = getIntervalMs(updateInterval);
                  intervalRef.current = setTimeout(
                    scheduleNextUpdate,
                    nextIntervalMs
                  );
                }
              }
            };

            // Start checking for statistics update immediately
            waitForStatisticsUpdate();
          })
          .catch(() => {
            // Even on error, schedule next update after full interval
            isAutoUpdatingRef.current = false;
            // Double-check state before scheduling next update
            if (isAutoUpdateEnabled && !isAutoUpdatePaused && organizationId) {
              const nextIntervalMs = getIntervalMs(updateInterval);
              intervalRef.current = setTimeout(
                scheduleNextUpdate,
                nextIntervalMs
              );
            }
          });
      };

      // Start the first update immediately, then it will schedule itself recursively
      scheduleNextUpdate();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      clearAllTimeouts();
    };
  }, [
    isAutoUpdateEnabled,
    isAutoUpdatePaused,
    updateInterval,
    selectedPeriodType,
    organizationId,
    mutate,
    recalculateRelativePeriod,
  ]);

  // Reset query state when organization changes
  const prevOrganizationId = useRef(organizationId);
  useEffect(() => {
    if (prevOrganizationId.current !== organizationId) {
      setShouldQuery(false);
      setIsAutoUpdateEnabled(false);
      setIsAutoUpdatePaused(false);
      isAutoUpdatingRef.current = false;
      setLastUpdatedTime(null);
      prevOrganizationId.current = organizationId;
    }
  }, [organizationId]);

  // Handle manual date changes - pause auto-update
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    isAutoUpdatingRef.current = false; // Reset flag for manual changes
    if (isAutoUpdateEnabled) {
      setIsAutoUpdatePaused(true);
      setSelectedPeriodType("custom");
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    isAutoUpdatingRef.current = false; // Reset flag for manual changes
    if (isAutoUpdateEnabled) {
      setIsAutoUpdatePaused(true);
      setSelectedPeriodType("custom");
    }
  };

  // Process statistics data
  const processedData = useMemo(() => {
    if (!displayStatistics?.data) return { deposit: [], withdrawal: [] };

    const depositData: StatisticsData[] = [];
    const withdrawalData: StatisticsData[] = [];

    displayStatistics.data.forEach((item: StatisticsData) => {
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
  }, [displayStatistics]);

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    const deposit = processedData.deposit.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        success: acc.success + item.success,
        pending: acc.pending + item.pending,
        fail: acc.fail + item.fail,
        amountSum: acc.amountSum + item.amountSum,
      }),
      { total: 0, success: 0, pending: 0, fail: 0, amountSum: 0 }
    );

    const withdrawal = processedData.withdrawal.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        success: acc.success + item.success,
        pending: acc.pending + item.pending,
        fail: acc.fail + item.fail,
        amountSum: acc.amountSum + item.amountSum,
      }),
      { total: 0, success: 0, pending: 0, fail: 0, amountSum: 0 }
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
    > = {} as Record<
      PaymentMethod,
      {
        deposit: StatisticsData[];
        withdrawal: StatisticsData[];
      }
    >;

    // Initialize each payment method with empty arrays
    Object.values(PaymentMethod).forEach((method) => {
      result[method] = { deposit: [], withdrawal: [] };
    });

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
        <div className="flex flex-col gap-4">
          {/* Auto-update controls */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <Button
              variant={isAutoUpdateEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsAutoUpdateEnabled(!isAutoUpdateEnabled);
                setIsAutoUpdatePaused(false);
              }}
              className={`text-sm ${
                isAutoUpdateEnabled
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              自動更新
            </Button>
            {isAutoUpdateEnabled && (
              <>
                <Label className="whitespace-nowrap text-sm">更新間隔</Label>
                <Select
                  value={updateInterval}
                  onValueChange={(value) =>
                    setUpdateInterval(value as UpdateInterval)
                  }
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5s">5秒</SelectItem>
                    <SelectItem value="10s">10秒</SelectItem>
                    <SelectItem value="30s">30秒</SelectItem>
                    <SelectItem value="1min">1分鐘</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoUpdatePaused(!isAutoUpdatePaused)}
                  className="text-sm"
                >
                  {isAutoUpdatePaused ? (
                    <>
                      <PlayIcon className="h-4 w-4 mr-1" />
                      繼續
                    </>
                  ) : (
                    <>
                      <PauseIcon className="h-4 w-4 mr-1" />
                      暫停
                    </>
                  )}
                </Button>
                {updateTimeDisplay && !isAutoUpdatePaused && (
                  <div className="text-sm text-gray-500 ml-2">
                    已更新 {updateTimeDisplay}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date range inputs */}
          <div className="flex-1">
            <Label className="text-lg font-semibold block mb-4">時間範圍</Label>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">開始時間</Label>
                <div className="w-fit min-w-[240px]">
                  <DateTimePicker
                    date={startDate}
                    setDate={handleStartDateChange}
                    placeholder="yyyy/mm/dd HH:mm:ss"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">結束時間</Label>
                <div className="w-fit min-w-[240px]">
                  <DateTimePicker
                    date={endDate}
                    setDate={handleEndDateChange}
                    placeholder="yyyy/mm/dd HH:mm:ss"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <Label className="whitespace-nowrap">快速查詢</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={
                    selectedPeriodType === "1min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set1Min}
                  className="text-xs"
                >
                  1分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "3min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set3Min}
                  className="text-xs"
                >
                  3分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "5min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set5Min}
                  className="text-xs"
                >
                  5分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "10min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set10Min}
                  className="text-xs"
                >
                  10分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "20min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set20Min}
                  className="text-xs"
                >
                  20分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "30min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set30Min}
                  className="text-xs"
                >
                  30分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "60min" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={set60Min}
                  className="text-xs"
                >
                  60分鐘
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "today" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={setToday}
                  className="text-xs"
                >
                  今天
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "yesterday" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={setYesterday}
                  className="text-xs"
                >
                  昨天
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "past7days" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={setPast7Days}
                  className="text-xs"
                >
                  過去7天
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "thismonth" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={setThisMonth}
                  className="text-xs"
                >
                  這個月
                </Button>
                <Button
                  variant={
                    selectedPeriodType === "lastmonth" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={setLastMonth}
                  className="text-xs"
                >
                  上個月
                </Button>
              </div>
              <Select
                value={periodDropdownValue}
                onValueChange={(value) => {
                  setPeriodDropdownValue("");
                  switch (value) {
                    case "last2hours":
                      setLast2Hours();
                      break;
                    case "last6hours":
                      setLast6Hours();
                      break;
                    case "last12hours":
                      setLast12Hours();
                      break;
                    case "last2days":
                      setLast2Days();
                      break;
                    case "last3days":
                      setLast3Days();
                      break;
                    case "thisweek":
                      setThisWeek();
                      break;
                    case "lastweek":
                      setLastWeek();
                      break;
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="其他期間" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last2hours">前2小時</SelectItem>
                  <SelectItem value="last6hours">前6小時</SelectItem>
                  <SelectItem value="last12hours">前12小時</SelectItem>
                  <SelectItem value="last2days">過去2天</SelectItem>
                  <SelectItem value="last3days">過去3天</SelectItem>
                  <SelectItem value="thisweek">這週</SelectItem>
                  <SelectItem value="lastweek">上週</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State - only show during initial load or manual updates */}
      {shouldShowLoading && (
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
      {!shouldShowLoading && !isError && displayStatistics && (
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
  data: {
    total: number;
    success: number;
    pending: number;
    fail: number;
    amountSum: number;
  };
  color: "blue" | "green";
}

function SummaryCard({ title, data, color }: SummaryCardProps) {
  const successRate =
    data.total > 0
      ? `${((data.success / data.total) * 100).toFixed(2)}%`
      : "None";

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
              ₱{formatNumber(data.amountSum.toString())}
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
                  ₱{formatNumber(depositTotals.amountSum.toString())}
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
                  ₱{formatNumber(withdrawalTotals.amountSum.toString())}
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
                  代收渠道詳情
                </h5>
              </div>
              <div className="space-y-3">
                {data.deposit.map((item) => (
                  <ChannelDetailRow key={item.paymentChannel} data={item} />
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Channels */}
          {data.withdrawal.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-lg font-semibold text-gray-900">
                  代付渠道詳情
                </h5>
              </div>
              <div className="space-y-3">
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
  const successRate =
    data.total > 0
      ? `${((data.success / data.total) * 100).toFixed(2)}%`
      : "None";

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
          title={`₱${formatNumber(data.amountSum.toString())}`}
        >
          ₱{formatNumber(data.amountSum.toString())}
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
