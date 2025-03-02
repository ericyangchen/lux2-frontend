import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";
import {
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionDetailedStatusDisplayNames,
  TransactionDetailedStatusRequireProcessing,
  TransactionStatus,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import {
  formatNumberInPercentage,
  formatNumberWithoutMinFraction,
} from "@/lib/number";
import { useEffect, useState } from "react";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { classNames } from "@/lib/utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { getApplicationCookies } from "@/lib/cookie";
import { updateTransactionMetadataNoteApi } from "@/lib/apis/transaction-metadata";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useTransaction } from "@/lib/hooks/swr/transaction";
import { useTransactionMetadata } from "@/lib/hooks/swr/transaction-metadata";

export function ApiTransactionInfoDialog({
  isOpen,
  closeDialog,
  transactionId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  transactionId: string;
}) {
  const { toast } = useToast();

  const { transaction } = useTransaction({
    transactionId,
  });

  const { transactionMetadata, mutate: mutateTransactionMetadata } =
    useTransactionMetadata({
      transactionId,
    });

  const handleCloseDialog = () => {
    closeDialog();
    setNote("");
    setIsEditingNote(false);
  };

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [note, setNote] = useState<string>(transactionMetadata?.note || "");

  const handleEditTransactionNote = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    try {
      const response = await updateTransactionMetadataNoteApi({
        transactionId,
        note,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        mutateTransactionMetadata(data?.transactionMetadata);
      } else {
        throw new ApplicationError(data);
      }

      mutateTransactionMetadata();
      setIsEditingNote(false);

      toast({
        title: "已儲存備注",
        description: `備注: ${note}`,
        variant: "success",
      });
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: "儲存備注失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "儲存備注失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const handleAbortEditTransactionNote = () => {
    setNote(transactionMetadata?.note || "");
    setIsEditingNote(false);
  };

  useEffect(() => {
    if (isEditingNote) return;

    if (transactionMetadata?.note !== note) {
      setNote(transactionMetadata?.note || "");
    }
  }, [isEditingNote, note, transactionMetadata]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[600px] max-h-[100vh] overflow-y-auto">
        {transaction && (
          <div className="flex flex-col gap-2">
            {/* 訂單資訊 */}
            <Label className="whitespace-nowrap font-bold text-md">
              訂單資訊
            </Label>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                系統自動訂單號:
              </Label>
              <div
                className="font-mono cursor-pointer"
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: transaction.id,
                    title: "已複製系統自動訂單號",
                  })
                }
              >
                {transaction.id}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                單位 ID:
              </Label>
              <div
                className="font-mono cursor-pointer"
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: transaction.merchantId,
                    title: "已複製單位 ID",
                  })
                }
              >
                {transaction.merchantId}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                商戶訂單號:
              </Label>
              <div
                className="font-mono cursor-pointer"
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: transaction.merchantOrderId,
                    title: "已複製商戶訂單號",
                  })
                }
              >
                {transaction.merchantOrderId}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                通知 URL:
              </Label>
              <div className="font-mono">{transaction.notifyUrl}</div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                類別:
              </Label>
              <div className="font-mono">
                {TransactionTypeDisplayNames[transaction.type]}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                通道:
              </Label>
              <div className="font-mono">
                {PaymentMethodDisplayNames[transaction.paymentMethod]}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                上游渠道:
              </Label>
              <div className="font-mono">
                {PaymentChannelDisplayNames[transaction.paymentChannel]}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                結算天數:
              </Label>
              <div className="font-mono">
                {transaction.settlementInterval
                  ? transaction.settlementInterval
                  : "無"}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                手續費率:
              </Label>
              <div className="font-mono">
                {formatNumberInPercentage(transaction.percentageFee)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                固定手續費:
              </Label>
              <div className="font-mono">
                {formatNumberWithoutMinFraction(transaction.fixedFee)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                總手續費:
              </Label>
              <div className="font-mono">
                {formatNumberWithoutMinFraction(transaction.totalFee)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                金額:
              </Label>
              <div className="font-mono">
                {formatNumberWithoutMinFraction(transaction.amount)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                餘額變動:
              </Label>
              <div className="font-mono">
                {formatNumberWithoutMinFraction(transaction.balanceChanged)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                詳細狀態:
              </Label>
              <div className="font-mono">
                <span
                  className={classNames(
                    TransactionDetailedStatusRequireProcessing.includes(
                      transaction.detailedStatus
                    )
                      ? "text-orange-500"
                      : ""
                  )}
                >
                  {
                    TransactionDetailedStatusDisplayNames[
                      transaction.detailedStatus
                    ]
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                狀態:
              </Label>
              <div
                className={classNames(
                  transaction.status === TransactionStatus.SUCCESS
                    ? "text-green-600"
                    : transaction.status === TransactionStatus.FAILED
                    ? "text-red-600"
                    : "",
                  "font-mono"
                )}
              >{`${TransactionStatusDisplayNames[transaction.status]} (${
                transaction.status
              })`}</div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                訊息:
              </Label>
              <div className="font-mono">{transaction.message}</div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                系統創建時間:
              </Label>
              <div className="font-mono">
                {convertDatabaseTimeToReadablePhilippinesTime(
                  transaction.createdAt
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 flex-wrap">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                系統更新時間:
              </Label>
              <div className="font-mono">
                {convertDatabaseTimeToReadablePhilippinesTime(
                  transaction.updatedAt
                )}
              </div>
            </div>

            {/* 備註 */}
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              備註
            </Label>
            <div className="flex flex-col items-start gap-2 w-full min-h-6">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!isEditingNote}
              />
              <div>
                {isEditingNote ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAbortEditTransactionNote}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      放棄編輯
                    </Button>
                    <Button
                      onClick={handleEditTransactionNote}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      儲存編輯
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditingNote(true)}>
                    編輯備注
                  </Button>
                )}
              </div>
            </div>

            {/* 上游資訊 */}
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              上游資訊
            </Label>
            <div className="flex items-start gap-4 w-full min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] mt-[5px] font-normal">
                上游 API 回覆:
              </Label>
              <div className="font-mono flex-1">
                {transactionMetadata?.upstreamReceiveResponse && (
                  <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                    {JSON.stringify(
                      transactionMetadata.upstreamReceiveResponse,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4 w-full min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] mt-[5px] font-normal">
                上游 Notify 回覆:
              </Label>
              <div className="font-mono flex-1">
                {transactionMetadata?.upstreamNotifyResponse && (
                  <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                    {JSON.stringify(
                      transactionMetadata.upstreamNotifyResponse,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                上游 Notify 時間:
              </Label>
              <div className="font-mono">
                {convertDatabaseTimeToReadablePhilippinesTime(
                  transaction.upstreamNotifiedAt
                )}
              </div>
            </div>

            {/* 分潤資訊 */}
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              分潤資訊
            </Label>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                分潤狀態:
              </Label>
              <div className="font-mono">
                {transaction.revenueDistributed ? "已分潤" : "未分潤"}
              </div>
            </div>
            <div className="flex items-start gap-4 w-full min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] mt-[5px] font-normal">
                分潤資訊:
              </Label>
              <div className="font-mono flex-1">
                {transaction.revenueDistributionInfo && (
                  <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                    {JSON.stringify(
                      transaction.revenueDistributionInfo,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
