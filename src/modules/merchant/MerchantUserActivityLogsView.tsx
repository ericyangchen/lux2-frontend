import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useCallback, useState } from "react";

import { ApiGetUserActivityLogs } from "@/lib/apis/user-activity-logs/get";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { USER_ACTIVITY_ACTION_DISPLAY_NAMES } from "@/lib/constants/user-activity-logs";
import { UserActivityAction } from "@/lib/enums/users/user-activity-action.enum";
import { UserActivityLog } from "@/lib/types/user-activity-log";
import { format } from "date-fns";
import { getApplicationCookies } from "@/lib/utils/cookie";

interface MerchantFilterParams {
  userId?: string;
  action?: UserActivityAction;
  ipAddress?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

export function MerchantUserActivityLogsView() {
  const { accessToken, organizationId: merchantOrganizationId } =
    getApplicationCookies();
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<{
    cursorCreatedAt?: string;
    cursorId?: string;
  }>({});
  const [filters, setFilters] = useState<MerchantFilterParams>({});

  const handleSearch = useCallback(
    async (params: MerchantFilterParams) => {
      if (!accessToken || !merchantOrganizationId) return;

      setLoading(true);
      try {
        const response = await ApiGetUserActivityLogs({
          ...params,
          organizationId: merchantOrganizationId, // Always use merchant's organizationId
          accessToken,
        });

        if (response.ok) {
          const data = await response.json();
          if (params.cursorCreatedAt && params.cursorId) {
            // Load more - append to existing logs
            setLogs((prev) => [...prev, ...data.data]);
          } else {
            // New search - replace logs
            setLogs(data.data);
          }
          setNextCursor(data.pagination.nextCursor || {});
        }
      } catch (error) {
        console.error("Failed to fetch user activity logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, merchantOrganizationId]
  );

  const handleInitialSearch = () => {
    handleSearch(filters);
  };

  const handleLoadMore = () => {
    handleSearch({
      ...filters,
      cursorCreatedAt: nextCursor.cursorCreatedAt,
      cursorId: nextCursor.cursorId,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Filter Form */}
      <div className="border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">操作紀錄查詢</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="userId">使用者ID</Label>
              <Input
                id="userId"
                value={filters.userId || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    userId: e.target.value || undefined,
                  }))
                }
                placeholder="輸入使用者ID"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
            </div>

            <div>
              <Label htmlFor="action">操作類型</Label>
              <Select
                value={filters.action || "ALL"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    action:
                      value === "ALL"
                        ? undefined
                        : (value as UserActivityAction),
                  }))
                }
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue placeholder="選擇操作類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部</SelectItem>
                  {Object.values(UserActivityAction).map((action) => (
                    <SelectItem key={action} value={action}>
                      {USER_ACTIVITY_ACTION_DISPLAY_NAMES[action] || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ipAddress">IP地址</Label>
              <Input
                id="ipAddress"
                value={filters.ipAddress || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ipAddress: e.target.value || undefined,
                  }))
                }
                placeholder="輸入IP地址"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button 
              onClick={handleInitialSearch} 
              disabled={loading}
              className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
            >
              {loading ? "查詢中..." : "查詢"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  時間
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  使用者ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  操作類型
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  描述
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                  IP地址
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-gray-600">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-gray-600">
                      {log.userId}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {USER_ACTIVITY_ACTION_DISPLAY_NAMES[log.action] ||
                        log.action}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="text-sm text-gray-900 max-w-xs truncate"
                      title={log.description || "-"}
                    >
                      {log.description || (
                        <span className="text-sm text-gray-600">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-gray-600">
                      {log.ipAddress}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">暫無資料</div>
          )}
        </div>
      </div>

      {nextCursor.cursorCreatedAt && nextCursor.cursorId && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            disabled={loading}
            className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
          >
            載入更多
          </Button>
        </div>
      )}
    </div>
  );
}
