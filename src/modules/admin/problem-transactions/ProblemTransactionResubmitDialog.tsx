import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";
import {
  PaymentChannelCategories,
  PaymentChannelDisplayNames,
} from "@/lib/constants/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiHandleProblemWithdrawals } from "@/lib/apis/problem-withdrawals/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function ProblemTransactionResubmitDialog({
  isOpen,
  closeDialog,
  selectedTransactionIds,
  onSuccess,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  selectedTransactionIds: string[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<
    PaymentChannel | ""
  >("");

  const handleCloseDialog = () => {
    setSelectedPaymentChannel("");
    closeDialog();
  };

  const handleResubmit = async () => {
    if (!selectedPaymentChannel) {
      toast({
        title: "請選擇支付渠道",
        description: "請先選擇新的支付渠道",
        variant: "destructive",
      });
      return;
    }

    const { accessToken } = getApplicationCookies();
    if (!accessToken) {
      toast({
        title: "認證失敗",
        description: "請重新登入",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiHandleProblemWithdrawals({
        transactionIds: selectedTransactionIds,
        newPaymentChannel: selectedPaymentChannel,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "重新提交成功",
          description: `成功重新提交 ${selectedTransactionIds.length} 筆交易`,
          variant: "default",
        });
        onSuccess();
        handleCloseDialog();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 重新提交失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "重新提交失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[600px] max-h-[100vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <Label className="whitespace-nowrap font-semibold text-2xl text-orange-600">
            重新提交待處理交易
          </Label>

          <div className="bg-gray-50 p-4 rounded-md">
            <Label className="text-sm text-gray-600">
              選中的交易ID: {selectedTransactionIds.length} 筆
            </Label>
            <div className="text-xs text-gray-500 mt-1 max-h-32 overflow-y-auto">
              {selectedTransactionIds.map((id, index) => (
                <div key={id}>
                  {index + 1}. {id}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <Label className="text-sm text-yellow-800 font-medium">
              ⚠️ 重要提醒
            </Label>
            <div className="text-xs text-yellow-700 mt-1">
              <div>• 重新提交將使用新的上游渠道處理這些交易</div>
              <div>• 請確保所選交易都具有相同的支付類型</div>
              <div>• 操作完成後交易狀態將會更新</div>
            </div>
          </div>

          {/* Payment Channel Selection */}
          <div className="flex flex-col gap-4">
            <Label className="whitespace-nowrap font-bold text-lg">
              選擇新的上游渠道
            </Label>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">上游渠道 *</Label>
              <Select
                value={selectedPaymentChannel}
                onValueChange={(value) =>
                  setSelectedPaymentChannel(value as PaymentChannel)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="請選擇上游渠道" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(PaymentChannel).map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {PaymentChannelDisplayNames[channel]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleCloseDialog}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleResubmit}
                disabled={isLoading || !selectedPaymentChannel}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? "處理中..." : "確認重新提交"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
