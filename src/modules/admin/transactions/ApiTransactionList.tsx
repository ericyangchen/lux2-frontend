import {
  ApiGetTransactionById,
  ApiGetTransactions,
} from "@/lib/apis/transactions/get";
import {
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionInternalStatusDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
  WithdrawalPaymentChannelCategories,
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
import { useEffect, useState } from "react";

import { ApiTransactionInfoDialog } from "../common/ApiTransactionInfoDialog";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Calculator } from "@/lib/utils/calculator";
import { DatePicker } from "@/components/DatePicker";
import InfiniteScroll from "react-infinite-scroll-component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Organization } from "@/lib/types/organization";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Transaction } from "@/lib/types/transaction";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { flattenOrganizations } from "../common/flattenOrganizations";
import { formatNumberWithoutMinFraction } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useRouter } from "next/router";
import { useToast } from "@/components/shadcn/ui/use-toast";

const QueryTypes = {
  SEARCH_BY_TRANSACTION_ID: "searchByTransactionId",
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

const findOrganizationById = (organizations: Organization[], id: string) => {
  return organizations.find((org) => org.id === id);
};

export function ApiTransactionList() {
  const router = useRouter();

  const { toast } = useToast();

  const { organization } = useOrganizationWithChildren({
    organizationId: getApplicationCookies().organizationId,
  });
  const organizations = flattenOrganizations(organization);

  // 1. search by transactionId
  const [transactionId, setTransactionId] = useState<string>(
    (router.query.transactionId as string) || ""
  );

  // 2. search by multiple conditions
  const [transactionType, setTransactionType] = useState<
    TransactionType | "all"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | "all">(
    "all"
  );
  const [merchantId, setMerchantId] = useState<string>();
  const [merchantOrderId, setMerchantOrderId] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionStatus | "all"
  >("all");
  const [transactionInternalStatus, setTransactionInternalStatus] = useState<
    TransactionInternalStatus | "all"
  >("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [isLoading, setIsLoading] = useState(false);

  const paymentChannelCategories =
    transactionType === TransactionType.API_DEPOSIT
      ? DepositPaymentChannelCategories
      : WithdrawalPaymentChannelCategories;

  const filteredPaymentChannels =
    paymentMethod && paymentMethod !== "all"
      ? paymentChannelCategories[paymentMethod]
      : Object.values(PaymentChannel);

  const [transactions, setTransactions] = useState<Transaction[]>();

  const [currentQueryType, setCurrentQueryType] = useState<string>();

  const [nextCursor, setNextCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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

    const searchById = !!transactionId;

    try {
      // 1. search by transactionId
      if (searchById) {
        const response = await ApiGetTransactionById({
          id: transactionId,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions([data]);
          // Reset cursor for single ID search
          setNextCursor(null);
          setCurrentQueryType(QueryTypes.SEARCH_BY_TRANSACTION_ID);
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
        const paymentChannelQuery =
          paymentChannel && paymentChannel !== "all"
            ? paymentChannel
            : undefined;
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

        const response = await ApiGetTransactions({
          type: transactionTypeQuery,
          merchantId,
          merchantOrderId,
          paymentMethod: paymentMethodQuery,
          paymentChannel: paymentChannelQuery,
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
          setTransactions((prev) =>
            isLoadMore
              ? [...(prev || []), ...(data?.data || [])]
              : data?.data || []
          );
          // Ensure nextCursor is properly typed
          setNextCursor(
            data?.pagination?.nextCursor
              ? {
                  createdAt: data.pagination.nextCursor.createdAt,
                  id: data.pagination.nextCursor.id,
                }
              : null
          );
          setCurrentQueryType(QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS);
        } else {
          throw new ApplicationError(data);
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

  const clearSearchByTransactionId = () => {
    setTransactionId("");
  };
  const clearSearchByMultipleConditions = () => {
    setTransactionType("all");
    setPaymentMethod("all");
    setPaymentChannel("all");
    setMerchantId("");
    setMerchantOrderId("");
    setTransactionStatus("all");
    setTransactionInternalStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleClearAll = () => {
    clearSearchByTransactionId();
    clearSearchByMultipleConditions();
    setTransactions(undefined);
    setCurrentQueryType(undefined);
  };

  useEffect(() => {
    if (!currentQueryType) return;

    if (currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID) {
      clearSearchByMultipleConditions();
    } else {
      clearSearchByTransactionId();
    }
  }, [currentQueryType]);

  const [moreInfoTransactionId, setMoreInfoTransactionId] = useState<string>();
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

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

  const getInternalStatusColor = (
    internalStatus: TransactionInternalStatus
  ) => {
    return PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.includes(internalStatus)
      ? "text-orange-500"
      : "text-gray-700";
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
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] h-[calc(100vh-56px)] overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* search bar */}
      <div className="flex flex-col divide-y pb-8">
        {/* search by transactionId */}
        <div className="pb-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            單筆查詢: 系統訂單號
          </Label>
          {/* transactionId */}
          <div className="flex items-center gap-4 w-full lg:w-fit px-4">
            <Label className="whitespace-nowrap">
              系統訂單號(txn)<span className="text-red-500">*</span>
            </Label>
            <Input
              id="transactionId"
              className="w-full sm:min-w-[220px] font-mono"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
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
            {/* paymentChannel */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">上游渠道</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={paymentChannel}
                  value={paymentChannel}
                  onValueChange={(value) =>
                    setPaymentChannel(value as PaymentChannel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      {filteredPaymentChannels?.map((paymentChannel) => (
                        <SelectItem key={paymentChannel} value={paymentChannel}>
                          {PaymentChannelDisplayNames[paymentChannel]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* merchantId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">單位 ID</Label>
              <OrganizationSearchBar
                selectedOrganizationId={merchantId}
                setSelectedOrganizationId={setMerchantId}
                organizationType={OrgType.MERCHANT}
              />
            </div>
            {/* merchantOrderId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">商戶訂單號</Label>
              <Input
                id="merchantOrderId"
                className="sm:min-w-[300px] font-mono"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
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
            {/* detailedStatus */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">詳細狀態</Label>
              <div className="w-fit min-w-[350px]">
                <Select
                  defaultValue={transactionInternalStatus}
                  value={transactionInternalStatus}
                  onValueChange={(value) => {
                    setTransactionInternalStatus(
                      value as TransactionInternalStatus
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      {Object.values(TransactionInternalStatus).map(
                        (internalStatus) => (
                          <SelectItem
                            key={internalStatus}
                            value={internalStatus}
                          >
                            <span
                              className={classNames(
                                PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.includes(
                                  internalStatus
                                )
                                  ? "text-orange-500"
                                  : ""
                              )}
                            >
                              {
                                TransactionInternalStatusDisplayNames[
                                  internalStatus
                                ]
                              }
                            </span>
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* startDate */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">起始日期</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="yyyy/mm/dd"
              />
            </div>
            {/* endDate */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">結束日期</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="yyyy/mm/dd"
              />
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
      {/* table */}
      {currentQueryType && (
        <div className="pt-4 flex flex-col">
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
                  {transactions?.length ? "沒有更多訂單紀錄" : "沒有訂單紀錄"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="pb-2">
              <Label className="whitespace-nowrap font-bold text-md">
                {currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID
                  ? "單筆查詢結果: 系統訂單號"
                  : "多筆查詢結果"}
              </Label>
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <table className="w-full min-w-[1800px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      系統訂單號
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      商戶訂單號
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      商戶
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      類別
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      支付類型
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      上游渠道
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
                      詳細狀態
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      創建時間
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 whitespace-nowrap sticky right-0 bg-gray-50 border-l">
                      更多
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
                          className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                          title={`點擊複製: ${transaction.id}`}
                          onClick={() => copyToClipboard(transaction.id)}
                        >
                          {transaction.id}
                        </div>
                      </td>

                      {/* Merchant Order ID */}
                      <td className="px-4 py-3">
                        <div
                          className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800"
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

                      {/* Merchant/Organization */}
                      <td className="px-4 py-3">
                        <div
                          className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                          title={`點擊複製: ${transaction.merchantId}`}
                          onClick={() =>
                            copyToClipboard(transaction.merchantId)
                          }
                        >
                          {findOrganizationById(
                            organizations,
                            transaction.merchantId
                          )?.name || transaction.merchantId}
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTransactionTypeBadge(transaction.type)}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {PaymentMethodDisplayNames[
                            transaction.paymentMethod
                          ] || transaction.paymentMethod}
                        </div>
                      </td>

                      {/* Payment Channel */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {PaymentChannelDisplayNames[
                            transaction.paymentChannel
                          ] || transaction.paymentChannel}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono font-medium text-gray-900 text-sm">
                          ₱ {Calculator.toFixedForDisplay(transaction.amount)}
                        </div>
                      </td>

                      {/* Total Fee */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono text-gray-600 text-sm">
                          ₱ {Calculator.toFixedForDisplay(transaction.totalFee)}
                        </div>
                      </td>

                      {/* Status */}
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

                      {/* Internal Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm whitespace-nowrap ${getInternalStatusColor(
                            transaction.internalStatus
                          )}`}
                        >
                          {TransactionInternalStatusDisplayNames[
                            transaction.internalStatus
                          ] || transaction.internalStatus}
                        </span>
                      </td>

                      {/* Created Time */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm text-gray-600">
                          {formatDateTime(transaction.createdAt)}
                        </div>
                      </td>

                      {/* More Info - Sticky Right */}
                      <td className="px-4 py-3 text-center sticky right-0 bg-white border-l">
                        <Button
                          className="rounded-md p-2 text-center"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMoreInfoTransactionId(transaction.id);
                            setIsMoreInfoOpen(true);
                          }}
                        >
                          <InformationCircleIcon className="h-4 w-4" />
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

      {/* dialog */}
      {moreInfoTransactionId && (
        <ApiTransactionInfoDialog
          isOpen={isMoreInfoOpen}
          closeDialog={() => setIsMoreInfoOpen(false)}
          transactionId={moreInfoTransactionId}
        />
      )}
    </div>
  );
}
