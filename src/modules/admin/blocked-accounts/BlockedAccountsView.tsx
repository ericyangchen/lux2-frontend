import {
  ApiBlockUsers,
  BlockUsersResponse,
} from "@/lib/apis/blocked-accounts/block-users";
import {
  ApiGetAllUsers,
  GetAllUsersResponse,
  UserWithInfo,
} from "@/lib/apis/blocked-accounts/get-all-users";
import {
  ApiRevokeUserAccess,
  RevokeUserAccessResponse,
} from "@/lib/apis/blocked-accounts/revoke-access";
import {
  ApiUnblockUsers,
  UnblockUsersResponse,
} from "@/lib/apis/blocked-accounts/unblock-users";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Input } from "@/components/shadcn/ui/input";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

type FilterType = "all" | "blocked" | "active";
type ActionType = "block" | "revoke" | "unblock";

export function BlockedAccountsView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  const [users, setUsers] = useState<UserWithInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) {
      toast({
        title: "錯誤",
        description: "無法取得存取權杖",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiGetAllUsers({ accessToken });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const data: GetAllUsersResponse = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "錯誤",
        description: "載入使用者列表失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by status
    if (filterType === "blocked") {
      result = result.filter((user) => user.isBlocked);
    } else if (filterType === "active") {
      result = result.filter((user) => !user.isBlocked);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.userName.toLowerCase().includes(query) ||
          user.userEmail.toLowerCase().includes(query) ||
          user.organizationName.toLowerCase().includes(query) ||
          user.userId.toLowerCase().includes(query)
      );
    }

    return result;
  }, [users, filterType, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.userId)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUserIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleActionClick = (action: ActionType) => {
    if (selectedUserIds.size === 0) {
      toast({
        title: "提示",
        description: "請先選擇要操作的使用者",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (action === "block") {
      const hasBlockedUser = Array.from(selectedUserIds).some((id) =>
        users.find((u) => u.userId === id && u.isBlocked)
      );
      if (hasBlockedUser) {
        toast({
          title: "提示",
          description: "選擇的使用者中包含已被封鎖的帳號",
          variant: "destructive",
        });
        return;
      }
    } else if (action === "unblock") {
      const hasActiveUser = Array.from(selectedUserIds).some((id) =>
        users.find((u) => u.userId === id && !u.isBlocked)
      );
      if (hasActiveUser) {
        toast({
          title: "提示",
          description: "選擇的使用者中包含未被封鎖的帳號",
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentAction(action);
    setIsActionDialogOpen(true);
  };

  const executeAction = async () => {
    if (!accessToken || !currentAction) return;

    const userIds = Array.from(selectedUserIds);

    try {
      setIsProcessing(true);
      let response: Response;

      switch (currentAction) {
        case "block":
          response = await ApiBlockUsers({ userIds, accessToken });
          break;
        case "revoke":
          response = await ApiRevokeUserAccess({ userIds, accessToken });
          break;
        case "unblock":
          response = await ApiUnblockUsers({ userIds, accessToken });
          break;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result = await response.json();

      toast({
        title: "成功",
        description: result.message,
      });

      setIsActionDialogOpen(false);
      setCurrentAction(null);
      setSelectedUserIds(new Set());
      await fetchUsers();
    } catch (error) {
      console.error("Error executing action:", error);
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getActionText = () => {
    switch (currentAction) {
      case "block":
        return {
          title: "封鎖使用者",
          description: "封鎖後使用者將立即登出並無法再次登入系統，直到解除封鎖",
          button: "確認封鎖",
        };
      case "revoke":
        return {
          title: "強制登出使用者",
          description:
            "強制登出後使用者的 JWT 和 Refresh Token 將立即失效，使用者可以重新登入",
          button: "確認強制登出",
        };
      case "unblock":
        return {
          title: "解除封鎖",
          description: "解除後使用者將可以正常登入系統",
          button: "確認解除",
        };
      default:
        return { title: "", description: "", button: "" };
    }
  };

  const selectedUsers = users.filter((u) => selectedUserIds.has(u.userId));
  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUserIds.has(u.userId));

  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">使用者管理</h3>
            <p className="text-sm text-gray-500">
              管理使用者帳號狀態、強制登出、封鎖與解封帳號
            </p>
          </div>
          <Button onClick={fetchUsers} disabled={isLoading} variant="outline">
            {isLoading ? "載入中..." : "重新整理"}
          </Button>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2">
            <Input
              placeholder="搜尋使用者、Email、單位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">全部使用者</option>
              <option value="blocked">已封鎖</option>
              <option value="active">正常</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleActionClick("revoke")}
              disabled={selectedUserIds.size === 0}
              variant="outline"
              size="sm"
            >
              強制登出 ({selectedUserIds.size})
            </Button>
            <Button
              onClick={() => handleActionClick("block")}
              disabled={selectedUserIds.size === 0}
              variant="destructive"
              size="sm"
            >
              封鎖 ({selectedUserIds.size})
            </Button>
            <Button
              onClick={() => handleActionClick("unblock")}
              disabled={selectedUserIds.size === 0}
              variant="default"
              size="sm"
            >
              解封 ({selectedUserIds.size})
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">沒有符合條件的使用者</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    使用者 ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    姓名
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    角色
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    單位
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    狀態
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Token 版本
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <Checkbox
                        checked={selectedUserIds.has(user.userId)}
                        onCheckedChange={(checked) =>
                          handleSelectUser(user.userId, checked as boolean)
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-900">
                      {user.userId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {user.userName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {user.userEmail}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {user.userRole}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <div>
                        <div>{user.organizationName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          ({user.organizationId})
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {user.isBlocked ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                          已封鎖
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {user.tokenVersion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Confirmation Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getActionText().title}</DialogTitle>
              <DialogDescription>
                {getActionText().description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <p className="font-semibold">
                已選擇 {selectedUserIds.size} 位使用者：
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {selectedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="text-sm p-2 bg-gray-50 rounded"
                  >
                    <div>
                      {user.userName} ({user.userEmail})
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.organizationName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                disabled={isProcessing}
              >
                取消
              </Button>
              <Button onClick={executeAction} disabled={isProcessing}>
                {isProcessing ? "處理中..." : getActionText().button}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
