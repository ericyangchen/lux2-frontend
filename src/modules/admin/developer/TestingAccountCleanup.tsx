import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { ApiGetTestingAccountCleanupInfo } from "@/lib/apis/testing-account-cleanup/get";
import {
  ApiCalculateReversal,
  ApiCleanupTestingAccountTransactions,
} from "@/lib/apis/testing-account-cleanup/post";
import { ApiConvertTestingAccountToOfficial } from "@/lib/apis/organizations/patch";
import { Organization } from "@/lib/types/organization";
import { Balance } from "@/lib/types/balance";
import { Transaction } from "@/lib/types/transaction";
import { BalanceRecord } from "@/lib/types/balance-record";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";

interface CleanupInfo {
  organization: Organization;
  balances: Balance[];
  transactions: (Transaction & { balanceRecords: BalanceRecord[] })[];
  balanceModifications: BalanceRecord[];
}

interface ReversalResult {
  currentBalances: Balance[];
  projectedBalances: (Balance & {
    projectedAvailableAmount: string;
    projectedDepositUnsettledAmount: string;
    projectedWithdrawalPendingAmount: string;
    projectedFrozenAmount: string;
  })[];
  allZero: boolean;
  transactionCount: number;
  balanceRecordCount: number;
}

export function TestingAccountCleanup() {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [cleanupInfo, setCleanupInfo] = useState<CleanupInfo | null>(null);
  const [reversalResult, setReversalResult] = useState<ReversalResult | null>(
    null
  );
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isLoadingReversal, setIsLoadingReversal] = useState(false);
  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [isLoadingConvert, setIsLoadingConvert] = useState(false);
  const [cleanupSuccess, setCleanupSuccess] = useState(false);
  const { toast } = useToast();

  const { accessToken } = getApplicationCookies();

  const loadCleanupInfo = useCallback(async () => {
    if (!selectedOrganizationId || !accessToken) return;

    setIsLoadingInfo(true);
    try {
      const response = await ApiGetTestingAccountCleanupInfo({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load cleanup info");
      }

      const data = await response.json();
      setCleanupInfo(data);
      setCleanupSuccess(false);
      setReversalResult(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load cleanup info",
        variant: "destructive",
      });
      setCleanupInfo(null);
    } finally {
      setIsLoadingInfo(false);
    }
  }, [selectedOrganizationId, accessToken, toast]);

  const calculateReversal = async () => {
    if (!selectedOrganizationId || !accessToken) return;

    setIsLoadingReversal(true);
    try {
      const response = await ApiCalculateReversal({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to calculate reversal");
      }

      const data = await response.json();
      setReversalResult(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate reversal",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReversal(false);
    }
  };

  const handleCleanup = async () => {
    if (!selectedOrganizationId || !accessToken) return;

    setIsLoadingCleanup(true);
    try {
      const response = await ApiCleanupTestingAccountTransactions({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to cleanup transactions");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message || "Successfully cleaned up transactions",
      });
      setCleanupSuccess(true);
      // Reload cleanup info
      await loadCleanupInfo();
      await calculateReversal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cleanup transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const handleConvertToOfficial = async () => {
    if (!selectedOrganizationId || !accessToken) return;

    setIsLoadingConvert(true);
    try {
      const response = await ApiConvertTestingAccountToOfficial({
        organizationId: selectedOrganizationId,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to convert to official");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description:
          data.message || "Successfully converted to official account",
      });
      setSelectedOrganizationId("");
      setCleanupInfo(null);
      setReversalResult(null);
      setCleanupSuccess(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert to official",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConvert(false);
    }
  };

  useEffect(() => {
    if (selectedOrganizationId) {
      loadCleanupInfo();
    } else {
      setCleanupInfo(null);
      setReversalResult(null);
      setCleanupSuccess(false);
    }
  }, [selectedOrganizationId, loadCleanupInfo]);

  const canCleanup =
    reversalResult?.allZero === true && !isLoadingCleanup && !cleanupSuccess;
  const canConvert =
    cleanupSuccess &&
    cleanupInfo &&
    cleanupInfo.balances.every(
      (b) =>
        b.availableAmount === "0" &&
        b.depositUnsettledAmount === "0" &&
        b.withdrawalPendingAmount === "0" &&
        b.frozenAmount === "0"
    ) &&
    cleanupInfo.balanceModifications.length === 0 &&
    !isLoadingConvert;

  return (
    <div className="w-full space-y-4 p-6">
      <div className="space-y-3">
        <Label>組織</Label>
        <OrganizationSearchBar
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
        />
        {cleanupInfo && !cleanupInfo.organization.isTestingAccount && (
          <div className="text-sm text-red-600">此組織不是測試帳號</div>
        )}
      </div>

      {cleanupInfo && cleanupInfo.organization.isTestingAccount && (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">當前餘額</div>
            <div className="border rounded divide-y">
              {cleanupInfo.balances.map((balance) => (
                <div
                  key={balance.id}
                  className="flex items-center justify-between p-3 text-sm"
                >
                  <div className="font-medium w-32">
                    {PaymentMethodDisplayNames[balance.paymentMethod]}
                  </div>
                  <div className="flex gap-6 text-xs font-mono">
                    <span>可用: {balance.availableAmount}</span>
                    <span>未結算: {balance.depositUnsettledAmount}</span>
                    <span>待處理: {balance.withdrawalPendingAmount}</span>
                    <span>凍結: {balance.frozenAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">
              交易記錄 ({cleanupInfo.transactions.length} 筆)
            </div>
            <div className="border rounded divide-y max-h-[300px] overflow-y-auto">
              {cleanupInfo.transactions.map((transaction) => (
                <div key={transaction.id} className="p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-mono text-xs">{transaction.id}</div>
                    <div className="text-xs">
                      {transaction.type} | {transaction.amount}
                    </div>
                  </div>
                  {transaction.balanceRecords.length > 0 && (
                    <div className="pl-3 mt-1 space-y-0.5 text-xs text-gray-600">
                      {transaction.balanceRecords.map((record) => (
                        <div key={record.id} className="flex gap-2">
                          <span className="font-mono">{record.id}</span>
                          <span>{record.action}</span>
                          {record.availableAmountChanged && (
                            <span>可用:{record.availableAmountChanged}</span>
                          )}
                          {record.depositUnsettledAmountChanged && (
                            <span>
                              未結算:{record.depositUnsettledAmountChanged}
                            </span>
                          )}
                          {record.withdrawalPendingAmountChanged && (
                            <span>
                              待處理:{record.withdrawalPendingAmountChanged}
                            </span>
                          )}
                          {record.frozenAmountChanged && (
                            <span>凍結:{record.frozenAmountChanged}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">
              餘額修改記錄 ({cleanupInfo.balanceModifications.length} 筆)
            </div>
            <div className="border rounded divide-y max-h-[150px] overflow-y-auto">
              {cleanupInfo.balanceModifications.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">無</div>
              ) : (
                cleanupInfo.balanceModifications.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{mod.id}</span>
                      <span>{mod.action}</span>
                    </div>
                    <span>{PaymentMethodDisplayNames[mod.paymentMethod]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">反向計算結果</div>
              <Button
                onClick={calculateReversal}
                disabled={isLoadingReversal}
                variant="outline"
                size="sm"
              >
                {isLoadingReversal ? "計算中..." : "計算"}
              </Button>
            </div>
            {reversalResult && (
              <div className="border rounded p-3 space-y-3">
                <div className="text-xs space-y-1">
                  <div>
                    交易數: {reversalResult.transactionCount} | 餘額記錄數:{" "}
                    {reversalResult.balanceRecordCount}
                  </div>
                  <div>
                    預期餘額為零:{" "}
                    <span
                      className={
                        reversalResult.allZero
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {reversalResult.allZero ? "是" : "否"}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-2 space-y-1">
                  {reversalResult.projectedBalances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="font-medium w-32">
                        {PaymentMethodDisplayNames[balance.paymentMethod]}
                      </div>
                      <div className="flex gap-6 font-mono">
                        <span>可用:{balance.projectedAvailableAmount}</span>
                        <span>
                          未結算:{balance.projectedDepositUnsettledAmount}
                        </span>
                        <span>
                          待處理:{balance.projectedWithdrawalPendingAmount}
                        </span>
                        <span>凍結:{balance.projectedFrozenAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCleanup}
              disabled={!canCleanup}
              variant="destructive"
              size="sm"
            >
              {isLoadingCleanup ? "清理中..." : "清理訂單"}
            </Button>
            <Button
              onClick={handleConvertToOfficial}
              disabled={!canConvert}
              size="sm"
            >
              {isLoadingConvert ? "轉換中..." : "轉為正式商戶"}
            </Button>
          </div>
          {!reversalResult && (
            <div className="text-xs text-gray-500">請先計算反向結果</div>
          )}
          {reversalResult && !reversalResult.allZero && (
            <div className="text-xs text-red-600">預期餘額不為零，無法清理</div>
          )}
          {!canConvert && cleanupSuccess && (
            <div className="text-xs text-gray-500">
              需要餘額為零且無餘額修改記錄
            </div>
          )}
        </div>
      )}
    </div>
  );
}
