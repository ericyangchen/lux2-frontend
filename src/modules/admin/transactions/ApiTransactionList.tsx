import moment from "moment-timezone";

import {
  ApiGetTransactionById,
  ApiGetTransactionCountAndSumOfAmountAndFee,
  ApiGetTransactions,
} from "@/lib/apis/transactions/get";
import {
  ApiExportTransactions,
  ApiGetExportJobStatus,
  ExportTransactionsDto,
  JobStatus as TransactionJobStatus,
} from "@/lib/apis/transactions/export";
import { ExportCompletionDialog } from "@/components/export/ExportCompletionDialog";
import { ExportJobStatus } from "@/components/export/ExportJobStatus";
import { useExportJob } from "@/lib/hooks/use-export-job";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
  TransactionInternalStatusDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";
import {
  PHILIPPINES_TIMEZONE,
  convertDatabaseTimeToReadablePhilippinesTime,
  convertToPhilippinesTimezone,
} from "@/lib/utils/timezone";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useState } from "react";

import { ApiTransactionInfoDialog } from "../common/ApiTransactionInfoDialog";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Calculator } from "@/lib/utils/calculator";
import { DateTimePicker } from "@/components/DateTimePicker";
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
import { getCurrencySymbol } from "@/lib/utils/currency";

// Get currency for a payment method
const getCurrencyForPaymentMethod = (
  paymentMethod: PaymentMethod
): string | null => {
  for (const [currency, methods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (methods.includes(paymentMethod)) {
      return currency;
    }
  }
  return null;
};

// Group payment method summaries by currency
const groupSummariesByCurrency = (
  summaries: Array<{
    paymentMethod: PaymentMethod;
    count: string;
    amountSum: string;
    totalFeeSum: string;
  }>
): Array<{
  currency: string;
  count: string;
  amountSum: string;
  totalFeeSum: string;
}> => {
  const currencyMap = new Map<
    string,
    { count: string; amountSum: string; totalFeeSum: string }
  >();

  for (const summary of summaries) {
    const currency = getCurrencyForPaymentMethod(summary.paymentMethod);
    if (!currency) continue;

    if (currencyMap.has(currency)) {
      const existing = currencyMap.get(currency)!;
      existing.count = (
        parseInt(existing.count) + parseInt(summary.count || "0")
      ).toString();
      existing.amountSum = Calculator.plus(
        existing.amountSum,
        summary.amountSum || "0"
      );
      existing.totalFeeSum = Calculator.plus(
        existing.totalFeeSum,
        summary.totalFeeSum || "0"
      );
    } else {
      currencyMap.set(currency, {
        count: summary.count || "0",
        amountSum: summary.amountSum || "0",
        totalFeeSum: summary.totalFeeSum || "0",
      });
    }
  }

  return Array.from(currencyMap.entries()).map(([currency, data]) => ({
    currency,
    count: data.count,
    amountSum: data.amountSum,
    totalFeeSum: data.totalFeeSum,
  }));
};
import { flattenOrganizations } from "../common/flattenOrganizations";
import { format } from "date-fns";
import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";
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
  const [amount, setAmount] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).startOf("day").toDate();
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).endOf("day").toDate();
  });
  const [successStartDate, setSuccessStartDate] = useState<Date | undefined>();
  const [successEndDate, setSuccessEndDate] = useState<Date | undefined>();

  const [isLoading, setIsLoading] = useState(false);

  const paymentChannelCategories =
    transactionType === TransactionType.API_DEPOSIT
      ? DepositPaymentChannelCategories
      : WithdrawalPaymentChannelCategories;

  const filteredPaymentChannels = (
    paymentMethod && paymentMethod !== "all"
      ? paymentChannelCategories[paymentMethod]
      : Object.values(PaymentChannel)
  ).sort((a, b) =>
    (PaymentChannelDisplayNames[a] || a).localeCompare(
      PaymentChannelDisplayNames[b] || b
    )
  );

  const [transactions, setTransactions] = useState<Transaction[]>();

  const [
    transactionCountAndSumOfAmountAndFee,
    setTransactionCountAndSumOfAmountAndFee,
  ] = useState<
    Array<{
      paymentMethod: PaymentMethod;
      count: string;
      amountSum: string;
      totalFeeSum: string;
    }>
  >([]);

  const [currentQueryType, setCurrentQueryType] = useState<string>();

  const [nextCursor, setNextCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Export job states
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [ongoingJob, setOngoingJob] = useState<TransactionJobStatus | null>(
    null
  );
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedExportUrl, setCompletedExportUrl] = useState<string | null>(
    null
  );
  const [completedExportFilename, setCompletedExportFilename] =
    useState<string>("");

  const { jobStatus, startPolling, downloadFile } = useExportJob({
    jobId: currentJobId || ongoingJob?.jobId || null,
    fetchJobStatus: async (id: string) => {
      const { accessToken } = getApplicationCookies();
      return ApiGetExportJobStatus({
        jobId: id,
        accessToken: accessToken || "",
      });
    },
    onComplete: (gcsUrl: string) => {
      const filename = `transactions-export-${moment().format(
        "YYYY-MM-DD-HHmm"
      )}.xlsx`;
      setCompletedExportUrl(gcsUrl);
      setCompletedExportFilename(filename);
      setShowCompletionDialog(true);
      setOngoingJob(null);
      setCurrentJobId(null);
    },
    onError: (error: string) => {
      setOngoingJob(null);
      setCurrentJobId(null);
      toast({
        title: "匯出失敗",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleExportExcel = async () => {
    const { accessToken, organizationId } = getApplicationCookies();
    
    if (!accessToken) {
      toast({
        title: "錯誤",
        description: "請重新登入",
        variant: "destructive",
      });
      return;
    }

    try {
      // Build export filters from current search state
      const exportFilters: ExportTransactionsDto = {};

      if (transactionType && transactionType !== "all") {
        exportFilters.type = transactionType;
      }
      if (paymentMethod && paymentMethod !== "all") {
        exportFilters.paymentMethod = paymentMethod;
      }
      if (paymentChannel && paymentChannel !== "all") {
        exportFilters.paymentChannel = paymentChannel;
      }
      if (merchantId) {
        exportFilters.merchantId = merchantId;
      }
      if (merchantOrderId) {
        exportFilters.merchantOrderId = merchantOrderId;
      }
      if (transactionStatus && transactionStatus !== "all") {
        exportFilters.status = transactionStatus;
      }
      if (startDate) {
        exportFilters.createdAtStart = convertToPhilippinesTimezone(
          startDate.toISOString()
        );
      }
      if (endDate) {
        exportFilters.createdAtEnd = convertToPhilippinesTimezone(
          endDate.toISOString()
        );
      }
      if (successStartDate) {
        exportFilters.successAtStart = convertToPhilippinesTimezone(
          successStartDate.toISOString()
        );
      }
      if (successEndDate) {
        exportFilters.successAtEnd = convertToPhilippinesTimezone(
          successEndDate.toISOString()
        );
      }
      if (amount) {
        exportFilters.amount = amount;
      }
      if (amountMin) {
        exportFilters.amountMin = amountMin;
      }
      if (amountMax) {
        exportFilters.amountMax = amountMax;
      }

      const response = await ApiExportTransactions({
        filters: exportFilters,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "匯出Excel失敗");
      }

      // Backend now returns job ID for async processing
      const data = await response.json();
      const { jobId } = data;

      if (!jobId) {
        throw new Error("無法取得匯出工作 ID");
      }

      setCurrentJobId(jobId);
      setOngoingJob({
        jobId,
        userId: "",
        organizationId: organizationId || "",
        jobType: "TRANSACTION_EXPORT",
        status: "PENDING",
        progress: 0,
        progressMessage: null,
        gcsUrl: null,
        error: null,
        metadata: exportFilters,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
        completedAt: null,
      });
      startPolling(jobId);

      toast({
        title: "匯出已開始",
        description: "匯出工作已建立，正在處理中...",
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      toast({
        title: "錯誤",
        description: error instanceof Error ? error.message : "匯出Excel失敗",
        variant: "destructive",
      });
    }
  };

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

        const transactionResponse = await ApiGetTransactions({
          type: transactionTypeQuery,
          merchantId,
          merchantOrderId,
          paymentMethod: paymentMethodQuery,
          paymentChannel: paymentChannelQuery,
          status: transactionStatusQuery,
          internalStatus: transactionInternalStatusQuery,
          createdAtStart: startDateQuery,
          createdAtEnd: endDateQuery,
          successAtStart: successStartDateQuery,
          successAtEnd: successEndDateQuery,
          amount: amount || undefined,
          amountMin: amountMin || undefined,
          amountMax: amountMax || undefined,
          cursorCreatedAt:
            isLoadMore && nextCursor ? nextCursor.createdAt : undefined,
          cursorId: isLoadMore && nextCursor ? nextCursor.id : undefined,
          limit: 30,
          accessToken,
        });
        const data = await transactionResponse.json();

        if (transactionResponse.ok) {
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

        // Get transaction count and sum of amount and fee (only for new search)
        if (!isLoadMore) {
          const transactionCountAndSumOfAmountAndFeeResponse =
            await ApiGetTransactionCountAndSumOfAmountAndFee({
              type: transactionTypeQuery,
              merchantId,
              merchantOrderId,
              paymentMethod: paymentMethodQuery,
              paymentChannel: paymentChannelQuery,
              status: transactionStatusQuery,
              internalStatus: transactionInternalStatusQuery,
              createdAtStart: startDateQuery,
              createdAtEnd: endDateQuery,
              successAtStart: successStartDateQuery,
              successAtEnd: successEndDateQuery,
              amount: amount || undefined,
              amountMin: amountMin || undefined,
              amountMax: amountMax || undefined,
              accessToken,
            });

          const transactionCountAndSumOfAmountAndFeeData =
            await transactionCountAndSumOfAmountAndFeeResponse.json();

          // Ensure data is always an array
          setTransactionCountAndSumOfAmountAndFee(
            Array.isArray(transactionCountAndSumOfAmountAndFeeData)
              ? transactionCountAndSumOfAmountAndFeeData
              : []
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

  const clearSearchByTransactionId = () => {
    setTransactionId("");
  };
  const clearSearchByMultipleConditions = () => {
    setTransactionType("all");
    setPaymentMethod("all");
    setPaymentChannel("all");
    setMerchantId(undefined);
    setMerchantOrderId("");
    setTransactionStatus("all");
    setTransactionInternalStatus("all");
    const today = new Date();
    setStartDate(
      moment.tz(today, PHILIPPINES_TIMEZONE).startOf("day").toDate()
    );
    setEndDate(moment.tz(today, PHILIPPINES_TIMEZONE).endOf("day").toDate());
    setSuccessStartDate(undefined);
    setSuccessEndDate(undefined);
    setAmount("");
    setAmountMin("");
    setAmountMax("");
    setTransactionCountAndSumOfAmountAndFee([]);
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

  const handleCopyToClipboard = (text: string) => {
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
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-900 border border-gray-300 whitespace-nowrap">
            {TransactionTypeDisplayNames[type]}
          </span>
        );
      case TransactionType.API_WITHDRAWAL:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-900 text-white whitespace-nowrap">
            {TransactionTypeDisplayNames[type]}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-900 whitespace-nowrap">
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
              系統訂單號(ltx)<span className="text-red-500">*</span>
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
                      {Object.values(TransactionType).map((type) => {
                        return (
                          <SelectItem key={type} value={type}>
                            {TransactionTypeDisplayNames[type]}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* paymentMethod */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">通道</Label>
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
            {/* paymentChannel */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">上游</Label>
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
            {/* amount */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">金額</Label>
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="精確金額"
              />
            </div>
            {/* amount range */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">金額範圍</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  placeholder="最小金額"
                  className="w-[120px]"
                />
                <span className="text-gray-500">至</span>
                <Input
                  type="text"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  placeholder="最大金額"
                  className="w-[120px]"
                />
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
      <div className="flex justify-between items-center pb-4 gap-4">
        <div className="flex gap-4">
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
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={
            ongoingJob !== null &&
            (ongoingJob.status === "PENDING" ||
              ongoingJob.status === "PROCESSING")
          }
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          {ongoingJob !== null &&
          (ongoingJob.status === "PENDING" ||
            ongoingJob.status === "PROCESSING")
            ? "匯出中..."
            : "匯出 Excel"}
        </Button>
      </div>

      {/* Export Job Status - Only show when processing, not when completed */}
      {(jobStatus || currentJobId) && jobStatus?.status !== "COMPLETED" && (
        <div className="mb-4">
          <ExportJobStatus
            jobStatus={jobStatus}
            onDownload={(url: string) => {
              const filename = `transactions-export-${moment().format(
                "YYYY-MM-DD-HHmm"
              )}.xlsx`;
              downloadFile(url, filename);
            }}
          />
        </div>
      )}

      {/* Export Completion Dialog */}
      <ExportCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        downloadUrl={completedExportUrl || ""}
        filename={completedExportFilename}
        onDownload={downloadFile}
        exportPagePath="/admin/exports?tab=TransactionExports"
      />
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
                  {isLoading
                    ? "查詢中..."
                    : transactions?.length
                    ? "沒有更多訂單紀錄"
                    : "沒有訂單紀錄"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="pb-2 flex-col gap-4">
              <Label className="whitespace-nowrap font-bold text-md">
                {currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID
                  ? "單筆查詢結果: 系統訂單號"
                  : "多筆查詢結果"}
              </Label>
              {currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS &&
                transactionCountAndSumOfAmountAndFee &&
                transactionCountAndSumOfAmountAndFee.length > 0 && (
                  <div className="border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              貨幣
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              總筆數
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              總金額
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              總手續費
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupSummariesByCurrency(
                            transactionCountAndSumOfAmountAndFee
                          ).map((summary) => {
                            const currencySymbol = getCurrencySymbol(
                              summary.currency
                            );
                            return (
                              <tr
                                key={summary.currency}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">
                                    {summary.currency}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {currencySymbol}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-900">
                                  {formatNumberInInteger(summary.count || "0")}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-900">
                                  {`${currencySymbol} ${formatNumber(
                                    summary.amountSum || "0"
                                  )}`}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-900">
                                  {`${currencySymbol} ${formatNumber(
                                    summary.totalFeeSum || "0"
                                  )}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto whitespace-nowrap">
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
                      通道
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      上游
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
                <tbody className="divide-y divide-gray-100 whitespace-nowrap">
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
                          onClick={() => handleCopyToClipboard(transaction.id)}
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
                            handleCopyToClipboard(transaction.merchantOrderId)
                          }
                        >
                          {transaction.merchantOrderId || "N/A"}
                        </div>
                      </td>

                      {/* Merchant/Organization */}
                      <td className="px-4 py-3">
                        <div
                          className="font-mono text-sm text-gray-600 cursor-pointer hover:text-gray-800 whitespace-nowrap"
                          title={`點擊複製: ${transaction.merchantId}`}
                          onClick={() =>
                            handleCopyToClipboard(transaction.merchantId)
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

                      {/* Payment Channel */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {PaymentChannelDisplayNames[
                            transaction.paymentChannel
                          ] || transaction.paymentChannel}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono text-gray-900 whitespace-nowrap">
                          {(() => {
                            const currency = getCurrencyForPaymentMethod(
                              transaction.paymentMethod
                            );
                            const currencySymbol = currency
                              ? getCurrencySymbol(currency)
                              : "₱";
                            return `${currencySymbol} ${formatNumber(
                              transaction.amount
                            )}`;
                          })()}
                        </div>
                      </td>

                      {/* Total Fee */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono text-gray-400 text-sm whitespace-nowrap">
                          {(() => {
                            const currency = getCurrencyForPaymentMethod(
                              transaction.paymentMethod
                            );
                            const currencySymbol = currency
                              ? getCurrencySymbol(currency)
                              : "₱";
                            return `${currencySymbol} ${formatNumber(
                              transaction.totalFee
                            )}`;
                          })()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 whitespace-nowrap">
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
                        <div className="font-mono text-sm text-gray-600 whitespace-nowrap">
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
