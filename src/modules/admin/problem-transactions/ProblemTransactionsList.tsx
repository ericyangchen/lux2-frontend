import {
  PaymentMethodDisplayNames,
  TransactionInternalStatusDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
} from "@/lib/constants/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import {
  convertDatabaseTimeToReadablePhilippinesTime,
  convertToEndOfDay,
  convertToStartOfDay,
} from "@/lib/utils/timezone";
import {
  formatNumber,
  formatNumberWithoutMinFraction,
} from "@/lib/utils/number";

import { ApiGetProblemWithdrawals } from "@/lib/apis/problem-withdrawals/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { DatePicker } from "@/components/DatePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Organization } from "@/lib/types/organization";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { ProblemTransactionResubmitDialog } from "./ProblemTransactionResubmitDialog";
import { Transaction } from "@/lib/types/transaction";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { flattenOrganizations } from "../common/flattenOrganizations";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

const findOrganizationById = (organizations: Organization[], id: string) => {
  return organizations.find((org) => org.id === id);
};

export function ProblemTransactionsList() {
  const { toast } = useToast();

  const { organization } = useOrganizationWithChildren({
    organizationId: getApplicationCookies().organizationId,
  });
  const organizations = flattenOrganizations(organization);

  // Search filters
  const [merchantId, setMerchantId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [internalStatus, setInternalStatus] = useState<
    TransactionInternalStatus | "all"
  >("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [nextCursor, setNextCursor] = useState<{
    cursorCreatedAt: string;
    cursorId: string;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Selection state
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<string>
  >(new Set());
  const [isResubmitDialogOpen, setIsResubmitDialogOpen] = useState(false);

  const handleSearch = async (isLoadMore: boolean = false) => {
    const { accessToken, organizationId } = getApplicationCookies();

    if (!accessToken || !organizationId) {
      return;
    }

    if (!isLoadMore) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const paymentMethodQuery =
        paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined;
      const internalStatusQuery =
        internalStatus && internalStatus !== "all" ? internalStatus : undefined;
      const startDateQuery = startDate
        ? convertToStartOfDay(startDate)
        : undefined;
      const endDateQuery = endDate ? convertToEndOfDay(endDate) : undefined;

      const response = await ApiGetProblemWithdrawals({
        organizationId: merchantId || undefined,
        paymentMethod: paymentMethodQuery,
        internalStatus: internalStatusQuery,
        createdAtStart: startDateQuery,
        createdAtEnd: endDateQuery,
        cursorCreatedAt:
          isLoadMore && nextCursor ? nextCursor.cursorCreatedAt : undefined,
        cursorId: isLoadMore && nextCursor ? nextCursor.cursorId : undefined,
        limit: 50,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        const newTransactions = data?.data || [];
        setTransactions((prev) =>
          isLoadMore ? [...(prev || []), ...newTransactions] : newTransactions
        );
        setNextCursor(data?.pagination?.nextCursor || null);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 待處理交易查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `待處理交易查詢失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
      setTransactions(undefined);
    }

    setIsLoading(false);
    setLoadingMore(false);
  };

  const clearFilters = () => {
    setMerchantId("");
    setPaymentMethod("all");
    setInternalStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setTransactions(undefined);
    setSelectedTransactionIds(new Set());
  };

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactionIds);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactionIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && transactions) {
      setSelectedTransactionIds(new Set(transactions.map((t) => t.id)));
    } else {
      setSelectedTransactionIds(new Set());
    }
  };

  const isAllSelected =
    transactions &&
    transactions.length > 0 &&
    selectedTransactionIds.size === transactions.length;
  const isIndeterminate =
    selectedTransactionIds.size > 0 &&
    selectedTransactionIds.size < (transactions?.length || 0);

  return (
    <div
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-84px)] h-[calc(100vh-56px)] overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* Filters */}
      <div className="pt-4 flex flex-col gap-4">
        <Label className="whitespace-nowrap font-bold text-md">搜尋條件</Label>

        <div className="flex gap-4 flex-wrap px-4">
          {/* merchantId */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">商戶ID</Label>
            <div className="w-fit min-w-[200px]">
              <OrganizationSearchBar
                selectedOrganizationId={merchantId}
                setSelectedOrganizationId={setMerchantId}
                organizationType={OrgType.MERCHANT}
              />
            </div>
          </div>

          {/* paymentMethod */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">支付類型</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all" className="h-8">
                      全部
                    </SelectItem>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {PaymentMethodDisplayNames[method]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* internalStatus */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">內部狀態</Label>
            <div className="w-fit min-w-[200px]">
              <Select
                value={internalStatus}
                onValueChange={(value) =>
                  setInternalStatus(value as TransactionInternalStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all" className="h-8">
                      全部問題狀態
                    </SelectItem>
                    {PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TransactionInternalStatusDisplayNames[status]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* startDate */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">開始日期</Label>
            <div className="w-fit min-w-[200px]">
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="選擇開始日期"
              />
            </div>
          </div>

          {/* endDate */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">結束日期</Label>
            <div className="w-fit min-w-[200px]">
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="選擇結束日期"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 px-4">
          <Button onClick={() => handleSearch()} disabled={isLoading}>
            {isLoading ? "搜尋中..." : "搜尋"}
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            清除條件
          </Button>
          {selectedTransactionIds.size > 0 && (
            <Button
              variant="default"
              onClick={() => setIsResubmitDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              重新提交 ({selectedTransactionIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {transactions && (
        <div className="pt-4 flex flex-col">
          <InfiniteScroll
            dataLength={transactions.length}
            next={() => handleSearch(true)}
            hasMore={!!nextCursor}
            loader={
              <div className="h-16 text-center pt-6 pb-4">
                <Label className="text-gray-400">載入中...</Label>
              </div>
            }
            endMessage={
              <div className="h-16 text-center pt-6 pb-4">
                <Label className="text-gray-400">
                  {transactions?.length
                    ? "沒有更多待處理交易"
                    : "沒有待處理交易"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="pb-2 flex items-center justify-between">
              <Label className="whitespace-nowrap font-bold text-md">
                待處理交易列表
              </Label>
            </div>

            <div className="flex flex-col border rounded-md overflow-x-scroll">
              <table className="divide-y table-auto text-sm">
                <thead className="whitespace-nowrap w-full">
                  <tr className="h-10">
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      系統訂單號
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      類別
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      支付類型
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      商戶
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      商戶訂單號
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      金額
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      手續費
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      狀態
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      詳細狀態
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      創建時間
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="h-12">
                      <td className="px-1 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTransactionIds.has(transaction.id)}
                          onChange={(e) =>
                            handleSelectTransaction(
                              transaction.id,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="link"
                          className="text-blue-600 underline p-0 h-auto text-sm"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              copyingText: transaction.id,
                              title: "已複製系統訂單號",
                            })
                          }
                        >
                          {transaction.id}
                        </Button>
                      </td>
                      <td className="px-1 py-2 text-center">
                        {TransactionTypeDisplayNames[transaction.type]}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {PaymentMethodDisplayNames[transaction.paymentMethod]}
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="link"
                          className="text-blue-600 underline p-0 h-auto text-sm"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              copyingText: transaction.merchantId,
                              title: "已複製商戶ID",
                            })
                          }
                        >
                          {findOrganizationById(
                            organizations,
                            transaction.merchantId
                          )?.name || transaction.merchantId}
                        </Button>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="link"
                          className="text-blue-600 underline p-0 h-auto text-sm"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              copyingText: transaction.merchantOrderId,
                              title: "已複製商戶訂單號",
                            })
                          }
                        >
                          {transaction.merchantOrderId}
                        </Button>
                      </td>
                      <td className="px-1 py-2 text-center">
                        {formatNumber(transaction.amount)}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {formatNumber(transaction.totalFee)}
                      </td>
                      <td
                        className={classNames(
                          transaction.status === TransactionStatus.SUCCESS
                            ? "text-green-600"
                            : transaction.status === TransactionStatus.FAILED
                            ? "text-red-600"
                            : "text-orange-600",
                          "px-1 py-2 whitespace-nowrap text-center"
                        )}
                      >
                        {TransactionStatusDisplayNames[transaction.status]}
                      </td>
                      <td className="px-1 py-2 text-center text-orange-500">
                        {
                          TransactionInternalStatusDisplayNames[
                            transaction.internalStatus
                          ]
                        }
                      </td>
                      <td className="px-1 py-2 text-center">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          transaction.createdAt
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      )}

      {/* Resubmit Dialog */}
      <ProblemTransactionResubmitDialog
        isOpen={isResubmitDialogOpen}
        closeDialog={() => setIsResubmitDialogOpen(false)}
        selectedTransactionIds={Array.from(selectedTransactionIds)}
        onSuccess={() => {
          setSelectedTransactionIds(new Set());
          handleSearch();
        }}
      />
    </div>
  );
}
