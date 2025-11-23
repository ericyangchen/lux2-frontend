import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { Button } from "@/components/shadcn/ui/button";
import { DatePicker } from "@/components/DatePicker";
import { MerchantDatePicker } from "@/components/MerchantDatePicker";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { PHILIPPINES_TIMEZONE } from "@/lib/utils/timezone";
import * as moment from "moment-timezone";
import { useState } from "react";

interface BalanceReportFormProps {
  organizationId?: string;
  setOrganizationId?: (id: string) => void;
  paymentMethod: PaymentMethod | "";
  setPaymentMethod: (method: PaymentMethod) => void;
  date: string;
  setDate: (date: string) => void;
  onGenerateReport: () => void;
  onExportExcel: () => void;
  isLoading: boolean;
  showOrganizationSelector?: boolean;
}

export function BalanceReportForm({
  organizationId,
  setOrganizationId,
  paymentMethod,
  setPaymentMethod,
  date,
  setDate,
  onGenerateReport,
  onExportExcel,
  isLoading,
  showOrganizationSelector = false,
}: BalanceReportFormProps) {
  const isFormValid = () => {
    if (showOrganizationSelector && !organizationId) return false;
    return paymentMethod && date;
  };

  // Check if this is merchant usage (no organization selector)
  const isMerchant = !showOrganizationSelector;
  
  return (
    <div className={`bg-white border border-gray-200 p-6 space-y-4 w-full ${isMerchant ? '' : 'rounded-lg'}`}>
      <div className="flex flex-wrap gap-4">
        {/* Organization Selector - Only show for admin */}
        {showOrganizationSelector && setOrganizationId && (
          <div className="space-y-2 min-w-[200px]">
            <Label className="font-medium">
              選擇組織 <span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={organizationId}
              setSelectedOrganizationId={setOrganizationId}
            />
          </div>
        )}

        {/* Payment Method */}
        <div className="space-y-2 min-w-[200px] ">
          <Label className="font-medium">
            通道 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <SelectTrigger className={isMerchant ? "border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none" : ""}>
              <SelectValue placeholder="選擇通道" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PaymentMethodDisplayNames[method]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2 min-w-[160px] flex-1">
          <Label className="font-medium">
            日期 <span className="text-red-500">*</span>
          </Label>
          {isMerchant ? (
            <MerchantDatePicker
              date={
                date
                  ? moment.tz(date, "YYYY-MM-DD", PHILIPPINES_TIMEZONE).toDate()
                  : undefined
              }
              setDate={(selectedDate) => {
                if (selectedDate) {
                  // Extract date parts from Philippines timezone
                  const phMoment = moment.tz(selectedDate, PHILIPPINES_TIMEZONE);
                  const formattedDate = phMoment.format("YYYY-MM-DD");
                  setDate(formattedDate);
                } else {
                  setDate("");
                }
              }}
              placeholder="選擇日期"
            />
          ) : (
            <DatePicker
              date={date ? new Date(date) : undefined}
              setDate={(selectedDate) => {
                if (selectedDate) {
                  // Format as YYYY-MM-DD in local timezone to avoid UTC conversion issues
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(selectedDate.getDate()).padStart(2, "0");
                  const formattedDate = `${year}-${month}-${day}`;
                  setDate(formattedDate);
                } else {
                  setDate("");
                }
              }}
              placeholder="選擇日期"
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={onGenerateReport}
          disabled={!isFormValid() || isLoading}
          className={`min-w-[120px] ${isMerchant ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none' : ''}`}
        >
          {isLoading ? "生成中..." : "生成報表"}
        </Button>

        <Button
          onClick={onExportExcel}
          disabled={!isFormValid() || isLoading}
          variant="outline"
          className={`min-w-[120px] ${isMerchant ? 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none' : ''}`}
        >
          {isLoading ? "匯出中..." : "匯出Excel"}
        </Button>
      </div>
    </div>
  );
}
