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
import InfiniteScroll from "react-infinite-scroll-component";

interface FilterParams {
  userId?: string;
  organizationId?: string;
  action?: UserActivityAction;
  ipAddress?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

export function UserActivityLogsView() {
  const { accessToken } = getApplicationCookies();
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<{
    createdAt?: string;
    id?: string;
  } | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (isLoadMore: boolean = false) => {
      if (!accessToken) return;

      if (!isLoadMore) {
        setLoading(true);
        setNextCursor(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const params: FilterParams = {
          ...filters,
          limit: 30,
        };

        if (isLoadMore && nextCursor) {
          params.cursorCreatedAt = nextCursor.createdAt;
          params.cursorId = nextCursor.id;
        }

        const response = await ApiGetUserActivityLogs({
          ...params,
          accessToken,
        });

        if (response.ok) {
          const data = await response.json();
          if (isLoadMore) {
            // Load more - append to existing logs
            setLogs((prev) => [...prev, ...(data.data || [])]);
          } else {
            // New search - replace logs
            setLogs(data.data || []);
          }
          setNextCursor(
            data.pagination?.nextCursor
              ? {
                  createdAt: data.pagination.nextCursor.createdAt,
                  id: data.pagination.nextCursor.id,
                }
              : null
          );
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Failed to fetch user activity logs:", error);
      } finally {
        if (!isLoadMore) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [accessToken, filters, nextCursor]
  );

  const handleInitialSearch = () => {
    handleSearch(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Filter Form */}
      <Card>
        <CardHeader>
          <CardTitle>操作紀錄查詢</CardTitle>
        </CardHeader>
        <CardContent>
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
              />
            </div>

            <div>
              <Label htmlFor="organizationId">單位ID</Label>
              <Input
                id="organizationId"
                value={filters.organizationId || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    organizationId: e.target.value || undefined,
                  }))
                }
                placeholder="輸入單位ID"
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
                <SelectTrigger>
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
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleInitialSearch} disabled={loading}>
              {loading ? "查詢中..." : "查詢"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {hasSearched && (
        <div className="pt-4 flex flex-col">
          <div
            id="scrollableDiv"
            className="border border-gray-200 rounded-lg overflow-hidden"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <InfiniteScroll
              dataLength={logs.length}
              next={() => {
                if (nextCursor) handleSearch(true);
              }}
              hasMore={!!nextCursor}
              loader={
                <div className="h-16 text-center pt-6 pb-4">
                  <Label className="text-gray-400">載入中...</Label>
                </div>
              }
              endMessage={
                <div className="h-16 text-center pt-6 pb-4">
                  <Label className="text-gray-400">
                    {loading
                      ? "查詢中..."
                      : logs.length
                      ? "沒有更多記錄"
                      : "沒有記錄"}
                  </Label>
                </div>
              }
              scrollableTarget="scrollableDiv"
            >
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] w-full bg-white">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        時間
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        使用者ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        單位ID
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
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm text-gray-600">
                            {format(
                              new Date(log.createdAt),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm text-gray-600">
                            {log.userId}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm text-gray-600">
                            {log.organizationId || (
                              <span className="text-sm text-gray-600">-</span>
                            )}
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
              </div>
            </InfiniteScroll>
          </div>
        </div>
      )}
    </div>
  );
}
