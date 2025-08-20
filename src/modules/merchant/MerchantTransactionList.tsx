import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiGetTransactionById } from "@/lib/apis/transactions/get";
import { ApiGetTransactionsByMerchantId } from "@/lib/apis/transactions/get";
import { ApiGetTransactionCountAndSumOfAmountAndFee } from "@/lib/apis/transactions/get";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { Transaction } from "@/lib/types/transaction";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionStatusDisplayNames } from "@/lib/constants/transaction";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { cn } from "@/lib/utils/classname-utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import moment from "moment-timezone";
import { useToast } from "@/components/shadcn/ui/use-toast";

const PHILIPPINES_TIMEZONE = "Asia/Manila";

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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusStyle())}>
      {TransactionStatusDisplayNames[status as TransactionStatus] || status}
    </Badge>
  );
};

const TransactionTypeChip = ({ type }: { type: string }) => {
  const getTypeStyle = () => {
    switch (type) {
      case TransactionType.API_DEPOSIT:
        return "bg-blue-100 text-blue-800";
      case TransactionType.API_WITHDRAWAL:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        getTypeStyle()
      )}
    >
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
        <Label className="text-sm font-medium text-slate-700">
          系統訂單號 (luxtx)
        </Label>
        <Input
          placeholder="輸入完整的系統訂單號..."
          value={transactionId}
          onChange={(e) => onTransactionIdChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
          className="font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">商戶訂單號</Label>
        <Input
          placeholder="搜尋商戶訂單號..."
          value={merchantOrderId}
          onChange={(e) => onMerchantOrderIdChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSearch()}
        />
      </div>
    </div>
    <div className="flex justify-center">
      <Button onClick={onSearch} disabled={isLoading} className="min-w-32">
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
        <h3 className="text-sm font-semibold text-slate-900 flex items-center">
          <FunnelIcon className="h-4 w-4 mr-2" />
          進階篩選
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">交易類型</label>
          <Select
            value={filters.transactionType}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                transactionType: value as TransactionType | "all",
              })
            }
          >
            <SelectTrigger>
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
          <label className="text-sm font-medium text-slate-700">支付方式</label>
          <Select
            value={filters.paymentMethod}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                paymentMethod: value as PaymentMethod | "all",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {Object.values(PaymentMethod).map((method) => (
                <SelectItem key={method} value={method}>
                  {PaymentMethodDisplayNames[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">交易狀態</label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value as TransactionStatus | "all",
              })
            }
          >
            <SelectTrigger>
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
          <label className="text-sm font-medium text-slate-700">最小金額</label>
          <Input
            placeholder="0.00"
            value={filters.amountMin}
            onChange={(e) =>
              onFiltersChange({ ...filters, amountMin: e.target.value })
            }
          />
        </div>

        {/* Amount Max */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">最大金額</label>
          <Input
            placeholder="0.00"
            value={filters.amountMax}
            onChange={(e) =>
              onFiltersChange({ ...filters, amountMax: e.target.value })
            }
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">開始時間</label>
          <DateTimePicker
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
          <label className="text-sm font-medium text-slate-700">結束時間</label>
          <DateTimePicker
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
        <Button variant="outline" onClick={onClearFilters}>
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
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">載入中...</p>
        </CardContent>
      </Card>
    );
  }

  if (!transactions.length) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">未找到符合條件的交易記錄</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[
                "訂單號碼",
                "類型",
                "支付方式",
                "金額",
                "狀態",
                "創建時間",
                "完成時間",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    {transaction.merchantOrderId}
                  </div>
                  <div className="text-sm text-slate-500">{transaction.id}</div>
                </td>
                <td className="px-6 py-4">
                  <TransactionTypeChip type={transaction.type} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {PaymentMethodDisplayNames[transaction.paymentMethod]}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    ${formatNumber(transaction.amount)}
                  </div>
                  {transaction.totalFee && (
                    <div className="text-sm text-slate-500">
                      手續費: ${formatNumber(transaction.totalFee)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <TransactionStatusBadge status={transaction.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.createdAt
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
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
    </Card>
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
  const [transactionSummary, setTransactionSummary] = useState<{
    count: string;
    amountSum: string;
    totalFeeSum: string;
  } | null>(null);
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
        setTransactionSummary(data);
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
      setTransactionSummary(null);
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
    setTransactionSummary(null);
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

  const handleExportCSV = () => {
    if (!transactions.length) {
      toast({
        title: "無法匯出",
        description: "沒有數據可以匯出",
        variant: "destructive",
      });
      return;
    }

    // Prepare CSV data
    const headers = [
      "訂單號碼",
      "系統ID",
      "類型",
      "支付方式",
      "金額",
      "手續費",
      "狀態",
      "創建時間",
      "完成時間",
    ];

    const csvData = transactions.map((transaction) => [
      transaction.merchantOrderId,
      transaction.id,
      TransactionTypeDisplayNames[transaction.type] || transaction.type,
      PaymentMethodDisplayNames[transaction.paymentMethod],
      transaction.amount,
      transaction.totalFee || "0",
      TransactionStatusDisplayNames[transaction.status] || transaction.status,
      convertDatabaseTimeToReadablePhilippinesTime(transaction.createdAt),
      transaction.successAt
        ? convertDatabaseTimeToReadablePhilippinesTime(transaction.successAt)
        : "-",
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((field) =>
            typeof field === "string" && field.includes(",")
              ? `"${field}"`
              : field
          )
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions-${moment().format("YYYY-MM-DD-HHmm")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "匯出成功",
      description: `已匯出 ${transactions.length} 筆交易記錄`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        {/* Unified Search */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-slate-900">
              訂單查詢
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                清除全部
              </Button>
              <Button
                variant="outline"
                disabled={!transactions.length}
                onClick={handleExportCSV}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                匯出 CSV
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
        <div className="border-t border-slate-200 pt-6">
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
          <Label className="text-base font-semibold text-slate-900">
            {currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID
              ? "單筆查詢結果: 系統訂單號"
              : "多筆查詢結果"}
          </Label>

          {currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS &&
            transactionSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Count Card */}
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ListBulletIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          總筆數
                        </p>
                        <p className="text-2xl font-bold text-slate-900 font-mono">
                          {transactionSummary.count || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Amount Card */}
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          總金額
                        </p>
                        <p className="text-2xl font-bold text-slate-900 font-mono">
                          ${formatNumber(transactionSummary.amountSum || "0")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Fee Card */}
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <BanknotesIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          總手續費
                        </p>
                        <p className="text-2xl font-bold text-slate-900 font-mono">
                          ${formatNumber(transactionSummary.totalFeeSum || "0")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
        </div>
      )}

      {/* Transaction Table */}
      <TransactionTable transactions={transactions} isLoading={isLoading} />

      {/* Load More Button */}
      {transactions.length > 0 &&
        nextCursor &&
        currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => handleSearch(true)}
              disabled={loadingMore}
              className="min-w-32"
            >
              {loadingMore ? "載入中..." : "載入更多"}
            </Button>
          </div>
        )}
    </div>
  );
}
