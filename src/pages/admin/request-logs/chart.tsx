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
import type {
  GetRequestLogsStatsParams,
  RequestLogStats,
} from "@/lib/apis/request-logs/request-logs.api";
import React, { useEffect, useMemo, useState } from "react";

import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { PHILIPPINES_TIMEZONE } from "@/lib/utils/timezone";
import moment from "moment-timezone";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/router";

interface ChartPageData {
  statsData: RequestLogStats;
  filters: GetRequestLogsStatsParams;
  chartData: Array<{
    timestamp: string;
    avgResponseTime: number;
    count: number;
  }>;
}

export default function RequestLogsChartPage() {
  useAuthGuard();

  const router = useRouter();
  const [pageData, setPageData] = useState<ChartPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from sessionStorage (passed from parent page)
    const dataKey = router.query.dataKey as string;
    if (dataKey) {
      try {
        const storedData = sessionStorage.getItem(`chart-data-${dataKey}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as ChartPageData;
          setPageData(parsedData);
        } else {
          console.error("No chart data found in session storage");
        }
      } catch (error) {
        console.error("Failed to parse chart data:", error);
      }
    }
    setLoading(false);
  }, [router.query.dataKey]);

  const formatDuration = (filters: GetRequestLogsStatsParams) => {
    const start = moment(filters.createdAtStart).tz(PHILIPPINES_TIMEZONE);
    const end = moment(filters.createdAtEnd).tz(PHILIPPINES_TIMEZONE);
    const duration = moment.duration(end.diff(start));

    if (duration.asDays() >= 1) {
      return `${Math.ceil(duration.asDays())} day(s)`;
    } else if (duration.asHours() >= 1) {
      return `${Math.ceil(duration.asHours())} hour(s)`;
    } else {
      return `${Math.ceil(duration.asMinutes())} minute(s)`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    if (!pageData) return;

    const csvContent = [
      ["Timestamp", "Avg Response Time (s)", "Request Count"].join(","),
      ...pageData.chartData.map((item) =>
        [item.timestamp, item.avgResponseTime.toFixed(4), item.count].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `request-logs-chart-${moment().format(
      "YYYY-MM-DD-HH-mm"
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ApplicationHeader title="Request Logs Chart" />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col h-full">
        <ApplicationHeader title="Request Logs Chart" />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No chart data available</div>
        </div>
      </div>
    );
  }

  const { statsData, filters, chartData } = pageData;

  return (
    <div className="flex flex-col h-full print:h-auto">
      <ApplicationHeader title="Request Logs Chart - Detailed View" />

      <div className="space-y-6 print:space-y-4">
        {/* Chart Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Chart Information</CardTitle>
                <CardDescription>
                  Detailed view of request logs analytics
                </CardDescription>
              </div>
              <div className="flex space-x-2 print:hidden">
                <Button variant="outline" onClick={handleExportData}>
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  Print
                </Button>
                <Button variant="outline" onClick={() => window.close()}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Time Range
                </div>
                <div className="text-lg font-semibold">
                  {formatDuration(filters)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Time Scale
                </div>
                <Badge variant="secondary">{filters.timeScale}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Data Points
                </div>
                <div className="text-lg font-semibold">{chartData.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Total Requests
                </div>
                <div className="text-lg font-semibold">
                  {chartData
                    .reduce((sum, item) => sum + item.count, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Start Time:</div>
                <div>
                  {moment(filters.createdAtStart)
                    .tz(PHILIPPINES_TIMEZONE)
                    .format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">End Time:</div>
                <div>
                  {moment(filters.createdAtEnd)
                    .tz(PHILIPPINES_TIMEZONE)
                    .format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
              {filters.requestPath && (
                <div>
                  <div className="font-medium text-gray-500">
                    Request Path Filter:
                  </div>
                  <div className="font-mono text-xs">{filters.requestPath}</div>
                </div>
              )}
              {filters.type && (
                <div>
                  <div className="font-medium text-gray-500">Type Filter:</div>
                  <Badge variant="outline">{filters.type}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Large Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analytics</CardTitle>
            <CardDescription>
              Average response time and request volume over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 print:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
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
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics Summary</CardTitle>
            <CardDescription>
              Key metrics from the analyzed time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(
                    chartData.reduce(
                      (sum, item) => sum + item.avgResponseTime * item.count,
                      0
                    ) / chartData.reduce((sum, item) => sum + item.count, 0) ||
                    0
                  ).toFixed(4)}
                  s
                </div>
                <div className="text-sm text-gray-500">
                  Overall Avg Response Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(
                    ...chartData.map((item) => item.avgResponseTime)
                  ).toFixed(4)}
                  s
                </div>
                <div className="text-sm text-gray-500">Peak Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(
                    ...chartData.map((item) => item.count)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Peak Request Count</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {chartData.filter((item) => item.count > 0).length}
                </div>
                <div className="text-sm text-gray-500">Active Time Periods</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
