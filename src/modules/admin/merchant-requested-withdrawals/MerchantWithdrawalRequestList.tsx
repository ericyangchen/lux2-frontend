import {
  ApiGetMerchantRequestedWithdrawals,
  ApiGetMerchantRequestedWithdrawalsSummary,
} from "@/lib/apis/txn-merchant-requested-withdrawals/get";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
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

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { DatePicker } from "@/components/DatePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { MerchantWithdrawalActionDialog } from "./MerchantWithdrawalActionDialog";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Organization } from "@/lib/types/organization";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Transaction } from "@/lib/types/transaction";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { flattenOrganizations } from "../common/flattenOrganizations";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

const findOrganizationById = (organizations: Organization[], id: string) => {
  return organizations.find((org) => org.id === id);
};

export function MerchantWithdrawalRequestList() {
  const { toast } = useToast();

  const { organization } = useOrganizationWithChildren({
    organizationId: getApplicationCookies().organizationId,
  });
  const organizations = flattenOrganizations(organization);

  // Search filters
  const [merchantId, setMerchantId] = useState<string>("");
  const [merchantOrderId, setMerchantOrderId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionStatus | "all"
  >(TransactionStatus.MERCHANT_REQUESTED_WITHDRAWAL_PENDING);
  const [transactionInternalStatus, setTransactionInternalStatus] = useState<
    TransactionInternalStatus | "all"
  >("all");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [nextCursor, setNextCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Summary state
  const [summary, setSummary] = useState<{
    count: string;
    amountSum: string;
  }>();

  // Selection state
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<string>
  >(new Set());
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Dialog state
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

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
      const transactionStatusQuery =
        transactionStatus && transactionStatus !== "all"
          ? transactionStatus
          : undefined;
      const transactionInternalStatusQuery =
        transactionInternalStatus && transactionInternalStatus !== "all"
          ? transactionInternalStatus
          : undefined;
      const startDateQuery = startDate
        ? convertToStartOfDay(startDate)
        : undefined;
      const endDateQuery = endDate ? convertToEndOfDay(endDate) : undefined;

      const response = await ApiGetMerchantRequestedWithdrawals({
        merchantId: merchantId || undefined,
        merchantOrderId: merchantOrderId || undefined,
        paymentMethod: paymentMethodQuery,
        status: transactionStatusQuery,
        internalStatus: transactionInternalStatusQuery,
        createdAtStart: startDateQuery,
        createdAtEnd: endDateQuery,
        cursorCreatedAt:
          isLoadMore && nextCursor ? nextCursor.createdAt : undefined,
        cursorId: isLoadMore && nextCursor ? nextCursor.id : undefined,
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

      // Get summary (only for new search, not load more)
      if (!isLoadMore) {
        try {
          const summaryResponse =
            await ApiGetMerchantRequestedWithdrawalsSummary({
              merchantId: merchantId || undefined,
              merchantOrderId: merchantOrderId || undefined,
              paymentMethod: paymentMethodQuery,
              status: transactionStatusQuery,
              internalStatus: transactionInternalStatusQuery,
              createdAtStart: startDateQuery,
              createdAtEnd: endDateQuery,
              accessToken,
            });

          const summaryData = await summaryResponse.json();

          if (summaryResponse.ok) {
            setSummary(summaryData);
          } else {
            // If summary fails, we don't want to break the main search
            console.error("Failed to fetch summary:", summaryData);
            setSummary(undefined);
          }
        } catch (summaryError) {
          console.error("Failed to fetch summary:", summaryError);
          setSummary(undefined);
        }
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 商戶提領請求查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `商戶提領請求查詢失敗`,
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
    setMerchantOrderId("");
    setPaymentMethod("all");
    setTransactionStatus("all");
    setTransactionInternalStatus("all");
    setStartDate(new Date());
    setEndDate(new Date());
    setTransactions(undefined);
    setNextCursor(null);
    setSummary(undefined);
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

  const handleShowTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const isAllSelected =
    transactions &&
    transactions.length > 0 &&
    selectedTransactionIds.size === transactions.length;
  const isIndeterminate =
    selectedTransactionIds.size > 0 &&
    selectedTransactionIds.size < (transactions?.length || 0);

  return (
    <div className="flex flex-col gap-4">
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

          {/* merchantOrderId */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">商戶訂單號</Label>
            <div className="w-fit min-w-[200px]">
              <Input
                placeholder="商戶訂單號"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
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

          {/* transactionStatus */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">狀態</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                value={transactionStatus}
                onValueChange={(value) =>
                  setTransactionStatus(value as TransactionStatus)
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
                    <SelectItem
                      value={
                        TransactionStatus.MERCHANT_REQUESTED_WITHDRAWAL_PENDING
                      }
                    >
                      {
                        TransactionStatusDisplayNames[
                          TransactionStatus
                            .MERCHANT_REQUESTED_WITHDRAWAL_PENDING
                        ]
                      }
                    </SelectItem>
                    <SelectItem value={TransactionStatus.PENDING}>
                      {TransactionStatusDisplayNames[TransactionStatus.PENDING]}
                    </SelectItem>
                    <SelectItem value={TransactionStatus.SUCCESS}>
                      {TransactionStatusDisplayNames[TransactionStatus.SUCCESS]}
                    </SelectItem>
                    <SelectItem value={TransactionStatus.FAILED}>
                      {TransactionStatusDisplayNames[TransactionStatus.FAILED]}
                    </SelectItem>
                    <SelectItem
                      value={
                        TransactionStatus.FAILED_MERCHANT_REQUESTED_WITHDRAWAL_REJECTED
                      }
                    >
                      {
                        TransactionStatusDisplayNames[
                          TransactionStatus
                            .FAILED_MERCHANT_REQUESTED_WITHDRAWAL_REJECTED
                        ]
                      }
                    </SelectItem>
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
              onClick={() => setIsActionDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              批量操作 ({selectedTransactionIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {transactions && (
        <div className="flex flex-col gap-4">
          <div className="pb-2 flex justify-between flex-wrap gap-4">
            <Label className="whitespace-nowrap font-bold text-md">
              查詢結果
            </Label>
            {summary && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">
                    總筆數:
                  </span>
                  <span className="font-mono whitespace-nowrap">
                    {summary.count || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">
                    總金額:
                  </span>
                  <span className="font-mono whitespace-nowrap">
                    PHP {formatNumber(summary.amountSum || "0")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <InfiniteScroll
            dataLength={transactions.length}
            next={() => handleSearch(true)}
            hasMore={!!nextCursor}
            loader={<div className="text-center py-4">載入中...</div>}
            endMessage={
              <div className="text-center py-4 text-gray-500">
                已顯示所有結果
              </div>
            }
          >
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
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      詳細資訊
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
                            : transaction.status ===
                              TransactionStatus.MERCHANT_REQUESTED_WITHDRAWAL_PENDING
                            ? "text-orange-600"
                            : transaction.status === TransactionStatus.FAILED ||
                              transaction.status ===
                                TransactionStatus.FAILED_MERCHANT_REQUESTED_WITHDRAWAL_REJECTED
                            ? "text-red-600"
                            : "",
                          "px-1 py-2 whitespace-nowrap text-center"
                        )}
                      >
                        {TransactionStatusDisplayNames[transaction.status]}
                      </td>
                      <td
                        className={classNames(
                          PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.includes(
                            transaction.internalStatus
                          )
                            ? "text-orange-500"
                            : "",
                          "px-1 py-2 text-center"
                        )}
                      >
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
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleShowTransactionDetails(transaction)
                          }
                        >
                          更多
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      )}

      {/* Action Dialog */}
      <MerchantWithdrawalActionDialog
        isOpen={isActionDialogOpen}
        closeDialog={() => setIsActionDialogOpen(false)}
        selectedTransactionIds={Array.from(selectedTransactionIds)}
        onSuccess={() => {
          setSelectedTransactionIds(new Set());
          handleSearch();
        }}
      />

      {/* Transaction Details Dialog */}
      <Dialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>交易詳細資訊</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="border-b pb-2">
                  <h4 className="font-semibold text-sm text-gray-700">
                    基本資訊
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">系統訂單號:</span>
                    <span className="text-sm font-mono">
                      {selectedTransaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">商戶訂單號:</span>
                    <span className="text-sm font-mono">
                      {selectedTransaction.merchantOrderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">商戶ID:</span>
                    <span className="text-sm font-mono">
                      {selectedTransaction.merchantId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">支付類型:</span>
                    <span className="text-sm">
                      {
                        PaymentMethodDisplayNames[
                          selectedTransaction.paymentMethod
                        ]
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">金額:</span>
                    <span className="text-sm">
                      {formatNumber(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">狀態:</span>
                    <span className="text-sm">
                      {
                        TransactionStatusDisplayNames[
                          selectedTransaction.status
                        ]
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">詳細狀態:</span>
                    <span className="text-sm">
                      {
                        TransactionInternalStatusDisplayNames[
                          selectedTransaction.internalStatus
                        ]
                      }
                    </span>
                  </div>
                </div>

                <div className="border-b pb-2 mt-4">
                  <h4 className="font-semibold text-sm text-gray-700">
                    提領資訊
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedTransaction.bankName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">銀行名稱:</span>
                      <span className="text-sm">
                        {selectedTransaction.bankName}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.bankAccount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">銀行帳戶:</span>
                      <span className="text-sm font-mono">
                        {selectedTransaction.bankAccount}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.receiverName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">收款人姓名:</span>
                      <span className="text-sm">
                        {selectedTransaction.receiverName}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.receiverEmail && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        收款人Email:
                      </span>
                      <span className="text-sm">
                        {selectedTransaction.receiverEmail}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.receiverPhoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">收款人電話:</span>
                      <span className="text-sm">
                        {selectedTransaction.receiverPhoneNumber}
                      </span>
                    </div>
                  )}
                </div>

                {selectedTransaction.note && (
                  <>
                    <div className="border-b pb-2 mt-4">
                      <h4 className="font-semibold text-sm text-gray-700">
                        備註
                      </h4>
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedTransaction.note}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
