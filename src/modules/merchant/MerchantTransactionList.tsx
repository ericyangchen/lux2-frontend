import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiGetTransactionById } from "@/lib/apis/transactions/get";
import { ApiGetTransactionCountAndSumOfAmountAndFee } from "@/lib/apis/transactions/get";
import { ApiGetTransactionsByMerchantId } from "@/lib/apis/transactions/get";
import {
  ApiExportTransactionsByMerchantId,
  ApiGetMerchantExportJobStatus,
  ExportTransactionsDto,
  JobStatus as TransactionJobStatus,
} from "@/lib/apis/transactions/export";
import { ExportCompletionDialog } from "@/components/export/ExportCompletionDialog";
import { ExportJobStatus } from "@/components/export/ExportJobStatus";
import { useExportJob } from "@/lib/hooks/use-export-job";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { MerchantDateTimePicker } from "@/components/MerchantDateTimePicker";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import {
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
} from "@/lib/constants/transaction";
import { Transaction } from "@/lib/types/transaction";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionStatusDisplayNames } from "@/lib/constants/transaction";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { cn } from "@/lib/utils/classname-utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import moment from "moment-timezone";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { Calculator } from "@/lib/utils/calculator";
import { getCurrencySymbol } from "@/lib/utils/currency";

const PHILIPPINES_TIMEZONE = "Asia/Manila";

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

const QueryTypes = {
  SEARCH_BY_TRANSACTION_ID: "searchByTransactionId",
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

interface SearchFilters {
  merchantOrderId: string;
  transactionType: TransactionType | "all";
  paymentMethod: PaymentMethod | "all";
  status: TransactionStatus | "all";
  amountMin: string;
  amountMax: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const TransactionStatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <span
      className={cn("px-2 py-0.5 text-xs font-medium border", getStatusStyle())}
    >
      {TransactionStatusDisplayNames[status as TransactionStatus] || status}
    </span>
  );
};

const TransactionTypeChip = ({ type }: { type: string }) => {
  return (
    <span className="px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-300 bg-gray-50">
      {TransactionTypeDisplayNames[type as TransactionType] || type}
    </span>
  );
};

const UnifiedSearchBar = ({
  transactionId,
  merchantOrderId,
  onTransactionIdChange,
  onMerchantOrderIdChange,
  onSearch,
  isLoading,
}: {
  transactionId: string;
  merchantOrderId: string;
  onTransactionIdChange: (value: string) => void;
  onMerchantOrderIdChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">
          系統訂單號 (atx)
        </Label>
        <Input
          placeholder="輸入完整的系統訂單號..."
          value={transactionId}
          onChange={(e) => onTransactionIdChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
          className="font-mono border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">商戶訂單號</Label>
        <Input
          placeholder="搜尋商戶訂單號..."
          value={merchantOrderId}
          onChange={(e) => onMerchantOrderIdChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
          className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
        />
      </div>
    </div>
    <div className="flex justify-center">
      <Button
        onClick={onSearch}
        disabled={isLoading}
        className="min-w-32 border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none font-medium rounded-none"
      >
        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
        {isLoading ? "搜尋中..." : "搜尋"}
      </Button>
    </div>
  </div>
);

const FilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide flex items-center">
          <FunnelIcon className="h-4 w-4 mr-2" />
          進階篩選
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">交易類型</label>
          <Select
            value={filters.transactionType}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                transactionType: value as TransactionType | "all",
              })
            }
          >
            <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value={TransactionType.API_DEPOSIT}>
                {TransactionTypeDisplayNames[TransactionType.API_DEPOSIT]}
              </SelectItem>
              <SelectItem value={TransactionType.API_WITHDRAWAL}>
                {TransactionTypeDisplayNames[TransactionType.API_WITHDRAWAL]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">通道</label>
          <Select
            value={filters.paymentMethod}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                paymentMethod: value as PaymentMethod | "all",
              })
            }
          >
            <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">全部</SelectItem>
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

        {/* Transaction Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">交易狀態</label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as TransactionStatus | "all",
              })
            }
          >
            <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {Object.values(TransactionStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {TransactionStatusDisplayNames[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Amount Min */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">最小金額</label>
          <Input
            placeholder="0.00"
            value={filters.amountMin}
            onChange={(e) =>
              onFiltersChange({ ...filters, amountMin: e.target.value })
            }
            className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
          />
        </div>

        {/* Amount Max */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">最大金額</label>
          <Input
            placeholder="0.00"
            value={filters.amountMax}
            onChange={(e) =>
              onFiltersChange({ ...filters, amountMax: e.target.value })
            }
            className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">開始時間</label>
          <MerchantDateTimePicker
            date={filters.startDate}
            setDate={(date) =>
              onFiltersChange({
                ...filters,
                startDate: date,
              })
            }
            placeholder="yyyy/mm/dd HH:mm:ss"
            onChange={(date) =>
              onFiltersChange({
                ...filters,
                startDate: date,
              })
            }
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">結束時間</label>
          <MerchantDateTimePicker
            date={filters.endDate}
            setDate={(date) =>
              onFiltersChange({
                ...filters,
                endDate: date,
              })
            }
            placeholder="yyyy/mm/dd HH:mm:ss"
            onChange={(date) =>
              onFiltersChange({
                ...filters,
                endDate: date,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
        >
          清除篩選
        </Button>
      </div>
    </div>
  );
};

const TransactionTable = ({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="border border-gray-200 bg-white">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="border border-gray-200 bg-white">
        <div className="p-8 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">未找到符合條件的交易記錄</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "訂單號碼",
                "類型",
                "通道",
                "金額",
                "狀態",
                "創建時間",
                "完成時間",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {transaction.merchantOrderId}
                  </div>
                  <div className="text-sm text-gray-500">{transaction.id}</div>
                </td>
                <td className="px-6 py-4">
                  <TransactionTypeChip type={transaction.type} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {PaymentMethodDisplayNames[transaction.paymentMethod]}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
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
                  {transaction.totalFee && (
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const currency = getCurrencyForPaymentMethod(
                          transaction.paymentMethod
                        );
                        const currencySymbol = currency
                          ? getCurrencySymbol(currency)
                          : "₱";
                        return `手續費: ${currencySymbol} ${formatNumber(
                          transaction.totalFee
                        )}`;
                      })()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <TransactionStatusBadge status={transaction.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.createdAt
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
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
    </div>
  );
};

export function MerchantTransactionList() {
  const { toast } = useToast();
  const { organizationId, accessToken } = getApplicationCookies();

  // Unified search state
  const [transactionId, setTransactionId] = useState("");
  const [merchantOrderId, setMerchantOrderId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<
    Array<{
      paymentMethod: PaymentMethod;
      count: string;
      amountSum: string;
      totalFeeSum: string;
    }>
  >([]);
  const [nextCursor, setNextCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [currentQueryType, setCurrentQueryType] = useState<string>();
  const [filters, setFilters] = useState<SearchFilters>({
    merchantOrderId: "",
    transactionType: "all",
    paymentMethod: "all",
    status: "all",
    amountMin: "",
    amountMax: "",
    startDate: moment.tz(PHILIPPINES_TIMEZONE).startOf("day").toDate(),
    endDate: moment.tz(PHILIPPINES_TIMEZONE).endOf("day").toDate(),
  });
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
      if (!organizationId) throw new Error("Organization ID is required");
      return ApiGetMerchantExportJobStatus({
        merchantId: organizationId,
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

  // Fetch transaction summary for multiple conditions search
  const fetchTransactionSummary = async () => {
    if (!organizationId || !accessToken) return;

    try {
      const params: any = {
        merchantId: organizationId,
        accessToken,
      };

      // Add the same filters as the main search
      if (merchantOrderId.trim()) {
        params.merchantOrderId = merchantOrderId;
      }
      if (filters.transactionType !== "all")
        params.type = filters.transactionType;
      if (filters.paymentMethod !== "all")
        params.paymentMethod = filters.paymentMethod;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.amountMin) params.amountMin = filters.amountMin;
      if (filters.amountMax) params.amountMax = filters.amountMax;
      if (filters.startDate) {
        params.createdAtStart = moment(filters.startDate)
          .tz(PHILIPPINES_TIMEZONE)
          .toISOString();
      }
      if (filters.endDate) {
        params.createdAtEnd = moment(filters.endDate)
          .tz(PHILIPPINES_TIMEZONE)
          .toISOString();
      }

      const response = await ApiGetTransactionCountAndSumOfAmountAndFee(params);

      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        setTransactionSummary(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch transaction summary:", error);
    }
  };

  const handleSearch = async (isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setNextCursor(null);
      setTransactions([]);
      setTransactionSummary([]);
    } else {
      setLoadingMore(true);
    }

    const searchById = !!transactionId;

    try {
      if (searchById) {
        // 1. Search by transaction ID
        const response = await ApiGetTransactionById({
          id: transactionId,
          accessToken: accessToken!,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions([data]);
          setNextCursor(null);
          setCurrentQueryType(QueryTypes.SEARCH_BY_TRANSACTION_ID);
        } else {
          throw new Error("找不到該交易");
        }
      } else {
        // 2. Search by multiple conditions (including quick search)
        const params: any = {
          merchantId: organizationId!,
          limit: 30,
          accessToken: accessToken!,
        };

        // Merchant order ID search
        if (merchantOrderId.trim()) {
          params.merchantOrderId = merchantOrderId;
        }

        // Advanced filters
        if (filters.transactionType !== "all")
          params.type = filters.transactionType;
        if (filters.paymentMethod !== "all")
          params.paymentMethod = filters.paymentMethod;
        if (filters.status !== "all") params.status = filters.status;
        if (filters.amountMin) params.amountMin = filters.amountMin;
        if (filters.amountMax) params.amountMax = filters.amountMax;
        if (filters.startDate) {
          params.createdAtStart = moment(filters.startDate)
            .tz(PHILIPPINES_TIMEZONE)
            .toISOString();
        }
        if (filters.endDate) {
          params.createdAtEnd = moment(filters.endDate)
            .tz(PHILIPPINES_TIMEZONE)
            .toISOString();
        }

        // Add cursor for pagination
        if (isLoadMore && nextCursor) {
          params.cursorCreatedAt = nextCursor.createdAt;
          params.cursorId = nextCursor.id;
        }

        const response = await ApiGetTransactionsByMerchantId(params);

        if (response.ok) {
          const data = await response.json();
          setTransactions((prev) =>
            isLoadMore ? [...prev, ...(data.data || [])] : data.data || []
          );
          setNextCursor(data.pagination?.nextCursor || null);
          setCurrentQueryType(QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS);

          // Fetch summary only for new searches (not load more)
          if (!isLoadMore) {
            await fetchTransactionSummary();
          }
        } else {
          throw new Error("搜尋失敗");
        }
      }
    } catch (error) {
      toast({
        title: "搜尋失敗",
        description: error instanceof Error ? error.message : "請稍後再試",
        variant: "destructive",
      });
    } finally {
      if (!isLoadMore) {
        setIsLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleClearAll = () => {
    setTransactionId("");
    setMerchantOrderId("");
    setFilters({
      merchantOrderId: "",
      transactionType: "all",
      paymentMethod: "all",
      status: "all",
      amountMin: "",
      amountMax: "",
      startDate: moment.tz(PHILIPPINES_TIMEZONE).startOf("day").toDate(),
      endDate: moment.tz(PHILIPPINES_TIMEZONE).endOf("day").toDate(),
    });
    setTransactions([]);
    setCurrentQueryType(undefined);
    setNextCursor(null);
    setTransactionSummary([]);
  };

  const handleClearFilters = () => {
    setFilters({
      merchantOrderId: "",
      transactionType: "all",
      paymentMethod: "all",
      status: "all",
      amountMin: "",
      amountMax: "",
      startDate: moment.tz(PHILIPPINES_TIMEZONE).startOf("day").toDate(),
      endDate: moment.tz(PHILIPPINES_TIMEZONE).endOf("day").toDate(),
    });
    setTransactions([]);
    setNextCursor(null);
  };

  const handleExportExcel = async () => {
    if (!organizationId || !accessToken) {
      toast({
        title: "錯誤",
        description: "請重新登入",
        variant: "destructive",
      });
      return;
    }

    try {
      // Build export filters from current search state
      const exportFilters: ExportTransactionsDto = {
        merchantId: organizationId,
      };

      // Add filters from current form state or merchantOrderId
      if (merchantOrderId) {
        exportFilters.merchantOrderId = merchantOrderId;
      } else {
        if (filters.transactionType && filters.transactionType !== "all") {
          exportFilters.type = filters.transactionType;
        }
        if (filters.paymentMethod && filters.paymentMethod !== "all") {
          exportFilters.paymentMethod = filters.paymentMethod;
        }
        if (filters.status && filters.status !== "all") {
          exportFilters.status = filters.status;
        }
        if (filters.amountMin) {
          exportFilters.amountMin = filters.amountMin;
        }
        if (filters.amountMax) {
          exportFilters.amountMax = filters.amountMax;
        }
        if (filters.startDate) {
          exportFilters.createdAtStart = moment
            .tz(filters.startDate, PHILIPPINES_TIMEZONE)
            .startOf("day")
            .toISOString();
        }
        if (filters.endDate) {
          exportFilters.createdAtEnd = moment
            .tz(filters.endDate, PHILIPPINES_TIMEZONE)
            .endOf("day")
            .toISOString();
        }
      }

      const response = await ApiExportTransactionsByMerchantId({
        merchantId: organizationId,
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
        organizationId,
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

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white border border-gray-200 p-6 space-y-6">
        {/* Unified Search */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              訂單管理
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
              >
                清除全部
              </Button>
              <Button
                variant="outline"
                disabled={
                  ongoingJob !== null &&
                  (ongoingJob.status === "PENDING" ||
                    ongoingJob.status === "PROCESSING")
                }
                onClick={handleExportExcel}
                className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {ongoingJob !== null &&
                (ongoingJob.status === "PENDING" ||
                  ongoingJob.status === "PROCESSING")
                  ? "匯出中..."
                  : "匯出 Excel"}
              </Button>
            </div>
          </div>

          <UnifiedSearchBar
            transactionId={transactionId}
            merchantOrderId={merchantOrderId}
            onTransactionIdChange={setTransactionId}
            onMerchantOrderIdChange={setMerchantOrderId}
            onSearch={() => handleSearch()}
            isLoading={isLoading}
          />
        </div>

        {/* Advanced Filters */}
        <div className="border-t border-gray-200 pt-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID
              ? "單筆查詢結果: 系統訂單號"
              : "多筆查詢結果"}
          </h2>

          {currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS &&
            transactionSummary.length > 0 && (
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
                      {groupSummariesByCurrency(transactionSummary).map(
                        (summary) => {
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
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Transaction Table */}
      <TransactionTable transactions={transactions} isLoading={isLoading} />

      {/* Export Job Status - Only show when processing, not when completed */}
      {(jobStatus || currentJobId) && jobStatus?.status !== "COMPLETED" && (
        <div className="mt-4">
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
        exportPagePath="/merchant/exports?tab=TransactionExports"
      />

      {/* Load More Button */}
      {transactions.length > 0 &&
        nextCursor &&
        currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => handleSearch(true)}
              disabled={loadingMore}
              className="min-w-32 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none"
            >
              {loadingMore ? "載入中..." : "載入更多"}
            </Button>
          </div>
        )}
    </div>
  );
}
