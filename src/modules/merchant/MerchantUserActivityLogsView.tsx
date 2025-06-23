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
import { UserActivityAction } from "@/lib/enums/users/user-activity-action.enum";
import { format } from "date-fns";
import { getApplicationCookies } from "@/lib/utils/cookie";

interface UserActivityLog {
  id: string;
  userId: string;
  organizationId?: string;
  action: UserActivityAction;
  description?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

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
  const [filters, setFilters] = useState<MerchantFilterParams>({
    limit: 50,
  });

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

  const actionDisplayNames = {
    [UserActivityAction.LOGIN]: "登入",
    [UserActivityAction.LOGOUT]: "登出",
    [UserActivityAction.CREATE_USER]: "建立使用者",
    [UserActivityAction.UPDATE_USER]: "更新使用者",
    [UserActivityAction.DELETE_USER]: "刪除使用者",
    [UserActivityAction.ENABLE_OTP]: "啟用OTP",
    [UserActivityAction.DISABLE_OTP]: "停用OTP",
    [UserActivityAction.ADD_LOGIN_IP]: "新增登入IP",
    [UserActivityAction.REMOVE_LOGIN_IP]: "移除登入IP",
    [UserActivityAction.CREATE_MERCHANT_REQUESTED_WITHDRAWAL]:
      "建立商家提領申請",
    [UserActivityAction.CREATE_ORGANIZATION]: "建立單位",
    [UserActivityAction.UPDATE_ORGANIZATION]: "更新單位",
    [UserActivityAction.ADD_WITHDRAWAL_IP]: "新增提領IP",
    [UserActivityAction.REMOVE_WITHDRAWAL_IP]: "移除提領IP",
    [UserActivityAction.MODIFY_TRANSACTION_FEE_SETTINGS]: "修改交易手續費設定",
    [UserActivityAction.MODIFY_BALANCE]: "修改餘額",
  };

  return (
    <div className="space-y-6">
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
              <Label htmlFor="action">操作類型</Label>
              <Select
                value={filters.action || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    action: (value as UserActivityAction) || undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇操作類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  {Object.values(UserActivityAction).map((action) => (
                    <SelectItem key={action} value={action}>
                      {actionDisplayNames[action] || action}
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

            <div>
              <Label htmlFor="limit">筆數限制</Label>
              <Select
                value={String(filters.limit || 50)}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, limit: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
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
      <Card>
        <CardHeader>
          <CardTitle>操作紀錄列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    時間
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    使用者ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    操作類型
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    描述
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    IP地址
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {log.userId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {actionDisplayNames[log.action] || log.action}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {log.description || "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">暫無資料</div>
            )}
          </div>

          {nextCursor.cursorCreatedAt && nextCursor.cursorId && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                載入更多
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
