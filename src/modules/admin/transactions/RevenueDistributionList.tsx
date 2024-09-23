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

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "./OrganizationSearchBar";
import { Revenue } from "@/lib/types/revenue";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatNumberWithoutMinFraction } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { getRevenuesApi } from "@/lib/apis/revenues";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

const QueryTypes = {
  SEARCH_BY_MULTIPLE_CONDITIONS: "searchByMultipleConditions",
};

export function RevenueDistributionList() {
  const { toast } = useToast();

  // 2. search by multiple conditions
  const [transactionId, setTransactionId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );

  const [isLoading, setIsLoading] = useState(false);

  const [revenues, setRevenues] = useState<Revenue[]>();

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

    try {
      // 1. search by multiple conditions
      const paymentMethodQuery =
        paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined;

      const query = {
        transactionId,
        organizationId,
        paymentMethod: paymentMethodQuery,
      };

      const cursor = isLoadMore && !!nextCursor ? nextCursor : undefined;

      const response = await getRevenuesApi({
        query,
        cursor,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        setRevenues((prev) =>
          isLoadMore
            ? [...(prev || []), ...(data?.revenues || [])]
            : data?.revenues
        );
        setNextCursor(data?.nextCursor);

        setCurrentQueryType(QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 訂單分潤查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `訂單分潤查詢失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
      setRevenues(undefined);
    }

    setIsLoading(false);
    setLoadingMore(false);
  };

  const clearSearchByMultipleConditions = () => {
    setTransactionId("");
    setOrganizationId("");
    setPaymentMethod("all");
  };

  const handleClearAll = () => {
    clearSearchByMultipleConditions();
    setRevenues(undefined);
    setCurrentQueryType(undefined);
  };

  return (
    <div
      className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll"
      id="scrollableDiv"
    >
      {/* search bar */}
      <div className="flex flex-col divide-y pb-8">
        {/* search by multiple conditions */}
        <div className="flex flex-col gap-4">
          <Label className="whitespace-nowrap font-bold text-md">
            多筆查詢
          </Label>
          <div className="flex items-center gap-4 w-full lg:w-fit flex-wrap px-4">
            {/* transactionId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">系統自動訂單號(TX)</Label>
              <Input
                id="transactionId"
                className="w-full sm:min-w-[220px] font-mono"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            {/* organizationId */}
            <div className="flex items-center gap-4 w-full lg:w-fit">
              <Label className="whitespace-nowrap">單位 ID</Label>
              <OrganizationSearchBar
                selectedOrganizationId={organizationId}
                setSelectedOrganizationId={setOrganizationId}
              />
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
            dataLength={revenues?.length || 0}
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
                  {revenues?.length ? "沒有更多訂單紀錄" : "沒有訂單紀錄"}
                </Label>
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="pb-2">
              <Label className="whitespace-nowrap font-bold text-md">
                {currentQueryType === QueryTypes.SEARCH_BY_MULTIPLE_CONDITIONS
                  ? "多筆查詢結果"
                  : ""}
              </Label>
            </div>
            <div className="flex flex-col border p-2 pb-0 rounded-md overflow-x-scroll">
              <table className="divide-y table-auto text-sm">
                <thead className="whitespace-nowrap w-full">
                  <tr>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      單位 ID
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      通道
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      關聯系統自動訂單號
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      分潤金額
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
                  {revenues?.map((revenue) => (
                    <tr key={revenue.id}>
                      <td
                        className="px-1 py-2 font-mono text-center cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: revenue.organizationId,
                            title: "已複製單位 ID",
                          })
                        }
                      >
                        {revenue.organizationId}
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        {PaymentMethodDisplayNames[revenue.paymentMethod]}
                      </td>
                      <td
                        className="px-1 py-2 font-mono text-center cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: revenue.transactionId,
                            title: "已複製關聯系統自動訂單號",
                          })
                        }
                      >
                        {revenue.id}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {formatNumberWithoutMinFraction(revenue.revenue)}
                      </td>
                      <td className="px-1 py-2 text-center">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          revenue.createdAt
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
    </div>
  );
}
