import {
  ApiGetMerchantRequestedWithdrawals,
  ApiGetMerchantRequestedWithdrawalsSummary,
} from "@/lib/apis/txn-merchant-requested-withdrawals/get";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import {
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
  TransactionStatusDisplayNames,
} from "@/lib/constants/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { MerchantDateTimePicker } from "@/components/MerchantDateTimePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { MerchantRequestedWithdrawalTab } from "./MerchantRequestedWithdrawalView";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Transaction } from "@/lib/types/transaction";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function MerchantRequestedWithdrawalList({
  setActiveTab,
}: {
  setActiveTab: (tab: MerchantRequestedWithdrawalTab) => void;
}) {
  const { toast } = useToast();

  const { organizationId } = getApplicationCookies();

  // Search filters
  const [merchantOrderId, setMerchantOrderId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionStatus | "all"
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

  // Dialog state
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = async (isLoadMore: boolean = false) => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) {
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

      const startDateQuery = startDate
        ? convertToStartOfDay(startDate)
        : undefined;
      const endDateQuery = endDate ? convertToEndOfDay(endDate) : undefined;

      const response = await ApiGetMerchantRequestedWithdrawals({
        merchantId: organizationId,
        merchantOrderId: merchantOrderId || undefined,
        paymentMethod: paymentMethodQuery,
        status: transactionStatusQuery,
        createdAtStart: startDateQuery,
        createdAtEnd: endDateQuery,
        cursorCreatedAt:
          isLoadMore && nextCursor ? nextCursor.createdAt : undefined,
        cursorId: isLoadMore && nextCursor ? nextCursor.id : undefined,
        limit: 30,
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
              merchantId: organizationId,
              merchantOrderId: merchantOrderId || undefined,
              paymentMethod: paymentMethodQuery,
              status: transactionStatusQuery,
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
          title: `${error.statusCode} - 查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `查詢失敗`,
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
    setMerchantOrderId("");
    setPaymentMethod("all");
    setTransactionStatus("all");
    setStartDate(new Date());
    setEndDate(new Date());
    setTransactions(undefined);
    setNextCursor(null);
    setSummary(undefined);
  };

  const handleShowDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  return (
    <div
      className="sm:p-4 sm:border border-gray-200 w-full lg:h-[calc(100vh-200px)] h-[calc(100vh-104px)] overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* Search Filters */}
      <div className="flex flex-col gap-4 pb-8">
        <Label className="whitespace-nowrap font-bold text-lg">
          查詢商戶提領請求
        </Label>

        <div className="flex gap-4 flex-wrap px-4">
          {/* merchantOrderId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap">商戶訂單號</Label>
            <Input
              className="sm:min-w-[300px] font-mono border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={merchantOrderId}
              onChange={(e) => setMerchantOrderId(e.target.value)}
              placeholder="輸入商戶訂單號"
            />
          </div>

          {/* paymentMethod */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">通道</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"all"}>全部</SelectItem>
                  </SelectGroup>
                  {Object.entries(PaymentMethodCurrencyMapping).map(
                    ([currency, methods]) => {
                      const validMethods = methods.filter(
                        (method): method is PaymentMethod =>
                          Object.values(PaymentMethod).includes(
                            method as PaymentMethod
                          )
                      );
                      if (validMethods.length === 0) return null;
                      return (
                        <SelectGroup key={currency}>
                          <SelectLabel className="text-xs text-gray-500">
                            {currency}
                          </SelectLabel>
                          {validMethods.map((method) => (
                            <SelectItem
                              key={method}
                              value={method}
                              className="pl-6"
                            >
                              {PaymentMethodDisplayNames[method]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* status */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">狀態</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                value={transactionStatus}
                onValueChange={(value) =>
                  setTransactionStatus(value as TransactionStatus)
                }
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"all"}>全部</SelectItem>
                    {/* Show relevant statuses for merchant requested withdrawals */}
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
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap">起始日期</Label>
            <MerchantDateTimePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="yyyy/mm/dd HH:mm:ss"
              onChange={setStartDate}
            />
          </div>

          {/* endDate */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap">結束日期</Label>
            <MerchantDateTimePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="yyyy/mm/dd HH:mm:ss"
              onChange={setEndDate}
            />
          </div>
        </div>

        <div className="flex gap-4 px-4">
          <Button 
            onClick={() => handleSearch()} 
            disabled={isLoading}
            className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
          >
            {isLoading ? "搜尋中..." : "搜尋"}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
          >
            清除條件
          </Button>
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
                  {transactions.length ? "沒有更多記錄" : "沒有記錄"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="flex flex-col border rounded-md overflow-x-scroll">
              <table className="divide-y table-auto text-sm">
                <thead className="whitespace-nowrap w-full">
                  <tr className="h-10">
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      商戶訂單號
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      通道
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
                      創建時間
                    </th>
                    <th className="px-1 py-2 text-center text-sm font-semibold text-gray-900">
                      詳細資訊
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td
                        className="px-1 py-2 font-mono text-center cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: transaction.merchantOrderId,
                            title: "已複製商戶訂單號",
                          })
                        }
                      >
                        {transaction.merchantOrderId}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {PaymentMethodDisplayNames[transaction.paymentMethod]}
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
                      <td className="px-1 py-2 text-center">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          transaction.createdAt
                        )}
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDetails(transaction)}
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

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    <span className="text-sm text-gray-600">商戶訂單號:</span>
                    <span className="text-sm font-mono">
                      {selectedTransaction.merchantOrderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">通道:</span>
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
