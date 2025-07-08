import * as moment from "moment-timezone";

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
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiGetOrganizationBalanceModifications } from "@/lib/apis/balance-modifications/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { BalanceAction } from "@/lib/enums/balances/balance-action.enum";
import { BalanceActionDisplayNames } from "@/lib/constants/balance-record";
import { BalanceRecord } from "@/lib/types/balance-record";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { currencySymbol } from "@/lib/constants/common";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

const formatDateTime = (dateString: string) => {
  return convertDatabaseTimeToReadablePhilippinesTime(dateString);
};

const getActionColor = (action: string) => {
  switch (action) {
    case BalanceAction.DIRECT_MODIFY_ADD_BALANCE:
      return "text-green-600";
    case BalanceAction.DIRECT_MODIFY_SUBTRACT_BALANCE:
      return "text-red-600";
    case BalanceAction.FREEZE_BALANCE:
      return "text-blue-600";
    case BalanceAction.UNFREEZE_BALANCE:
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

export function AdminBalanceModificationList() {
  const { toast } = useToast();

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">(
    "all"
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).startOf("day").toDate();
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return moment.tz(today, PHILIPPINES_TIMEZONE).endOf("day").toDate();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [modifications, setModifications] = useState<BalanceRecord[]>();

  const handleSearch = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !selectedOrganizationId) {
      toast({
        title: "錯誤",
        description: "請選擇機構並確保已登入",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const paymentMethodQuery =
        paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined;
      const startDateQuery = startDate
        ? convertToPhilippinesTimezone(startDate.toISOString())
        : undefined;
      const endDateQuery = endDate
        ? convertToPhilippinesTimezone(endDate.toISOString())
        : undefined;

      const response = await ApiGetOrganizationBalanceModifications({
        organizationId: selectedOrganizationId,
        paymentMethod: paymentMethodQuery,
        createdAtStart: startDateQuery,
        createdAtEnd: endDateQuery,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        setModifications(data.modifications || []);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "搜尋失敗",
        description:
          error instanceof ApplicationError ? error.message : "未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">餘額異動記錄 (管理)</h1>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">搜尋條件</h2>

        {/* Organization Selection */}
        <div className="space-y-2">
          <Label className="font-medium">選擇單位</Label>
          <OrganizationSearchBar
            selectedOrganizationId={selectedOrganizationId}
            setSelectedOrganizationId={setSelectedOrganizationId}
            organizationType={OrgType.MERCHANT}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-2 max-w-xs">
          <Label className="font-medium">支付方式</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as PaymentMethod | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇支付方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">全部</SelectItem>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PaymentMethodDisplayNames[method]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <div className="flex flex-col gap-2 flex-1">
            <Label className="font-medium">時間區間</Label>
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
        </div>

        {/* Search Button */}
        <div className="flex">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !selectedOrganizationId}
            className="px-8"
          >
            {isLoading ? "搜尋中..." : "搜尋"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {modifications && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">搜尋結果</h3>
            <p className="text-sm text-gray-600">
              共找到 {modifications.length} 筆記錄
            </p>
          </div>

          {modifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              沒有找到符合條件的餘額異動記錄
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      操作類型
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      支付方式
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      可用餘額變動
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      凍結餘額變動
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">
                      備註
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-700">
                      建立時間
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modifications.map((modification) => (
                    <tr key={modification.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${getActionColor(
                            modification.action
                          )}`}
                        >
                          {BalanceActionDisplayNames[modification.action]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {PaymentMethodDisplayNames[modification.paymentMethod]}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {modification.availableAmountChanged && (
                          <span className="font-mono">
                            {currencySymbol}{" "}
                            {modification.availableAmountChanged.startsWith("-")
                              ? ""
                              : "+"}
                            {formatNumber(modification.availableAmountChanged)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {modification.frozenAmountChanged && (
                          <span className="font-mono">
                            {modification.frozenAmountChanged.startsWith("-")
                              ? ""
                              : "+"}
                            {currencySymbol}
                            {formatNumber(modification.frozenAmountChanged)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs text-center">
                          {modification.metadata?.notes && (
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={modification.metadata.notes}
                            >
                              {modification.metadata.notes}
                            </div>
                          )}
                          {modification.metadata?.referenceId && (
                            <div className="text-xs text-gray-400 font-mono">
                              參考ID: {modification.metadata.referenceId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="font-mono text-sm text-gray-600 whitespace-nowrap">
                          {formatDateTime(modification.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
