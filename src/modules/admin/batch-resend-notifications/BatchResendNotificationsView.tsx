import {
  ApiBatchResendNotifications,
  BatchResendNotificationsResponse,
} from "@/lib/apis/txn-notifications/post";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { convertToPhilippinesTimezone } from "@/lib/utils/timezone";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function BatchResendNotificationsView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  const [organizationId, setOrganizationId] = useState<string>("");
  const [successAtStart, setSuccessAtStart] = useState<Date | undefined>();
  const [successAtEnd, setSuccessAtEnd] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BatchResendNotificationsResponse | null>(
    null
  );

  if (!accessToken) {
    return <div>請先登入</div>;
  }

  const handleBatchResend = async () => {
    if (!organizationId) {
      toast({
        title: "錯誤",
        description: "請選擇組織",
        variant: "destructive",
      });
      return;
    }

    if (!successAtStart || !successAtEnd) {
      toast({
        title: "錯誤",
        description: "請選擇開始和結束時間",
        variant: "destructive",
      });
      return;
    }

    if (successAtStart >= successAtEnd) {
      toast({
        title: "錯誤",
        description: "開始時間必須小於結束時間",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await ApiBatchResendNotifications({
        data: {
          organizationId,
          successAtStart: convertToPhilippinesTimezone(
            successAtStart.toISOString()
          ),
          successAtEnd: convertToPhilippinesTimezone(
            successAtEnd.toISOString()
          ),
        },
        accessToken,
      });

      const responseData = await response.json();

      if (response.ok) {
        setResult(responseData);
        toast({
          title: "成功",
          description: `批量重送完成：成功重送 ${responseData.data.notificationsResent} 個通知`,
        });
      } else {
        throw new ApplicationError(responseData);
      }
    } catch (error) {
      console.error("Batch resend failed:", error);
      toast({
        title: "批量重送失敗",
        description:
          error instanceof ApplicationError ? error.message : "未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = organizationId && successAtStart && successAtEnd;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Form Section */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold">批量重送回調設定</h2>

        <div className="space-y-4">
          {/* Organization Selection */}
          <div className="space-y-2">
            <Label className="font-medium">
              選擇組織 <span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={organizationId}
              setSelectedOrganizationId={setOrganizationId}
              organizationType={OrgType.MERCHANT}
            />
          </div>

          {/* Time Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">
                成功時間開始 <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={successAtStart}
                setDate={setSuccessAtStart}
                placeholder="選擇開始時間"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                成功時間結束 <span className="text-red-500">*</span>
              </Label>
              <DateTimePicker
                date={successAtEnd}
                setDate={setSuccessAtEnd}
                placeholder="選擇結束時間"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={handleBatchResend}
              disabled={!isFormValid || isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? "處理中..." : "批量回調"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">執行結果</h2>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">總交易數</div>
              <div className="text-2xl font-bold text-blue-700">
                {result.data.totalTransactionsFound}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">成功重送</div>
              <div className="text-2xl font-bold text-green-700">
                {result.data.notificationsResent}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600">錯誤數量</div>
              <div className="text-2xl font-bold text-red-700">
                {result.data.errors.length}
              </div>
            </div>
          </div>

          {/* Success/Error Status */}
          {result.success ? (
            <div className="flex items-center gap-2 p-4 rounded-lg border-green-200 bg-green-50">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-green-700">批量重送執行完成</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-lg border-red-200 bg-red-50">
              <XCircleIcon className="h-4 w-4 text-red-600" />
              <span className="text-red-700">批量重送執行失敗</span>
            </div>
          )}

          {/* Error Details */}
          {result.data.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-red-700">錯誤詳情：</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.data.errors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-red-50 p-3 rounded border-l-4 border-red-400"
                  >
                    <div className="font-medium text-sm">
                      交易 ID: {error.transactionId || "系統錯誤"}
                    </div>
                    <div className="text-sm text-red-600">{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Details */}
          {result.data.details.filter((d) => d.status === "resent").length >
            0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-green-700">成功重送：</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.data.details
                  .filter((d) => d.status === "resent")
                  .map((detail, index) => (
                    <div
                      key={index}
                      className="bg-green-50 p-3 rounded border-l-4 border-green-400"
                    >
                      <div className="font-medium text-sm">
                        交易 ID: {detail.transactionId}
                      </div>
                      <div className="text-sm text-green-600">
                        通知 ID: {detail.notificationId}
                      </div>
                      <div className="text-sm text-green-600">
                        {detail.message}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
