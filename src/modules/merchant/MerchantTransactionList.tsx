import * as moment from "moment-timezone";

import {
  ApiGetTransactionByMerchantIdAndMerchantOrderId,
  ApiGetTransactionCountAndSumOfAmountAndFee,
  ApiGetTransactionsByMerchantId,
} from "@/lib/apis/transactions/get";
import {
  PHILIPPINES_TIMEZONE,
  convertDatabaseTimeToReadablePhilippinesTime,
  convertToPhilippinesTimezone,
} from "@/lib/utils/timezone";
import {
  PaymentMethodDisplayNames,
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
  formatNumber,
  formatNumberWithoutMinFraction,
} from "@/lib/utils/number";
import { useEffect, useState } from "react";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Transaction } from "@/lib/types/transaction";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { currencySymbol } from "@/lib/constants/common";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

const MerchantQueryTypes = {
  SEARCH_BY_MERCHANT_ORDER_ID: "searchByMerchantOrderId",
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

export function MerchantTransactionList() {
  const { toast } = useToast();

  // 1. search by merchantOrderId
  const [merchantOrderId, setMerchantOrderId] = useState<string>("");

  // 2. search by multiple conditions
  const [transactionType, setTransactionType] = useState<
    TransactionType | "all"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionStatus | "all"
  >("all");
  const [amount, setAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).startOf("day").toDate();
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).endOf("day").toDate();
  });
  const [successStartDate, setSuccessStartDate] = useState<Date>();
  const [successEndDate, setSuccessEndDate] = useState<Date>();

  const [isLoading, setIsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>();

  const [currentQueryType, setCurrentQueryType] = useState<string>();

  const [nextCursor, setNextCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [
    transactionCountAndSumOfAmountAndFee,
    setTransactionCountAndSumOfAmountAndFee,
  ] = useState<{
    count: string;
    amountSum: string;
    totalFeeSum: string;
  }>();

  const handleSearch = async (isLoadMore: boolean = false) => {
    const { accessToken, organizationId } = getApplicationCookies();

    if (!accessToken || !organizationId) {
      return;
    }

    // Prevent multiple simultaneous load more requests
    if (isLoadMore && loadingMore) return;

    if (!isLoadMore) {
      setIsLoading(true);
      // Reset pagination state for new searches
      setNextCursor(null);
      setTransactions(undefined);
    } else {
      setLoadingMore(true);
    }

    const searchByMerchantOrderId = !!merchantOrderId;

    try {
      if (searchByMerchantOrderId) {
        // 1. search by merchantOrderId
        const response = await ApiGetTransactionByMerchantIdAndMerchantOrderId({
          merchantId: organizationId,
          merchantOrderId,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions([data]);
          // Reset cursor for single order search
          setNextCursor(null);
          setCurrentQueryType(MerchantQueryTypes.SEARCH_BY_MERCHANT_ORDER_ID);
        } else {
          throw new ApplicationError(data);
        }
      } else {
        // 2. search by multiple conditions
        const transactionTypeQuery =
          transactionType && transactionType !== "all"
            ? transactionType
            : undefined;
        const paymentMethodQuery =
          paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined;
        const transactionStatusQuery =
          transactionStatus && transactionStatus !== "all"
            ? transactionStatus
            : undefined;
        const startDateQuery = startDate
          ? convertToPhilippinesTimezone(startDate.toISOString())
          : undefined;
        const endDateQuery = endDate
          ? convertToPhilippinesTimezone(endDate.toISOString())
          : undefined;
        const successStartDateQuery = successStartDate
          ? convertToPhilippinesTimezone(successStartDate.toISOString())
          : undefined;
        const successEndDateQuery = successEndDate
          ? convertToPhilippinesTimezone(successEndDate.toISOString())
          : undefined;

        const query = {
          type: transactionTypeQuery,
          paymentMethod: paymentMethodQuery,
          status: transactionStatusQuery,
          createdAtStart: startDateQuery,
          createdAtEnd: endDateQuery,
          successAtStart: successStartDateQuery,
          successAtEnd: successEndDateQuery,
          amount: amount || undefined,
        };

        // Parse cursor string into components
        const cursorCreatedAt =
          isLoadMore && nextCursor ? nextCursor.createdAt : undefined;
        const cursorId = isLoadMore && nextCursor ? nextCursor.id : undefined;

        const response = await ApiGetTransactionsByMerchantId({
          merchantId: organizationId,
          ...query,
          cursorCreatedAt,
          cursorId,
          limit: 30,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions((prev) =>
            isLoadMore
              ? [...(prev || []), ...(data?.data || [])]
              : data?.data || []
          );
          // Ensure nextCursor is properly formatted as a string
          setNextCursor(
            data?.pagination?.nextCursor
              ? {
                  createdAt: data.pagination.nextCursor.createdAt,
                  id: data.pagination.nextCursor.id,
                }
              : null
          );
          setCurrentQueryType(MerchantQueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS);
        } else {
          throw new ApplicationError(data);
        }

        // Get transaction count and sum of amount and fee (only for new search)
        if (!isLoadMore) {
          const transactionCountAndSumOfAmountAndFeeResponse =
            await ApiGetTransactionCountAndSumOfAmountAndFee({
              type: transactionTypeQuery,
              merchantId: organizationId,
              paymentMethod: paymentMethodQuery,
              status: transactionStatusQuery,
              createdAtStart: startDateQuery,
              createdAtEnd: endDateQuery,
              successAtStart: successStartDateQuery,
              successAtEnd: successEndDateQuery,
              amount: amount || undefined,
              accessToken,
            });

          const transactionCountAndSumOfAmountAndFeeData =
            await transactionCountAndSumOfAmountAndFeeResponse.json();

          setTransactionCountAndSumOfAmountAndFee(
            transactionCountAndSumOfAmountAndFeeData
          );
        }
      }
    } catch (error) {
      // On error, ensure we reset the cursor if it's a new search
      if (!isLoadMore) {
        setNextCursor(null);
      }
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 訂單查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `訂單查詢失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
      setTransactions(undefined);
    }

    setIsLoading(false);
    setLoadingMore(false);
  };

  const clearSearchByMerchantOrderId = () => {
    setMerchantOrderId("");
  };
  const clearSearchByMultipleConditions = () => {
    setTransactionType("all");
    setPaymentMethod("all");
    setTransactionStatus("all");
    setStartDate(
      moment.tz(new Date(), PHILIPPINES_TIMEZONE).startOf("day").toDate()
    );
    setEndDate(
      moment.tz(new Date(), PHILIPPINES_TIMEZONE).endOf("day").toDate()
    );
    setSuccessStartDate(undefined);
    setSuccessEndDate(undefined);
    setTransactionCountAndSumOfAmountAndFee(undefined);
  };

  const handleClearAll = () => {
    clearSearchByMerchantOrderId();
    clearSearchByMultipleConditions();
    setTransactions(undefined);
    setCurrentQueryType(undefined);
  };

  useEffect(() => {
    if (!currentQueryType) return;

    if (currentQueryType === MerchantQueryTypes.SEARCH_BY_MERCHANT_ORDER_ID) {
      clearSearchByMultipleConditions();
    } else {
      clearSearchByMerchantOrderId();
    }
  }, [currentQueryType]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已複製",
      description: "已複製到剪貼板",
    });
  };

  const formatDateTime = (dateString: string) => {
    return convertDatabaseTimeToReadablePhilippinesTime(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIndicatorColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTransactionTypeBadge = (type: TransactionType) => {
    switch (type) {
      case TransactionType.API_DEPOSIT:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-900 border border-gray-300">
            {TransactionTypeDisplayNames[type]}
          </span>
        );
      case TransactionType.API_WITHDRAWAL:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-900 text-white">
            {TransactionTypeDisplayNames[type]}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-900">
            {TransactionTypeDisplayNames[type] || type}
          </span>
        );
    }
  };

  return (
    <div
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-50px)] h-[calc(100vh-56px)] flex flex-col overflow-auto"
      id="scrollableDiv"
    >
      {/* search bar - fixed */}
      <div className="flex flex-col divide-y pb-8">
        {/* search by: merchantId & merchantOrderId */}
        <div className="py-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            單筆查詢: 商戶訂單號
          </Label>
          <div className="flex flex-wrap gap-4 px-4">
            {/* merchantOrderId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">
                商戶訂單號<span className="text-red-500">*</span>
              </Label>
              <Input
                id="merchantOrderId"
                className="sm:min-w-[300px] font-mono"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* search by multiple conditions */}
        <div className="pt-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            多筆查詢
          </Label>
          <div className="flex gap-4 flex-wrap px-4">
            {/* transactionType */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">類別</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={transactionType}
                  value={transactionType}
                  onValueChange={(value) =>
                    setTransactionType(value as TransactionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        value={"all"}
                        className="h-8 whitespace-nowrap"
                      ></SelectItem>
                      <SelectItem value={TransactionType.API_DEPOSIT}>
                        {
                          TransactionTypeDisplayNames[
                            TransactionType.API_DEPOSIT
                          ]
                        }
                      </SelectItem>
                      <SelectItem value={TransactionType.API_WITHDRAWAL}>
                        {
                          TransactionTypeDisplayNames[
                            TransactionType.API_WITHDRAWAL
                          ]
                        }
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* paymentMethod */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">支付類型</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={paymentMethod}
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
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      {Object.values(PaymentMethod).map((paymentMethod) => {
                        return (
                          <SelectItem key={paymentMethod} value={paymentMethod}>
                            {PaymentMethodDisplayNames[paymentMethod]}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* amount */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">金額</Label>
              <Input
                type="text"
                placeholder="輸入金額"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {/* status */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">狀態</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={transactionStatus}
                  value={transactionStatus}
                  onValueChange={(value) => {
                    setTransactionStatus(value as TransactionStatus);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      {Object.values(TransactionStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {TransactionStatusDisplayNames[status]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Time Range Sections */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Creation Time Range */}
              <div className="flex flex-col gap-2 flex-1">
                <Label className="font-medium">創建時間區間</Label>
                <div className="flex flex-wrap gap-4 pl-4">
                  <div className="flex items-center gap-4 w-full lg:w-fit">
                    <Label className="whitespace-nowrap">起始時間</Label>
                    <DateTimePicker
                      date={startDate}
                      setDate={(date) => setStartDate(date)}
                      placeholder="yyyy/mm/dd HH:mm:ss"
                      onChange={(date) => setStartDate(date)}
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit">
                    <Label className="whitespace-nowrap">結束時間</Label>
                    <DateTimePicker
                      date={endDate}
                      setDate={(date) => setEndDate(date)}
                      placeholder="yyyy/mm/dd HH:mm:ss"
                      onChange={(date) => setEndDate(date)}
                    />
                  </div>
                </div>
              </div>

              {/* Success Time Range */}
              <div className="flex flex-col gap-2 flex-1">
                <Label className="font-medium">成功時間區間</Label>
                <div className="flex flex-wrap gap-4 pl-4">
                  <div className="flex items-center gap-4 w-full lg:w-fit">
                    <Label className="whitespace-nowrap">起始時間</Label>
                    <DateTimePicker
                      date={successStartDate}
                      setDate={(date) => setSuccessStartDate(date)}
                      placeholder="yyyy/mm/dd HH:mm:ss"
                      onChange={(date) => setSuccessStartDate(date)}
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit">
                    <Label className="whitespace-nowrap">結束時間</Label>
                    <DateTimePicker
                      date={successEndDate}
                      setDate={(date) => setSuccessEndDate(date)}
                      placeholder="yyyy/mm/dd HH:mm:ss"
                      onChange={(date) => setSuccessEndDate(date)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* search button */}
      <div className="flex justify-center sm:justify-start pb-4 gap-4">
        <Button
          onClick={handleClearAll}
          className="w-[120px] border border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 hover:bg-inherit"
          variant="outline"
        >
          清除
        </Button>
        <Button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="w-[120px]"
        >
          {isLoading ? "查詢中..." : "查詢"}
        </Button>
      </div>

      {/* table section - scrollable */}
      {currentQueryType && (
        <div className="flex-1">
          <div className="h-full" id="scrollableDiv">
            <div className="pb-2 flex justify-between flex-wrap gap-4">
              <Label className="whitespace-nowrap font-bold text-md">
                {currentQueryType ===
                MerchantQueryTypes.SEARCH_BY_MERCHANT_ORDER_ID
                  ? "單筆查詢結果: 商戶訂單號"
                  : "多筆查詢結果"}
              </Label>

              {currentQueryType ===
                MerchantQueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS &&
                transactionCountAndSumOfAmountAndFee && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 whitespace-nowrap">
                        總筆數:
                      </span>
                      <span className="font-mono whitespace-nowrap">
                        {transactionCountAndSumOfAmountAndFee?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 whitespace-nowrap">
                        總金額:
                      </span>
                      <span className="font-mono whitespace-nowrap">
                        {currencySymbol}{" "}
                        {formatNumber(
                          transactionCountAndSumOfAmountAndFee?.amountSum || "0"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 whitespace-nowrap">
                        總手續費:
                      </span>
                      <span className="font-mono whitespace-nowrap">
                        {currencySymbol}{" "}
                        {formatNumber(
                          transactionCountAndSumOfAmountAndFee?.totalFeeSum ||
                            "0"
                        )}
                      </span>
                    </div>
                  </div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <InfiniteScroll
                  dataLength={transactions?.length || 0}
                  next={() => {
                    console.log("loading more");
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
                        {transactions?.length
                          ? "沒有更多訂單紀錄"
                          : "沒有訂單紀錄"}
                      </Label>
                    </div>
                  }
                  scrollableTarget="scrollableDiv"
                  className="!overflow-visible"
                >
                  <table className="w-full min-w-[1400px] whitespace-nowrap">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          系統訂單號
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          商戶訂單號
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          交易類型
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          支付類型
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                          金額
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                          手續費
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          狀態
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          建立時間
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          更新時間
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions?.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* System Transaction ID */}
                          <td className="px-4 py-3">
                            <div
                              className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
                              title={`點擊複製: ${transaction.id}`}
                              onClick={() => copyToClipboard(transaction.id)}
                            >
                              {transaction.id}
                            </div>
                          </td>

                          {/* Merchant Order ID */}
                          <td className="px-4 py-3">
                            <div
                              className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
                              title={`點擊複製: ${
                                transaction.merchantOrderId || "N/A"
                              }`}
                              onClick={() =>
                                transaction.merchantOrderId &&
                                copyToClipboard(transaction.merchantOrderId)
                              }
                            >
                              {transaction.merchantOrderId || "N/A"}
                            </div>
                          </td>

                          {/* Transaction Type */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              {getTransactionTypeBadge(transaction.type)}
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 whitespace-nowrap">
                              {PaymentMethodDisplayNames[
                                transaction.paymentMethod
                              ] || transaction.paymentMethod}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3 text-right">
                            <div className="font-mono font-medium text-gray-900 text-sm whitespace-nowrap">
                              ₱ {formatNumber(transaction.amount) || "0.000"}
                            </div>
                          </td>

                          {/* Total Fee */}
                          <td className="px-4 py-3 text-right">
                            <div className="font-mono text-gray-600 text-sm whitespace-nowrap">
                              ₱ {formatNumber(transaction.totalFee) || "0.000"}
                            </div>
                          </td>

                          {/* Status with color */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(
                                  transaction.status
                                )}`}
                              ></div>
                              <span
                                className={`text-sm whitespace-nowrap ${getStatusColor(
                                  transaction.status
                                )}`}
                              >
                                {TransactionStatusDisplayNames[
                                  transaction.status
                                ] || transaction.status}
                              </span>
                            </div>
                          </td>

                          {/* Created Time */}
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm text-gray-600 whitespace-nowrap">
                              {formatDateTime(transaction.createdAt)}
                            </div>
                          </td>

                          {/* Updated Time */}
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm text-gray-600 whitespace-nowrap">
                              {formatDateTime(transaction.updatedAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </InfiniteScroll>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
