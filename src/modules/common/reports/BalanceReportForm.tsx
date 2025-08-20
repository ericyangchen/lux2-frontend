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
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "@/modules/admin/common/OrganizationSearchBar";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
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

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4 w-full">
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
            支付方式 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇支付方式" />
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={onGenerateReport}
          disabled={!isFormValid() || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "生成中..." : "生成報表"}
        </Button>

        <Button
          onClick={onExportExcel}
          disabled={!isFormValid() || isLoading}
          variant="outline"
          className="min-w-[120px]"
        >
          {isLoading ? "匯出中..." : "匯出Excel"}
        </Button>
      </div>
    </div>
  );
}
