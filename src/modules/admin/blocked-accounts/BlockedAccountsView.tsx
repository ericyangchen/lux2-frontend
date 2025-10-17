import {
  ApiGetBlockedAccounts,
  GetBlockedAccountsResponse,
} from "@/lib/apis/blocked-accounts/list";
import {
  ApiUnblockAccount,
  UnblockAccountResponse,
} from "@/lib/apis/blocked-accounts/unblock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useCallback, useEffect, useState } from "react";

import { ApplicationError } from "@/lib/error/applicationError";
import { BlockedAccount } from "@/lib/types/blocked-account";
import { Button } from "@/components/shadcn/ui/button";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function BlockedAccountsView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  const [blockedAccounts, setBlockedAccounts] = useState<BlockedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BlockedAccount | null>(
    null
  );
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const fetchBlockedAccounts = useCallback(async () => {
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
      const response = await ApiGetBlockedAccounts({ accessToken });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const data: GetBlockedAccountsResponse = await response.json();
      setBlockedAccounts(data.data);
    } catch (error) {
      console.error("Error loading blocked accounts:", error);
      toast({
        title: "錯誤",
        description: "載入封鎖帳號失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  const handleUnblockClick = (account: BlockedAccount) => {
    setSelectedAccount(account);
    setIsUnblockDialogOpen(true);
  };

  const handleUnblock = async () => {
    if (!accessToken || !selectedAccount) {
      toast({
        title: "錯誤",
        description: "缺少必要資料",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUnblocking(true);
      const response = await ApiUnblockAccount({
        userId: selectedAccount.userId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result: UnblockAccountResponse = await response.json();

      toast({
        title: "成功",
        description: "帳號已解除封鎖",
      });

      setIsUnblockDialogOpen(false);
      setSelectedAccount(null);
      await fetchBlockedAccounts();
    } catch (error) {
      console.error("Error unblocking account:", error);
      toast({
        title: "錯誤",
        description: "解除封鎖失敗",
        variant: "destructive",
      });
    } finally {
      setIsUnblocking(false);
    }
  };

  useEffect(() => {
    fetchBlockedAccounts();
  }, [fetchBlockedAccounts]);

  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">封鎖帳號列表</h3>
            <p className="text-sm text-gray-500">
              管理因登入失敗次數過多而被封鎖的使用者帳號
            </p>
          </div>
          <Button
            onClick={fetchBlockedAccounts}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "載入中..." : "重新整理"}
          </Button>
        </div>

        {/* Blocked Accounts Table */}
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : blockedAccounts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">目前沒有被封鎖的帳號</p>
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
                    單位名稱 (ID)
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    失敗次數
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    封鎖時間
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {blockedAccounts.map((account) => (
                  <tr key={account.userId}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-900 sm:pl-6">
                      {account.userId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {account.userName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {account.userEmail}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <div>
                        <div>{account.organizationName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          ({account.organizationId})
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {account.failedAttempts}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {account.blockedAt
                        ? convertDatabaseTimeToReadablePhilippinesTime(
                            account.blockedAt
                          )
                        : "-"}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Button
                        onClick={() => handleUnblockClick(account)}
                        size="sm"
                        variant="outline"
                      >
                        解除封鎖
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Unblock Confirmation Dialog */}
        <Dialog
          open={isUnblockDialogOpen}
          onOpenChange={setIsUnblockDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>確認解除封鎖</DialogTitle>
              <DialogDescription>
                您確定要解除此使用者帳號的封鎖嗎？
              </DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-2 py-4">
                <p>
                  <strong>使用者 ID:</strong> {selectedAccount.userId}
                </p>
                <p>
                  <strong>姓名:</strong> {selectedAccount.userName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAccount.userEmail}
                </p>
                <p>
                  <strong>單位:</strong> {selectedAccount.organizationName}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUnblockDialogOpen(false)}
                disabled={isUnblocking}
              >
                取消
              </Button>
              <Button onClick={handleUnblock} disabled={isUnblocking}>
                {isUnblocking ? "處理中..." : "確認解除"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
