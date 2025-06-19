import {
  ManualFrozenAdditionalInfo,
  ManualTransaction,
  ManualTransactionType,
  ManualTransactionTypeDisplayNames,
} from "@/lib/types/manual-transaction";
import {
  PaymentMethod,
  PaymentMethodDisplayNames,
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
  getManualTransactionByIdApi,
  getManualTransactionsApi,
} from "@/lib/apis/manual-transactions-archive";
import { useEffect, useState } from "react";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { formatNumberWithoutMinFraction } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useRouter } from "next/router";
import { useToast } from "@/components/shadcn/ui/use-toast";

const QueryTypes = {
  SEARCH_BY_MANUAL_TRANSACTION_ID: "searchByManualTransactionId",
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

export function ManualTransactionList() {
  const router = useRouter();

  const { toast } = useToast();

  // 1. search by manualTransactionId
  const [manualTransactionId, setManualTransactionId] = useState<string>(
    (router.query.manualTransactionId as string) || ""
  );

  // 2. search by multiple conditions
  const [organizationId, setOrganizationId] = useState<string>("");
  const [manualTransactionType, setManualTransactionType] = useState<
    ManualTransactionType | "all" | "unfrozen"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );

  const [isLoading, setIsLoading] = useState(false);

  const [manualTransactions, setManualTransactions] =
    useState<ManualTransaction[]>();

  const [currentQueryType, setCurrentQueryType] = useState<string>();

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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

    const searchByManualTransactionId = !!manualTransactionId;

    try {
      // 1. search by manualTransactionId
      if (searchByManualTransactionId) {
        const response = await getManualTransactionByIdApi({
          manualTransactionId,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setManualTransactions([data?.manualTransaction]);
          setCurrentQueryType(QueryTypes.SEARCH_BY_MANUAL_TRANSACTION_ID);
        } else {
          throw new ApplicationError(data);
        }
      } else {
        // 3. search by multiple conditions
        const isUnfrozen = manualTransactionType === "unfrozen";

        let manualTransactionTypeQuery;
        if (!manualTransactionType || manualTransactionType === "all") {
          manualTransactionTypeQuery = undefined;
        } else {
          if (isUnfrozen) {
            manualTransactionTypeQuery = ManualTransactionType.MANUAL_FROZEN;
          } else {
            manualTransactionTypeQuery = manualTransactionType;
          }
        }

        const paymentMethodQuery =
          paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined;

        const query = {
          type: manualTransactionTypeQuery,
          organizationId,
          paymentMethod: paymentMethodQuery,
          ...(isUnfrozen && { unfrozen: isUnfrozen }),
        };

        const cursor = isLoadMore && !!nextCursor ? nextCursor : undefined;

        const response = await getManualTransactionsApi({
          query,
          cursor,
          accessToken,
        });
        const data = await response.json();

        if (response.ok) {
          setManualTransactions((prev) =>
            isLoadMore
              ? [...(prev || []), ...(data?.manualTransactions || [])]
              : data?.manualTransactions
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
          title: `${error.statusCode} - 手動訂單查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `手動訂單查詢失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
      setManualTransactions(undefined);
    }

    setIsLoading(false);
    setLoadingMore(false);
  };

  const clearSearchByManualTransactionId = () => {
    setManualTransactionId("");
  };
  const clearSearchByMultipleConditions = () => {
    setManualTransactionType("all");
    setPaymentMethod("all");
    setOrganizationId("");
  };

  const handleClearAll = () => {
    clearSearchByManualTransactionId();
    clearSearchByMultipleConditions();
    setManualTransactions(undefined);
    setCurrentQueryType(undefined);
  };

  useEffect(() => {
    if (!currentQueryType) return;

    if (currentQueryType === QueryTypes.SEARCH_BY_MANUAL_TRANSACTION_ID) {
      clearSearchByMultipleConditions();
    } else {
      clearSearchByManualTransactionId();
    }
  }, [currentQueryType]);

  return (
    <div
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] h-[calc(100vh-56px)] overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* search bar */}
      <div className="flex flex-col divide-y pb-8">
        {/* search by manualTransactionId */}
        <div className="pb-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            單筆查詢: 系統手動訂單號
          </Label>
          {/* manualTransactionId */}
          <div className="flex items-center gap-4 w-full lg:w-fit px-4">
            <Label className="whitespace-nowrap">
              系統手動訂單號(MTX)<span className="text-red-500">*</span>
            </Label>
            <Input
              id="manualTransactionId"
              className="w-full sm:min-w-[220px] font-mono"
              value={manualTransactionId}
              onChange={(e) => setManualTransactionId(e.target.value)}
            />
          </div>
        </div>

        {/* search by multiple conditions */}
        <div className="pt-4 flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            多筆查詢
          </Label>
          <div className="flex gap-4 flex-wrap px-4">
            {/* manualTransactionType */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">類別</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={manualTransactionType}
                  value={manualTransactionType}
                  onValueChange={(value) =>
                    setManualTransactionType(value as ManualTransactionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      <SelectItem value={ManualTransactionType.MANUAL_DEPOSIT}>
                        {
                          ManualTransactionTypeDisplayNames[
                            ManualTransactionType.MANUAL_DEPOSIT
                          ]
                        }
                      </SelectItem>
                      <SelectItem
                        value={ManualTransactionType.MANUAL_WITHDRAWAL}
                      >
                        {
                          ManualTransactionTypeDisplayNames[
                            ManualTransactionType.MANUAL_WITHDRAWAL
                          ]
                        }
                      </SelectItem>
                      <SelectItem value={ManualTransactionType.MANUAL_FROZEN}>
                        {
                          ManualTransactionTypeDisplayNames[
                            ManualTransactionType.MANUAL_FROZEN
                          ]
                        }
                        中
                      </SelectItem>
                      <SelectItem value={"unfrozen"} className="h-8">
                        已解凍
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
            {/* organizationId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">單位 ID</Label>
              <OrganizationSearchBar
                selectedOrganizationId={organizationId}
                setSelectedOrganizationId={setOrganizationId}
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
            dataLength={manualTransactions?.length || 0}
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
                  {manualTransactions?.length
                    ? "沒有更多訂單紀錄"
                    : "沒有訂單紀錄"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="pb-2">
              <Label className="whitespace-nowrap font-bold text-md">
                {currentQueryType === QueryTypes.SEARCH_BY_MANUAL_TRANSACTION_ID
                  ? "單筆查詢結果: 系統手動訂單號"
                  : "多筆查詢結果"}
              </Label>
            </div>
            <div className="flex flex-col border p-2 pb-0 rounded-md overflow-x-scroll">
              <table className="divide-y table-auto text-sm">
                <thead className="whitespace-nowrap w-full">
                  <tr>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      系統手動訂單號
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      類別
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      支付類型
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      單位 ID
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      金額
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
                  {manualTransactions?.map((manualTransaction) => {
                    let type;
                    if (
                      manualTransaction.type ===
                      ManualTransactionType.MANUAL_FROZEN
                    ) {
                      const isUnfrozen = (
                        manualTransaction.additionalInfo as ManualFrozenAdditionalInfo
                      ).unfrozen;
                      type = isUnfrozen ? "已解凍" : "凍結中";
                    } else {
                      type =
                        ManualTransactionTypeDisplayNames[
                          manualTransaction.type
                        ];
                    }

                    return (
                      <tr key={manualTransaction.id}>
                        <td
                          className="px-1 py-2 font-mono text-center cursor-pointer"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              copyingText: manualTransaction.id,
                              title: "已複製系統手動訂單號",
                            })
                          }
                        >
                          {manualTransaction.id}
                        </td>
                        <td className="px-1 py-2 whitespace-nowrap text-center">
                          {type}
                        </td>
                        <td className="px-1 py-2 whitespace-nowrap text-center">
                          {
                            PaymentMethodDisplayNames[
                              manualTransaction.paymentMethod
                            ]
                          }
                        </td>
                        <td
                          className="px-1 py-2 font-mono text-center cursor-pointer"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              copyingText: manualTransaction.organizationId,
                              title: "已複製單位 ID",
                            })
                          }
                        >
                          {manualTransaction.organizationId}
                        </td>
                        <td className="px-1 py-2 text-center">
                          {formatNumberWithoutMinFraction(
                            manualTransaction.amount
                          )}
                        </td>
                        <td className="px-1 py-2 text-center">
                          {convertDatabaseTimeToReadablePhilippinesTime(
                            manualTransaction.createdAt
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
}
