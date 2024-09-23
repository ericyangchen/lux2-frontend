import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  ManualFrozenAdditionalInfo,
  ManualTransaction,
  ManualTransactionType,
  ManualTransactionTypeDisplayNames,
} from "@/lib/types/manual-transaction";
import {
  getManualTransactionByIdApi,
  unfreezeFrozenTransactionApi,
} from "@/lib/apis/manual-transactions";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { PaymentMethodDisplayNames } from "@/lib/types/transaction";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatNumberWithoutMinFraction } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function UnfreezeTransaction() {
  const router = useRouter();

  const { toast } = useToast();

  // 1. search by manualTransactionId
  const [manualTransactionId, setManualTransactionId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const [manualTransaction, setManualTransaction] =
    useState<ManualTransaction>();

  const manualTransactionAdditionalInfo =
    manualTransaction?.additionalInfo as ManualFrozenAdditionalInfo;

  const isCurrentlyFrozen = manualTransactionAdditionalInfo?.unfrozen === false;

  const handleSearch = async (isLoadMore: boolean = false) => {
    const { accessToken, organizationId } = getApplicationCookies();

    if (!accessToken || !organizationId || !manualTransactionId) {
      return;
    }

    if (!isLoadMore) {
      setIsLoading(true);
    }

    try {
      const response = await getManualTransactionByIdApi({
        manualTransactionId,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        if (
          data?.manualTransaction?.type !== ManualTransactionType.MANUAL_FROZEN
        ) {
          throw new ApplicationError({
            statusCode: 400,
            message: `該手動訂單並非凍結類別訂單 - ID: ${manualTransactionId}, type: ${
              Object.values(ManualTransactionType).includes(
                data?.manualTransaction?.type as ManualTransactionType
              )
                ? ManualTransactionTypeDisplayNames[
                    data?.manualTransaction?.type as ManualTransactionType
                  ]
                : data?.manualTransaction?.type
            }`,
          });
        }

        setManualTransaction(data?.manualTransaction);
      } else {
        throw new ApplicationError(data);
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
      setManualTransaction(undefined);
    }

    setIsLoading(false);
  };

  const handleClearAll = () => {
    setManualTransactionId("");
    setManualTransaction(undefined);
  };

  const [isUnfreezeButtonLoading, setIsUnfreezeButtonLoading] = useState(false);

  const [unfrozenManualTransaction, setUnfrozenManualTransaction] =
    useState<ManualTransaction>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const unfreezeFrozenTransaction = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !manualTransaction || !isCurrentlyFrozen) {
      return;
    }

    setIsUnfreezeButtonLoading(true);

    try {
      const response = await unfreezeFrozenTransactionApi({
        manualTransactionId: manualTransaction.id,
        accessToken,
      });
      const data = await response.json();
      if (response.ok) {
        setUnfrozenManualTransaction(data?.manualTransaction);
        setIsDialogOpen(true);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 解凍操作失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `解凍操作失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }

    setIsUnfreezeButtonLoading(false);
  };

  const clearAll = () => {
    setManualTransactionId("");
    setManualTransaction(undefined);
    setUnfrozenManualTransaction(undefined);
  };

  const unfrozenManualTransactionAdditionalInfo =
    unfrozenManualTransaction?.additionalInfo as ManualFrozenAdditionalInfo;

  return (
    <>
      <div className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll">
        {/* search bar */}
        <div className="flex flex-col divide-y pb-4">
          {/* search by manualTransactionId */}
          <div className="pb-4 flex flex-col gap-4">
            <Label className="whitespace-nowrap font-bold text-md">
              輸入系統手動訂單號查詢
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

            {/* search button */}
            <div className="flex justify-center sm:justify-start gap-4 px-4">
              <Button
                onClick={handleClearAll}
                className="w-[120px] border border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 hover:bg-inherit"
                variant="outline"
              >
                清除
              </Button>
              <Button
                onClick={() => handleSearch()}
                disabled={isLoading || !manualTransactionId}
                className="w-[120px]"
              >
                {isLoading ? "查詢中..." : "查詢"}
              </Button>
            </div>
          </div>
        </div>

        {/* manualTransaction */}
        {manualTransaction && (
          <div className="flex gap-16 flex-row flex-wrap">
            {/* manualTransaction info */}
            <div className="flex flex-col gap-4">
              <Label className="whitespace-nowrap font-bold text-md">
                訂單資訊
              </Label>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  系統手動訂單號:
                </Label>
                <div
                  className="font-mono cursor-pointer"
                  onClick={() =>
                    copyToClipboard({
                      toast,
                      copyingText: manualTransaction.id,
                      title: "已複製系統手動訂單號",
                    })
                  }
                >
                  {manualTransaction.id}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  凍結對象:
                </Label>
                <div
                  className="font-mono cursor-pointer"
                  onClick={() =>
                    copyToClipboard({
                      toast,
                      copyingText: manualTransaction.organizationId,
                      title: "已複製凍結單位 ID",
                    })
                  }
                >
                  {manualTransaction.organizationId}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">通道:</Label>
                <div className="font-mono">
                  {PaymentMethodDisplayNames[manualTransaction.paymentMethod]}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  凍結金額:
                </Label>
                <div className="font-mono">{manualTransaction.amount}</div>
              </div>

              <div className="flex items-start gap-4 w-full lg:w-fit">
                <Label className="whitespace-nowrap min-w-[70px] mt-[11px]">
                  原因
                </Label>

                <Textarea
                  className="w-full sm:min-w-[350px]"
                  value={manualTransactionAdditionalInfo?.reason}
                  disabled
                />
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  系統創建時間:
                </Label>
                <div className="font-mono">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    manualTransaction.createdAt
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  系統更新時間:
                </Label>
                <div className="font-mono">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    manualTransaction.updatedAt
                  )}
                </div>
              </div>
            </div>

            {/* freeze info */}
            <div className="flex flex-col gap-4 w-full sm:w-fit">
              <Label className="whitespace-nowrap font-bold text-md">
                解凍操作
              </Label>
              <div className="px-4 flex flex-col gap-1">
                {!isCurrentlyFrozen && (
                  <div className="bg-red-100 text-red-500 p-4 rounded-md">
                    <p className="text-sm">
                      只有正在凍結中的訂單才能進行解凍操作
                    </p>
                  </div>
                )}

                {isCurrentlyFrozen && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={unfreezeFrozenTransaction}
                      disabled={!isCurrentlyFrozen || isUnfreezeButtonLoading}
                      className="bg-red-500 hover:bg-red-600 w-fit self-end"
                      variant="destructive"
                    >
                      {isUnfreezeButtonLoading ? "解凍中..." : "解凍該筆款項"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* dialog for created manual freeze manualTransaction */}
      {unfrozenManualTransaction && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);

            if (!open) {
              clearAll();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>解凍成功</DialogTitle>
              <DialogDescription className="text-black pt-4">
                <div>
                  <div className="pb-2">
                    <Label className="whitespace-nowrap font-bold text-md pb-4">
                      解凍訂單資訊
                    </Label>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      系統手動訂單號:
                    </Label>
                    <div
                      className="font-mono cursor-pointer"
                      onClick={() =>
                        copyToClipboard({
                          toast,
                          copyingText: unfrozenManualTransaction.id,
                          title: "已複製系統手動訂單號",
                        })
                      }
                    >
                      {unfrozenManualTransaction.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      解凍單位 ID:
                    </Label>
                    <div className="font-mono">
                      {unfrozenManualTransaction.organizationId}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      類別:
                    </Label>
                    <div className="font-mono">
                      {
                        ManualTransactionTypeDisplayNames[
                          unfrozenManualTransaction.type
                        ]
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      通道:
                    </Label>
                    <div className="font-mono">
                      {
                        PaymentMethodDisplayNames[
                          unfrozenManualTransaction.paymentMethod
                        ]
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      解凍金額:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        unfrozenManualTransaction.amount
                      )}
                    </div>
                  </div>
                  {/* additionalInfo */}
                  {unfrozenManualTransactionAdditionalInfo && (
                    <>
                      <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                        <Label className="whitespace-nowrap min-w-[100px]">
                          原交易訂單:
                        </Label>
                        <div
                          className="font-mono cursor-pointer"
                          onClick={() => {
                            if (
                              unfrozenManualTransactionAdditionalInfo.originalTransactionId
                            ) {
                              copyToClipboard({
                                toast,
                                copyingText:
                                  unfrozenManualTransactionAdditionalInfo.originalTransactionId,
                                title: "已複製原交易訂單 ID",
                              });
                            }
                          }}
                        >
                          {
                            unfrozenManualTransactionAdditionalInfo?.originalTransactionId
                          }
                        </div>
                      </div>

                      <div className="flex items-start gap-4 w-full lg:w-fit">
                        <Label className="whitespace-nowrap min-w-[100px] mt-[11px]">
                          原因
                        </Label>

                        <Textarea
                          className="w-full sm:min-w-[350px]"
                          value={unfrozenManualTransactionAdditionalInfo.reason}
                          disabled
                        />
                      </div>

                      <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                        <Label className="whitespace-nowrap min-w-[100px]">
                          凍結狀態:
                        </Label>
                        <div className="font-mono cursor-pointer">
                          {unfrozenManualTransactionAdditionalInfo?.unfrozen ? (
                            <span className="text-red-500">已解凍</span>
                          ) : (
                            <span className="text-green-500">凍結中</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      系統創建時間:
                    </Label>
                    <div className="font-mono">
                      {convertDatabaseTimeToReadablePhilippinesTime(
                        unfrozenManualTransaction.createdAt
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
                      創建者資訊:
                    </Label>
                    <div className="font-mono">
                      {unfrozenManualTransaction.operatorInfo && (
                        <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                          {JSON.stringify(
                            unfrozenManualTransaction.operatorInfo,
                            null,
                            2
                          )}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    clearAll();
                  }}
                  className="w-[120px]"
                >
                  關閉
                </Button>
                <Button
                  onClick={() => {
                    router.push(
                      `/admin/transactions?tab=ManualTransaction&manualTransactionId=${unfrozenManualTransaction.id}`
                    );
                  }}
                  className="min-w-[120px]"
                >
                  至訂單列表查詢
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
