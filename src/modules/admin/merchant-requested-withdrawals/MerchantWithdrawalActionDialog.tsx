import {
  ApiApproveMerchantRequestedWithdrawal,
  ApiRejectMerchantRequestedWithdrawal,
} from "@/lib/apis/txn-merchant-requested-withdrawals/patch";
import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function MerchantWithdrawalActionDialog({
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
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleCloseDialog = () => {
    setAdminNote("");
    setRejectionReason("");
    closeDialog();
  };

  const handleApprove = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !selectedTransactionIds.length) {
      return;
    }

    if (!adminNote.trim()) {
      toast({
        title: "請填寫管理員備註",
        description: "審核通過商戶提領請求時必須填寫管理員備註",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await ApiApproveMerchantRequestedWithdrawal({
        transactionIds: selectedTransactionIds,
        adminNote: adminNote.trim() || undefined,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "審核通過成功",
          description: `成功通過 ${selectedTransactionIds.length} 筆商戶提領請求`,
          variant: "success",
        });
        onSuccess();
        handleCloseDialog();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: "審核通過失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "審核通過失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !selectedTransactionIds.length) {
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        title: "請填寫拒絕原因",
        description: "拒絕商戶提領請求時必須填寫拒絕原因",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await ApiRejectMerchantRequestedWithdrawal({
        transactionIds: selectedTransactionIds,
        rejectionReason: rejectionReason.trim(),
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "審核拒絕成功",
          description: `成功拒絕 ${selectedTransactionIds.length} 筆商戶提領請求`,
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
          title: "審核拒絕失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "審核拒絕失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[600px] max-h-[100vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <Label className="whitespace-nowrap font-semibold text-2xl text-blue-600">
            批量操作 {selectedTransactionIds.length} 筆商戶提領請求
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

          {/* Approve Section */}
          <div className="flex flex-col gap-4 border-t pt-4">
            <Label className="whitespace-nowrap font-bold text-lg text-green-600">
              審核通過
            </Label>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">管理員備註 (必填)</Label>
              <Textarea
                placeholder="請輸入管理員備註..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleApprove}
              disabled={isLoading || !adminNote.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "處理中..." : "確認通過"}
            </Button>
          </div>

          {/* Reject Section */}
          <div className="flex flex-col gap-4 border-t pt-4">
            <Label className="whitespace-nowrap font-bold text-lg text-red-600">
              審核拒絕
            </Label>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">拒絕原因 (必填)</Label>
              <Textarea
                placeholder="請輸入拒絕原因..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none border-red-200 focus:border-red-500"
                rows={3}
              />
            </div>

            <Button
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              variant="destructive"
            >
              {isLoading ? "處理中..." : "確認拒絕"}
            </Button>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
