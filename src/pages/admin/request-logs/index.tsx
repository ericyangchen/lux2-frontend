import {
  ApiGetRequestLogs,
  ApiGetRequestLogsFilterOptions,
  ApiGetRequestLogsOverview,
  ApiGetRequestLogsStats,
  FilterOptions,
  GetRequestLogsParams,
  GetRequestLogsStatsParams,
  OverviewStats,
  RequestLog,
  RequestLogStats,
} from "@/lib/apis/request-logs/request-logs.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PHILIPPINES_TIMEZONE,
  convertToEndOfDay,
  convertToPhilippinesTimezone,
  convertToStartOfDay,
} from "@/lib/utils/timezone";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApplicationError } from "@/lib/error/applicationError";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { getApplicationCookies } from "@/lib/utils/cookie";
import moment from "moment-timezone";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";

export default function RequestLogsPage() {
  useAuthGuard();

  // Filter states
  const [filters, setFilters] = useState<GetRequestLogsParams>({
    limit: 50,
    offset: 0,
  });

  const [statsFilters, setStatsFilters] = useState<GetRequestLogsStatsParams>({
    createdAtStart: moment()
      .tz(PHILIPPINES_TIMEZONE)
      .startOf("day")
      .toISOString(),
    createdAtEnd: moment().tz(PHILIPPINES_TIMEZONE).endOf("day").toISOString(),
    timeScale: "1m",
  });

  const [activeTab, setActiveTab] = useState<"logs" | "stats">("stats");

  // Data states
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [logsData, setLogsData] = useState<{
    data: RequestLog[];
    total: number;
    pagination: any;
  } | null>(null);
  const [statsData, setStatsData] = useState<{
    data: RequestLogStats[];
  } | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Data fetching functions
  const fetchFilterOptions = useCallback(async () => {
    const { accessToken } = getApplicationCookies();
    if (!accessToken) return;

    try {
      const response = await ApiGetRequestLogsFilterOptions(accessToken);
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    const { accessToken } = getApplicationCookies();
    if (!accessToken) return;

    try {
      const response = await ApiGetRequestLogsOverview(accessToken);
      if (response.ok) {
        const data = await response.json();
        setOverview(data);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (activeTab !== "logs") return;

    const { accessToken } = getApplicationCookies();
    if (!accessToken) return;

    setLogsLoading(true);
    try {
      // Convert times to Philippines timezone before sending to API
      const convertedFilters = {
        ...filters,
        createdAtStart: filters.createdAtStart
          ? convertToPhilippinesTimezone(filters.createdAtStart)
          : undefined,
        createdAtEnd: filters.createdAtEnd
          ? convertToPhilippinesTimezone(filters.createdAtEnd)
          : undefined,
      };

      const response = await ApiGetRequestLogs({
        ...convertedFilters,
        accessToken,
      });
      if (response.ok) {
        const data = await response.json();
        setLogsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLogsLoading(false);
    }
  }, [filters, activeTab]);

  const fetchStats = useCallback(async () => {
    if (activeTab !== "stats") return;

    const { accessToken } = getApplicationCookies();
    if (!accessToken) return;

    setStatsLoading(true);
    try {
      // Convert times to Philippines timezone before sending to API
      const convertedFilters = {
        ...statsFilters,
        createdAtStart: convertToPhilippinesTimezone(
          statsFilters.createdAtStart
        ),
        createdAtEnd: convertToPhilippinesTimezone(statsFilters.createdAtEnd),
      };

      const response = await ApiGetRequestLogsStats({
        ...convertedFilters,
        accessToken,
      });
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [statsFilters, activeTab]);

  // Chart data with complete time series
  const chartData = useMemo(() => {
    if (!statsData?.data) return [];

    const startTime = moment(statsFilters.createdAtStart).tz(
      PHILIPPINES_TIMEZONE
    );
    const endTime = moment(statsFilters.createdAtEnd).tz(PHILIPPINES_TIMEZONE);
    const timeScale = statsFilters.timeScale;

    // Calculate duration to determine appropriate display strategy
    const durationInHours = endTime.diff(startTime, "hours");
    const durationInDays = endTime.diff(startTime, "days");

    // For multi-day ranges, we need to ensure we show the full timeframe
    // even when using smaller time scales
    let displayInterval: moment.unitOfTime.DurationConstructor;
    let displayAmount: number;
    let formatString: string;
    let alignStart: moment.Moment;

    // Determine the best display strategy based on time range and scale
    // Always use the selected time scale - don't aggregate unless absolutely necessary
    switch (timeScale) {
      case "1s":
        displayInterval = "seconds";
        displayAmount = 1;
        formatString = durationInDays > 1 ? "MM/DD HH:mm:ss" : "HH:mm:ss";
        alignStart = startTime.clone().startOf("second");
        break;
      case "30s":
        displayInterval = "seconds";
        displayAmount = 30;
        formatString = durationInDays > 1 ? "MM/DD HH:mm:ss" : "HH:mm:ss";
        alignStart = startTime.clone().startOf("minute");
        break;
      case "1m":
        displayInterval = "minutes";
        displayAmount = 1;
        formatString = durationInDays > 1 ? "MM/DD HH:mm" : "HH:mm";
        alignStart = startTime.clone().startOf("minute");
        break;
      case "10m":
        displayInterval = "minutes";
        displayAmount = 10;
        formatString = durationInDays > 1 ? "MM/DD HH:mm" : "HH:mm";
        alignStart = startTime.clone().startOf("hour");
        break;
      case "1h":
        displayInterval = "hours";
        displayAmount = 1;
        formatString = durationInDays > 1 ? "MM/DD HH:mm" : "HH:mm";
        alignStart = startTime.clone().startOf("hour");
        break;
      default:
        displayInterval = "minutes";
        displayAmount = 1;
        formatString = durationInDays > 1 ? "MM/DD HH:mm" : "HH:mm";
        alignStart = startTime.clone().startOf("minute");
    }

    // Create a map of existing data for aggregation
    const dataMap = new Map<
      string,
      { totalResponseTime: number; count: number; avgResponseTime: number }
    >();

    statsData.data.forEach((item) => {
      const itemTime = moment(item.timestamp).tz(PHILIPPINES_TIMEZONE);

      // Normalize to display intervals based on the selected time scale
      let normalizedTime: moment.Moment;
      switch (timeScale) {
        case "1s":
          normalizedTime = itemTime.clone().startOf("second");
          break;
        case "30s":
          normalizedTime = itemTime
            .clone()
            .startOf("minute")
            .add(Math.floor(itemTime.second() / 30) * 30, "seconds");
          break;
        case "1m":
          normalizedTime = itemTime.clone().startOf("minute");
          break;
        case "10m":
          normalizedTime = itemTime
            .clone()
            .startOf("hour")
            .add(Math.floor(itemTime.minute() / 10) * 10, "minutes");
          break;
        case "1h":
          normalizedTime = itemTime.clone().startOf("hour");
          break;
        default:
          normalizedTime = itemTime.clone().startOf("minute");
      }

      const key = normalizedTime.toISOString();
      const existing = dataMap.get(key);

      if (existing) {
        // Aggregate data for the same time slot
        const newCount = existing.count + item.count;
        const newTotalResponseTime =
          existing.totalResponseTime + item.avgResponseTimeSec * item.count;
        dataMap.set(key, {
          totalResponseTime: newTotalResponseTime,
          count: newCount,
          avgResponseTime: newTotalResponseTime / newCount,
        });
      } else {
        dataMap.set(key, {
          totalResponseTime: item.avgResponseTimeSec * item.count,
          count: item.count,
          avgResponseTime: item.avgResponseTimeSec,
        });
      }
    });

    // Generate complete time series
    const completeTimeSeries: Array<{
      timestamp: string;
      avgResponseTime: number;
      count: number;
    }> = [];

    let currentTime = alignStart.clone();

    // Limit data points to prevent performance issues
    let maxPoints: number;
    if (timeScale === "1s") {
      maxPoints = durationInHours > 1 ? 3600 : 1000; // Max 1 hour of seconds or 1000 points
    } else if (timeScale === "30s") {
      maxPoints = durationInHours > 6 ? 720 : 1000; // Max 6 hours of 30s intervals
    } else if (timeScale === "1m") {
      maxPoints = durationInDays > 1 ? 1440 : 1000; // Max 1 day of minutes
    } else if (timeScale === "10m") {
      maxPoints = durationInDays > 7 ? 1008 : 1000; // Max 7 days of 10m intervals
    } else {
      maxPoints = durationInDays > 30 ? 720 : 1000; // Max 30 days of hours
    }

    let pointCount = 0;

    while (currentTime.isSameOrBefore(endTime) && pointCount < maxPoints) {
      const timestampKey = currentTime.toISOString();
      const existingData = dataMap.get(timestampKey);

      completeTimeSeries.push({
        timestamp: currentTime.format(formatString),
        avgResponseTime: existingData
          ? parseFloat(existingData.avgResponseTime.toFixed(4))
          : 0,
        count: existingData ? existingData.count : 0,
      });

      currentTime.add(displayAmount, displayInterval);
      pointCount++;
    }

    return completeTimeSeries;
  }, [statsData, statsFilters]);

  // Effects
  useEffect(() => {
    fetchFilterOptions();
    fetchOverview();
  }, [fetchFilterOptions, fetchOverview]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh overview every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handleStatsFilterChange = (key: string, value: any) => {
    setStatsFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadgeVariant = (statusCode?: number) => {
    if (!statusCode) return "secondary";
    if (statusCode >= 200 && statusCode < 300) return "default";
    if (statusCode >= 400 && statusCode < 500) return "destructive";
    if (statusCode >= 500) return "destructive";
    return "secondary";
  };

  const formatResponseTime = (ms?: number) => {
    if (ms === undefined || ms === null) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const openChartInNewWindow = () => {
    if (!statsData?.data || statsData.data.length === 0) return;

    // Generate a unique key for this chart data
    const dataKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store chart data in sessionStorage
    const chartPageData = {
      statsData,
      filters: statsFilters,
      chartData,
    };

    sessionStorage.setItem(
      `chart-data-${dataKey}`,
      JSON.stringify(chartPageData)
    );

    // Open the chart page in a new tab
    const newTab = window.open(
      `/admin/request-logs/chart?dataKey=${dataKey}`,
      "_blank"
    );

    if (!newTab) {
      alert(
        "Please allow popups for this site to open the chart in a new tab."
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="Request Logs Monitoring" />
      <div className="space-y-6">
        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.totalRequests24h.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Error Requests (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overview.errorRequests24h.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {overview.successRate24h.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "stats"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Statistics & Charts
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "logs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Request Logs
          </button>
        </div>

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Stats Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Filters</CardTitle>
                <CardDescription>
                  Configure time range and aggregation level for response time
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={moment(statsFilters.createdAtStart)
                        .tz(PHILIPPINES_TIMEZONE)
                        .format("YYYY-MM-DDTHH:mm")}
                      onChange={(e) =>
                        handleStatsFilterChange(
                          "createdAtStart",
                          moment
                            .tz(e.target.value, PHILIPPINES_TIMEZONE)
                            .toISOString()
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={moment(statsFilters.createdAtEnd)
                        .tz(PHILIPPINES_TIMEZONE)
                        .format("YYYY-MM-DDTHH:mm")}
                      onChange={(e) =>
                        handleStatsFilterChange(
                          "createdAtEnd",
                          moment
                            .tz(e.target.value, PHILIPPINES_TIMEZONE)
                            .toISOString()
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Scale
                    </label>
                    <Select
                      value={statsFilters.timeScale}
                      onValueChange={(value) =>
                        handleStatsFilterChange("timeScale", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOptions?.timeScales.map((scale) => (
                          <SelectItem key={scale.value} value={scale.value}>
                            {scale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Request Path
                    </label>
                    <Select
                      value={statsFilters.requestPath || "all"}
                      onValueChange={(value) =>
                        handleStatsFilterChange(
                          "requestPath",
                          value === "all" ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All paths" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All paths</SelectItem>
                        {filterOptions?.requestPaths.map((path) => (
                          <SelectItem key={path} value={path}>
                            {path}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Request Type
                    </label>
                    <Select
                      value={statsFilters.type || "all"}
                      onValueChange={(value) =>
                        handleStatsFilterChange(
                          "type",
                          value === "all" ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {filterOptions?.types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = moment().tz(PHILIPPINES_TIMEZONE);
                      setStatsFilters((prev) => ({
                        ...prev,
                        createdAtStart: today.startOf("day").toISOString(),
                        createdAtEnd: today.endOf("day").toISOString(),
                      }));
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const yesterday = moment()
                        .tz(PHILIPPINES_TIMEZONE)
                        .subtract(1, "day");
                      setStatsFilters((prev) => ({
                        ...prev,
                        createdAtStart: yesterday.startOf("day").toISOString(),
                        createdAtEnd: yesterday.endOf("day").toISOString(),
                      }));
                    }}
                  >
                    Yesterday
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const last7Days = moment()
                        .tz(PHILIPPINES_TIMEZONE)
                        .subtract(7, "days");
                      const today = moment().tz(PHILIPPINES_TIMEZONE);
                      setStatsFilters((prev) => ({
                        ...prev,
                        createdAtStart: last7Days.startOf("day").toISOString(),
                        createdAtEnd: today.endOf("day").toISOString(),
                      }));
                    }}
                  >
                    Last 7 Days
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Response Time Analytics</CardTitle>
                    <CardDescription>
                      Average response time and request volume over time
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openChartInNewWindow()}
                    disabled={!statsData?.data || statsData.data.length === 0}
                  >
                    Open in New Tab
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          interval="preserveStartEnd"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Avg Response Time (s)") {
                              return [
                                parseFloat(value as string).toFixed(4) + "s",
                                name,
                              ];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="avgResponseTime"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          name="Avg Response Time (s)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="count"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          name="Request Count"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">No data available</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            {/* Log Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter request logs by various criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Request Path
                    </label>
                    <Input
                      placeholder="e.g., /api/txn-api-deposit"
                      value={filters.requestPath || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "requestPath",
                          e.target.value || undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Response Time {">"} (seconds)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 1.5"
                      value={filters.responseTimeGt || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "responseTimeGt",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={
                        filters.createdAtStart
                          ? moment(filters.createdAtStart)
                              .tz(PHILIPPINES_TIMEZONE)
                              .format("YYYY-MM-DDTHH:mm")
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "createdAtStart",
                          e.target.value
                            ? moment
                                .tz(e.target.value, PHILIPPINES_TIMEZONE)
                                .toISOString()
                            : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={
                        filters.createdAtEnd
                          ? moment(filters.createdAtEnd)
                              .tz(PHILIPPINES_TIMEZONE)
                              .format("YYYY-MM-DDTHH:mm")
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "createdAtEnd",
                          e.target.value
                            ? moment
                                .tz(e.target.value, PHILIPPINES_TIMEZONE)
                                .toISOString()
                            : undefined
                        )
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ limit: 50, offset: 0 })}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = moment().tz(PHILIPPINES_TIMEZONE);
                      setFilters((prev) => ({
                        ...prev,
                        createdAtStart: today.startOf("day").toISOString(),
                        createdAtEnd: today.endOf("day").toISOString(),
                      }));
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const yesterday = moment()
                        .tz(PHILIPPINES_TIMEZONE)
                        .subtract(1, "day");
                      setFilters((prev) => ({
                        ...prev,
                        createdAtStart: yesterday.startOf("day").toISOString(),
                        createdAtEnd: yesterday.endOf("day").toISOString(),
                      }));
                    }}
                  >
                    Yesterday
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Request Logs</CardTitle>
                <CardDescription>
                  {logsData &&
                    `Showing ${logsData.data.length} of ${logsData.total} requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">Loading logs...</div>
                ) : logsData?.data.length ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Path
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Response Time
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                              Org ID
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {logsData.data.map((log) => (
                            <tr
                              key={log.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                {moment(log.createdAt)
                                  .tz(PHILIPPINES_TIMEZONE)
                                  .format("MM/DD HH:mm:ss")}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 max-w-xs truncate">
                                {log.requestPath}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant={
                                    log.type.includes("ERROR")
                                      ? "destructive"
                                      : "default"
                                  }
                                >
                                  {log.type}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    log.httpStatusCode
                                  )}
                                >
                                  {log.httpStatusCode || "N/A"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                {formatResponseTime(log.responseTimeMs)}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                {log.organizationId || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {logsData.pagination.hasMore && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleFilterChange(
                              "offset",
                              (filters.offset || 0) + (filters.limit || 50)
                            )
                          }
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No logs found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
