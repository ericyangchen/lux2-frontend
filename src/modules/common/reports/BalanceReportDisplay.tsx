import * as moment from "moment-timezone";

import {
  BalanceBreakdown,
  BalanceReportSummary,
  BalanceSummary,
  BalanceTransactions,
  TransactionsPagination,
} from "@/lib/types/balance-report";
import {
  PaymentMethodDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
} from "@/lib/constants/transaction";
import {
  formatNumber,
  formatNumberWithoutMinFraction,
} from "@/lib/utils/number";

import { BalanceAction } from "@/lib/enums/balances/balance-action.enum";
import { BalanceRecord } from "@/lib/types/balance-record";
import { Button } from "@/components/shadcn/ui/button";
import { Card } from "@/components/shadcn/ui/card";
import { Label } from "@/components/shadcn/ui/label";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Transaction } from "@/lib/types/transaction";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { useToast } from "@/components/shadcn/ui/use-toast";

interface PageCursor {
  cursorSuccessAt?: string;
  cursorId?: string;
}

// Combined type for display component (since it expects summary + transactions together)
interface BalanceReportDisplayData {
  organizationId: string;
  paymentMethod: PaymentMethod;
  date: string;
  startBalance: BalanceBreakdown;
  endBalance: BalanceBreakdown;
  balanceModifications: BalanceRecord[];
  summary: BalanceReportSummary;
  transactions: Transaction[];
  transactionsPagination: TransactionsPagination;
}

interface BalanceReportDisplayProps {
  report: BalanceReportDisplayData;
  currentPage: number;
  visitedPages: PageCursor[]; // Cursors for pages we've visited (index 0 = page 1)
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  isLoadingPagination?: boolean;
}

export function BalanceReportDisplay({
  report,
  currentPage,
  visitedPages,
  onPageChange,
  onNextPage,
  isLoadingPagination = false,
}: BalanceReportDisplayProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = (text: string) => {
    copyToClipboard({
      toast,
      copyingText: text,
      title: "已複製到剪貼簿",
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">報表資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="font-medium text-gray-600">組織ID</Label>
            <p
              className="cursor-pointer hover:text-blue-600"
              onClick={() => handleCopyToClipboard(report.organizationId)}
            >
              {report.organizationId}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">支付方式</Label>
            <p>{PaymentMethodDisplayNames[report.paymentMethod]}</p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">日期</Label>
            <p>{report.date}</p>
          </div>
        </div>
      </Card>

      {/* Start Balance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">起始餘額 (前一日結算)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <Label className="font-medium text-gray-600">可用金額</Label>
            <p className="text-green-600 font-mono">
              {formatNumber(report.startBalance.availableAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">入金未清算</Label>
            <p className="text-yellow-600 font-mono">
              {formatNumber(report.startBalance.depositUnsettledAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">出金待處理</Label>
            <p className="text-orange-600 font-mono">
              {formatNumber(report.startBalance.withdrawalPendingAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">凍結金額</Label>
            <p className="text-red-600 font-mono">
              {formatNumber(report.startBalance.frozenAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">總餘額</Label>
            <p className="text-blue-600 font-mono font-bold text-lg">
              {formatNumber(report.startBalance.totalBalance)}
            </p>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            當日交易記錄 ({report.transactionsPagination.total} 筆總計, 顯示{" "}
            {report.transactions.length} 筆)
          </h3>
          {report.transactionsPagination.total >
            report.transactionsPagination.limit && (
            <div className="text-sm text-gray-500">
              顯示 {report.transactions.length} 筆 / 總計{" "}
              {report.transactionsPagination.total} 筆
              {report.transactionsPagination.hasMore && " (還有更多)"}
            </div>
          )}
        </div>
        {report.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">交易ID</th>
                  <th className="text-left p-2">商戶訂單號</th>
                  <th className="text-left p-2">類型</th>
                  <th className="text-left p-2">狀態</th>
                  <th className="text-left p-2">金額</th>
                  <th className="text-left p-2">手續費</th>
                  <th className="text-left p-2">餘額變動</th>
                  <th className="text-left p-2">成功時間</th>
                </tr>
              </thead>
              <tbody>
                {report.transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td
                      className="p-2 font-mono cursor-pointer hover:text-blue-600"
                      onClick={() => handleCopyToClipboard(transaction.id)}
                    >
                      {transaction.id}
                    </td>
                    <td
                      className="p-2 font-mono cursor-pointer hover:text-blue-600"
                      onClick={() =>
                        handleCopyToClipboard(transaction.merchantOrderId || "")
                      }
                    >
                      {transaction.merchantOrderId || "-"}
                    </td>
                    <td className="p-2">
                      {TransactionTypeDisplayNames[transaction.type]}
                    </td>
                    <td className="p-2">
                      {TransactionStatusDisplayNames[transaction.status]}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(transaction.amount)}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(transaction.totalFee || "0")}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(transaction.balanceChanged || "0")}
                    </td>
                    <td className="p-2">
                      {transaction.successAt
                        ? convertDatabaseTimeToReadablePhilippinesTime(
                            transaction.successAt
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">當日無交易記錄</p>
        )}

        {/* Pagination Controls */}
        {(onPageChange || onNextPage) &&
          report.transactionsPagination.total >
            report.transactionsPagination.limit && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                {/* Center: Page buttons */}
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2">
                    {/* Previous pages - show buttons for pages we've already visited */}
                    {(() => {
                      const totalVisitedPages = visitedPages.length;
                      const maxVisiblePages = 7; // Show up to 7 page buttons

                      if (totalVisitedPages <= maxVisiblePages) {
                        // Show all visited pages
                        return visitedPages.map((_, index) => {
                          const pageNumber = index + 1;
                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                pageNumber === currentPage
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              disabled={isLoadingPagination}
                              onClick={() => onPageChange?.(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        });
                      }

                      // Too many pages - show with ellipsis
                      const pageButtons = [];
                      const firstPages = 3; // Always show first 3 pages
                      const lastPages = 2; // Always show last 2 pages

                      // First pages
                      for (
                        let i = 1;
                        i <= Math.min(firstPages, totalVisitedPages);
                        i++
                      ) {
                        pageButtons.push(
                          <Button
                            key={i}
                            variant={i === currentPage ? "default" : "outline"}
                            size="sm"
                            disabled={isLoadingPagination}
                            onClick={() => onPageChange?.(i)}
                          >
                            {i}
                          </Button>
                        );
                      }

                      // Ellipsis if needed
                      if (totalVisitedPages > firstPages + lastPages) {
                        pageButtons.push(
                          <span key="ellipsis" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      // Last pages
                      if (totalVisitedPages > firstPages) {
                        const startLastPages = Math.max(
                          firstPages + 1,
                          totalVisitedPages - lastPages + 1
                        );
                        for (
                          let i = startLastPages;
                          i <= totalVisitedPages;
                          i++
                        ) {
                          pageButtons.push(
                            <Button
                              key={i}
                              variant={
                                i === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              disabled={isLoadingPagination}
                              onClick={() => onPageChange?.(i)}
                            >
                              {i}
                            </Button>
                          );
                        }
                      }

                      return pageButtons;
                    })()}
                  </div>
                </div>

                {/* Right side: Next button */}
                {onNextPage && report.transactionsPagination.hasMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoadingPagination}
                    onClick={onNextPage}
                  >
                    {isLoadingPagination ? "載入中..." : "下一頁"}
                  </Button>
                )}
              </div>

              {/* Page info - centered below */}
              <div className="text-xs text-gray-500 text-center mt-2">
                第 {currentPage} 頁 / 已探索 {visitedPages.length} 頁
                {(() => {
                  const estimatedTotalPages = Math.ceil(
                    report.transactionsPagination.total /
                      report.transactionsPagination.limit
                  );
                  return ` (共 ${estimatedTotalPages} 頁, 總計 ${report.transactionsPagination.total} 筆交易)`;
                })()}
                {report.transactionsPagination.hasMore && " - 還有更多頁面"}
              </div>
            </div>
          )}
      </Card>

      {/* Balance Modifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          手動餘額調整 ({report.balanceModifications.length} 筆)
        </h3>
        {report.balanceModifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">操作</th>
                  <th className="text-left p-2">可用變動</th>
                  <th className="text-left p-2">未清算變動</th>
                  <th className="text-left p-2">待處理變動</th>
                  <th className="text-left p-2">凍結變動</th>
                  <th className="text-left p-2">創建時間</th>
                </tr>
              </thead>
              <tbody>
                {report.balanceModifications.map((modification) => (
                  <tr
                    key={modification.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td
                      className="p-2 font-mono cursor-pointer hover:text-blue-600"
                      onClick={() => handleCopyToClipboard(modification.id)}
                    >
                      {modification.id}
                    </td>
                    <td className="p-2">{modification.action}</td>
                    <td className="p-2 font-mono">
                      {formatNumber(modification.availableAmountChanged || "0")}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(
                        modification.depositUnsettledAmountChanged || "0"
                      )}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(
                        modification.withdrawalPendingAmountChanged || "0"
                      )}
                    </td>
                    <td className="p-2 font-mono">
                      {formatNumber(modification.frozenAmountChanged || "0")}
                    </td>
                    <td className="p-2">
                      {convertDatabaseTimeToReadablePhilippinesTime(
                        modification.createdAt
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">當日無手動調整記錄</p>
        )}
      </Card>

      {/* End Balance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">結算餘額 (當日結束)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <Label className="font-medium text-gray-600">可用金額</Label>
            <p className="text-green-600 font-mono">
              {formatNumber(report.endBalance.availableAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">入金未清算</Label>
            <p className="text-yellow-600 font-mono">
              {formatNumber(report.endBalance.depositUnsettledAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">出金待處理</Label>
            <p className="text-orange-600 font-mono">
              {formatNumber(report.endBalance.withdrawalPendingAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">凍結金額</Label>
            <p className="text-red-600 font-mono">
              {formatNumber(report.endBalance.frozenAmount)}
            </p>
          </div>
          <div>
            <Label className="font-medium text-gray-600">總餘額</Label>
            <p className="text-blue-600 font-mono font-bold text-lg">
              {formatNumber(report.endBalance.totalBalance)}
            </p>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">摘要統計</h3>
        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* First column */}
          <div className="space-y-4">
            <div>
              <Label className="font-medium text-gray-600">交易筆數</Label>
              <p className="font-mono">{report.summary.transactionCount}</p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">交易總額</Label>
              <p className="font-mono">
                {formatNumber(report.summary.totalTransactionAmount)}
              </p>
            </div>
          </div>

          {/* Second column */}
          <div className="space-y-4">
            <div>
              <Label className="font-medium text-gray-600">調整筆數</Label>
              <p className="font-mono">
                {report.summary.balanceModificationCount}
              </p>
            </div>
            <div>
              <Label className="font-medium text-gray-600">調整總額</Label>
              <p className="font-mono">
                {formatNumber(report.summary.totalBalanceModification)}
              </p>
            </div>
          </div>

          {/* Third column */}
          <div className="space-y-4">
            <div>
              <Label className="font-medium text-gray-600">驗證狀態</Label>
              <p
                className={`font-medium ${
                  report.summary.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {report.summary.isValid ? "正確" : "錯誤"}
              </p>
            </div>
            {!report.summary.isValid && report.summary.difference && (
              <div>
                <Label className="font-medium text-gray-600">差額</Label>
                <p className="font-mono text-red-600">
                  {formatNumber(report.summary.difference)}
                </p>
              </div>
            )}
          </div>
        </div>

        {!report.summary.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">
              ⚠️ 警告：餘額計算驗證失敗，可能存在資料不一致的問題
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
