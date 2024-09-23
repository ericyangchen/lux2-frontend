import {
  PaymentChannel,
  PaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethod,
  PaymentMethodDisplayNames,
  Transaction,
  TransactionStatus,
  TransactionStatusDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import {
  getTransactionByIdApi,
  getTransactionByMerchantOrderIdApi,
  getTransactionsApi,
} from "@/lib/apis/transactions";
import { useEffect, useState } from "react";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "./OrganizationSearchBar";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatNumberWithoutMinFraction } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { useRouter } from "next/router";
import { useToast } from "@/components/shadcn/ui/use-toast";

const QueryTypes = {
  SEARCH_BY_TRANSACTION_ID: "searchByTransactionId",
  SEARCH_BY_MERCHANT_ORDER_ID: "searchByMerchantOrderId",
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

export function ApiTransactionList() {
  const router = useRouter();

  const { toast } = useToast();

  // 1. search by transactionId
  const [transactionId, setTransactionId] = useState<string>(
    (router.query.transactionId as string) || ""
  );

  // 2. search by merchantId & merchantOrderId
  const [merchantId, setMerchantId] = useState<string>("");
  const [merchantOrderId, setMerchantOrderId] = useState<string>("");

  // 3. search by multiple conditions
  const [transactionType, setTransactionType] = useState<
    TransactionType | "all"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | "all">(
    "all"
  );
  const [multipleConditionMerchantId, setMultipleConditionMerchantId] =
    useState<string>();
  const [transactionStatus, setTransactionStatus] = useState<
    TransactionStatus | "all"
  >("all");

  const [isLoading, setIsLoading] = useState(false);

  const filteredPaymentChannels =
    paymentMethod && paymentMethod !== "all"
      ? PaymentChannelCategories[paymentMethod]
      : Object.values(PaymentChannel);

  const [transactions, setTransactions] = useState<Transaction[]>();

  const [currentQueryType, setCurrentQueryType] = useState<string>();

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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

    const searchById = !!transactionId;
    const searchByMerchantOrderId = !!merchantId && !!merchantOrderId;

    try {
      // 1. search by transactionId
      if (searchById) {
        const response = await getTransactionByIdApi({
          transactionId,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions([data?.transaction]);
          setCurrentQueryType(QueryTypes.SEARCH_BY_TRANSACTION_ID);
        } else {
          throw new ApplicationError(data);
        }
      } else if (searchByMerchantOrderId) {
        // 2. search by merchantId & merchantOrderId
        const response = await getTransactionByMerchantOrderIdApi({
          merchantId,
          merchantOrderId,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions([data?.transaction]);
          setCurrentQueryType(QueryTypes.SEARCH_BY_MERCHANT_ORDER_ID);
        } else {
          throw new ApplicationError(data);
        }
      } else {
        // 3. search by multiple conditions
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

        const query = {
          type: transactionTypeQuery,
          merchantId: multipleConditionMerchantId,
          paymentMethod: paymentMethodQuery,
          paymentChannel: paymentChannelQuery,
          status: transactionStatusQuery,
        };

        const cursor = isLoadMore && !!nextCursor ? nextCursor : undefined;

        const response = await getTransactionsApi({
          query,
          cursor,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setTransactions((prev) =>
            isLoadMore
              ? [...(prev || []), ...(data?.transactions || [])]
              : data?.transactions
          );
          setNextCursor(data?.nextCursor);

          setCurrentQueryType(QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS);
        } else {
          throw new ApplicationError(data);
        }
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 自動訂單查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `自動訂單查詢失敗`,
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
  const clearSearchByMerchantOrderId = () => {
    setMerchantId("");
    setMerchantOrderId("");
  };
  const clearSearchByMultipleConditions = () => {
    setTransactionType("all");
    setPaymentMethod("all");
    setPaymentChannel("all");
    setMultipleConditionMerchantId("");
    setTransactionStatus("all");
  };

  const handleClearAll = () => {
    clearSearchByTransactionId();
    clearSearchByMerchantOrderId();
    clearSearchByMultipleConditions();
    setTransactions(undefined);
    setCurrentQueryType(undefined);
  };

  useEffect(() => {
    if (!currentQueryType) return;

    if (currentQueryType === QueryTypes.SEARCH_BY_TRANSACTION_ID) {
      clearSearchByMerchantOrderId();
      clearSearchByMultipleConditions();
    } else if (currentQueryType === QueryTypes.SEARCH_BY_MERCHANT_ORDER_ID) {
      clearSearchByTransactionId();
      clearSearchByMultipleConditions();
    } else {
      clearSearchByTransactionId();
      clearSearchByMerchantOrderId();
    }
  }, [currentQueryType]);

  return (
    <div
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* search bar */}
      <div className="flex flex-col divide-y pb-8">
        {/* search by transactionId */}
        <div className="pb-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            單筆查詢: 系統自動訂單號
          </Label>
          {/* transactionId */}
          <div className="flex items-center gap-4 w-full lg:w-fit px-4">
            <Label className="whitespace-nowrap">
              系統自動訂單號(TX)<span className="text-red-500">*</span>
            </Label>
            <Input
              id="transactionId"
              className="w-full sm:min-w-[220px] font-mono"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
        </div>

        {/* search by: merchantId & merchantOrderId */}
        <div className="py-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            單筆查詢: 商戶訂單號
          </Label>
          <div className="flex flex-wrap gap-4 px-4">
            {/* merchantId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">
                單位 ID<span className="text-red-500">*</span>
              </Label>
              <OrganizationSearchBar
                selectedOrganizationId={merchantId}
                setSelectedOrganizationId={setMerchantId}
              />
            </div>
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
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      <SelectItem value={TransactionType.DEPOSIT}>
                        {TransactionTypeDisplayNames[TransactionType.DEPOSIT]}
                      </SelectItem>
                      <SelectItem value={TransactionType.WITHDRAWAL}>
                        {
                          TransactionTypeDisplayNames[
                            TransactionType.WITHDRAWAL
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
              <Label className="whitespace-nowrap">渠道</Label>
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
            {/* multipleConditionMerchantId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">單位 ID</Label>
              <OrganizationSearchBar
                selectedOrganizationId={multipleConditionMerchantId}
                setSelectedOrganizationId={setMultipleConditionMerchantId}
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
                  ? "單筆查詢結果: 系統自動訂單號"
                  : currentQueryType === QueryTypes.SEARCH_BY_MERCHANT_ORDER_ID
                  ? "單筆查詢結果: 商戶訂單號"
                  : "多筆查詢結果"}
              </Label>
            </div>
            <div className="flex flex-col border p-2 pb-0 rounded-md overflow-x-scroll">
              <table className="divide-y table-auto text-sm">
                <thead className="whitespace-nowrap w-full">
                  <tr>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      系統自動訂單號
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      類別
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      通道
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      渠道
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      單位 ID
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      商戶訂單號
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      金額
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      餘額變動
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      狀態
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      交易進行階段
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      創建時間
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      更多資訊
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions?.map((transaction) => (
                    <tr key={transaction.id}>
                      <td
                        className="px-1 py-2 font-mono text-center cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: transaction.id,
                            title: "已複製系統自動訂單號",
                          })
                        }
                      >
                        {transaction.id}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {TransactionTypeDisplayNames[transaction.type]}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {PaymentMethodDisplayNames[transaction.paymentMethod]}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {PaymentChannelDisplayNames[transaction.paymentChannel]}
                      </td>
                      <td
                        className="px-1 py-2 font-mono text-center cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: transaction.merchantId,
                            title: "已複製單位 ID",
                          })
                        }
                      >
                        {transaction.merchantId}
                      </td>
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
                      <td className="px-1 py-2 text-center">
                        {formatNumberWithoutMinFraction(transaction.amount)}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {formatNumberWithoutMinFraction(
                          transaction.balanceChanged
                        )}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {TransactionStatusDisplayNames[transaction.status]}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {transaction.phase}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          transaction.createdAt
                        )}
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          className="rounded-md p-2 text-center"
                          variant="outline"
                          onClick={() => {
                            // setChannelSettings((prev) =>
                            //   prev.filter((_, index) => index !== idx)
                            // );
                          }}
                        >
                          <InformationCircleIcon className="h-5" />
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
    </div>
  );
}
