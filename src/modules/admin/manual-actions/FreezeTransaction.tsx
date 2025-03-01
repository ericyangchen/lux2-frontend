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
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  Transaction,
  TransactionDetailedStatusDisplayNames,
  TransactionStatus,
  TransactionStatusDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import {
  formatNumberInPercentage,
  formatNumberWithoutMinFraction,
} from "@/lib/number";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { TransactionMetadata } from "@/lib/types/transaction-metadata";
import { classNames } from "@/lib/utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { createManualTransactionApi } from "@/lib/apis/manual-transactions";
import { getApplicationCookies } from "@/lib/cookie";
import { getTransactionByIdApi } from "@/lib/apis/transactions";
import { getTransactionMetadataByIdApi } from "@/lib/apis/transaction-metadata";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function FreezeTransaction() {
  const router = useRouter();

  const { toast } = useToast();

  // 1. search by transactionId
  const [transactionId, setTransactionId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const [transaction, setTransaction] = useState<Transaction>();
  const [transactionMetadata, setTransactionMetadata] =
    useState<TransactionMetadata>();

  const handleSearch = async (isLoadMore: boolean = false) => {
    const { accessToken, organizationId } = getApplicationCookies();

    if (!accessToken || !organizationId || !transactionId) {
      return;
    }

    if (!isLoadMore) {
      setIsLoading(true);
    }

    try {
      const response = await getTransactionByIdApi({
        transactionId,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        setTransaction(data?.transaction);

        const transactionId = data?.transaction?.id;

        // get transaction metadata
        if (transactionId) {
          const metadataResponse = await getTransactionMetadataByIdApi({
            transactionId,
            accessToken,
          });

          const metadataData = await metadataResponse.json();

          if (metadataData.ok) {
            setTransactionMetadata(metadataData?.transactionMetadata);
          }
        }
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 自動訂單查詢失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `自動訂單查詢失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
      setTransaction(undefined);
    }

    setIsLoading(false);
  };

  const handleClearAll = () => {
    setTransactionId("");
    setTransaction(undefined);
  };

  const isStatusSuccess = transaction?.status === TransactionStatus.SUCCESS;
  const isDepositTransaction = transaction?.type === TransactionType.DEPOSIT;
  const isFreezable = isStatusSuccess && isDepositTransaction;

  const [isFreezeButtonLoading, setIsFreezeButtonLoading] = useState(false);

  const [reason, setReason] = useState<string>();

  const [createdManualTransaction, setCreatedManualTransaction] =
    useState<ManualTransaction>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createFreezeTransaction = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !transaction) {
      return;
    }

    setIsFreezeButtonLoading(true);

    try {
      const response = await createManualTransactionApi({
        type: ManualTransactionType.MANUAL_FROZEN,
        organizationId: transaction.merchantId,
        paymentMethod: transaction.paymentMethod,
        amount: transaction.amount.toString(),
        additionalInfo: {
          originalTransactionId: transaction.id,
          reason: reason,
        },
        accessToken,
      });
      const data = await response.json();
      if (response.ok) {
        setCreatedManualTransaction(data?.manualTransaction);
        setIsDialogOpen(true);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 凍結操作失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `凍結操作失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }

    setIsFreezeButtonLoading(false);
  };

  const clearAll = () => {
    setTransactionId("");
    setTransaction(undefined);
    setCreatedManualTransaction(undefined);
  };

  const createdManualTransactionAdditionalInfo =
    createdManualTransaction?.additionalInfo as ManualFrozenAdditionalInfo;

  return (
    <>
      <div className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll">
        {/* search bar */}
        <div className="flex flex-col divide-y pb-4">
          {/* search by transactionId */}
          <div className="pb-4 flex flex-col gap-4">
            <Label className="whitespace-nowrap font-bold text-md">
              輸入系統自動訂單號查詢
            </Label>
            {/* transactionId */}
            <div className="flex items-center gap-4 w-full lg:w-fit px-4">
              <Label className="whitespace-nowrap">
                系統自動訂單號(TX)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="transactionId"
                className="w-full sm:min-w-[220px] font-mono"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
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
                disabled={isLoading || !transactionId}
                className="w-[120px]"
              >
                {isLoading ? "查詢中..." : "查詢"}
              </Button>
            </div>
          </div>
        </div>

        {/* transaction */}
        {transaction && (
          <div className="flex gap-16 flex-row flex-wrap">
            {/* transaction info */}
            <div className="flex flex-col gap-4">
              <Label className="whitespace-nowrap font-bold text-md">
                訂單資訊
              </Label>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
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

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
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

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
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

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  通知 URL:
                </Label>
                <div className="font-mono">{transaction.notifyUrl}</div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">類別:</Label>
                <div className="font-mono">
                  {TransactionTypeDisplayNames[transaction.type]}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">通道:</Label>
                <div className="font-mono">
                  {PaymentMethodDisplayNames[transaction.paymentMethod]}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  上游渠道:
                </Label>
                <div className="font-mono">
                  {PaymentChannelDisplayNames[transaction.paymentChannel]}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  結算天數:
                </Label>
                <div className="font-mono">
                  {transaction.settlementInterval
                    ? transaction.settlementInterval
                    : "無"}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  手續費率:
                </Label>
                <div className="font-mono">
                  {formatNumberInPercentage(transaction.percentageFee)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  固定手續費:
                </Label>
                <div className="font-mono">
                  {formatNumberWithoutMinFraction(transaction.fixedFee)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  總手續費:
                </Label>
                <div className="font-mono">
                  {formatNumberWithoutMinFraction(transaction.totalFee)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">金額:</Label>
                <div className="font-mono">
                  {formatNumberWithoutMinFraction(transaction.amount)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  餘額變動:
                </Label>
                <div className="font-mono">
                  {formatNumberWithoutMinFraction(transaction.balanceChanged)}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  詳細狀態:
                </Label>
                <div className="font-mono">
                  {
                    TransactionDetailedStatusDisplayNames[
                      transaction.detailedStatus
                    ]
                  }
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">狀態:</Label>
                <div
                  className={classNames(
                    transaction.status === TransactionStatus.SUCCESS
                      ? "text-green-600"
                      : transaction.status === TransactionStatus.FAILED
                      ? "text-red-600"
                      : "",
                    "font-mono"
                  )}
                >{`${transaction.status} (${
                  TransactionStatusDisplayNames[transaction.status]
                })`}</div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">訊息:</Label>
                <div className="font-mono">{transaction.message}</div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  系統創建時間:
                </Label>
                <div className="font-mono">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.createdAt
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  系統更新時間:
                </Label>
                <div className="font-mono">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.updatedAt
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  上游回覆時間:
                </Label>
                <div className="font-mono">
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.upstreamNotifiedAt
                  )}
                </div>
              </div>

              {transactionMetadata && (
                <>
                  <div className="flex items-start gap-4 w-full lg:w-fit min-h-6 px-4">
                    <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
                      上游 API 回覆:
                    </Label>
                    <div className="font-mono">
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

                  <div className="flex items-start gap-4 w-full lg:w-fit min-h-6 px-4">
                    <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
                      上游 Notify 回覆:
                    </Label>
                    <div className="font-mono">
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
                </>
              )}

              <div className="flex items-center gap-4 w-full lg:w-fit min-h-6 px-4">
                <Label className="whitespace-nowrap min-w-[100px]">
                  分潤狀態:
                </Label>
                <div className="font-mono">
                  {transaction.revenueDistributed ? "已分潤" : "未分潤"}
                </div>
              </div>
            </div>

            {/* freeze info */}
            <div className="flex flex-col gap-4 w-full sm:w-fit">
              <Label className="whitespace-nowrap font-bold text-md">
                凍結操作
              </Label>
              <div className="px-4 flex flex-col gap-1">
                {!isStatusSuccess && (
                  <div className="bg-red-100 text-red-500 p-4 rounded-md">
                    <p className="text-sm">
                      只有交易成功的訂單才能進行凍結操作
                    </p>
                  </div>
                )}
                {!isDepositTransaction && (
                  <div className="bg-red-100 text-red-500 p-4 rounded-md">
                    <p className="text-sm">只有代收訂單才能進行凍結操作</p>
                  </div>
                )}
                {!isFreezable && (
                  <div className="flex flex-col gap-2">
                    {/* transactionId */}
                    <div className="flex items-center gap-4 w-full lg:w-fit">
                      <Label className="whitespace-nowrap min-w-[100px]">
                        系統自動訂單號
                      </Label>
                      <Input
                        id="transactionId"
                        className="w-full sm:min-w-[220px] font-mono"
                        value={transaction.id}
                        disabled
                      />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-fit">
                      <Label className="whitespace-nowrap min-w-[100px]">
                        凍結對象
                      </Label>
                      <Input
                        id="transactionId"
                        className="w-full sm:min-w-[220px] font-mono"
                        value={transaction.merchantId}
                        disabled
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Label className="whitespace-nowrap w-[100px]">
                        通道
                      </Label>
                      <div className="w-fit min-w-[150px]">
                        <Input value={transaction.paymentMethod} disabled />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-fit">
                      <Label className="whitespace-nowrap min-w-[100px]">
                        凍結金額
                      </Label>
                      <Input
                        className="w-[150px]"
                        value={transaction.amount}
                        disabled
                      />
                    </div>

                    <div className="flex items-start gap-4 w-full lg:w-fit">
                      <Label className="whitespace-nowrap min-w-[100px] mt-[11px]">
                        原因
                      </Label>

                      <Textarea
                        className="w-full sm:min-w-[350px]"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={createFreezeTransaction}
                      disabled={!isFreezable || isFreezeButtonLoading}
                      className="bg-red-500 hover:bg-red-600 w-fit self-end"
                      variant="destructive"
                    >
                      {isFreezeButtonLoading ? "凍結中..." : "凍結該筆款項"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* dialog for created manual freeze transaction */}
      {createdManualTransaction && (
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
              <DialogTitle>凍結訂單 新增成功</DialogTitle>
              <DialogDescription className="text-black pt-4">
                <div>
                  <div className="pb-2">
                    <Label className="whitespace-nowrap font-bold text-md pb-4">
                      凍結訂單資訊
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
                          copyingText: createdManualTransaction.id,
                          title: "已複製系統手動訂單號",
                        })
                      }
                    >
                      {createdManualTransaction.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      單位 ID:
                    </Label>
                    <div className="font-mono">
                      {createdManualTransaction.organizationId}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      類別:
                    </Label>
                    <div className="font-mono">
                      {
                        ManualTransactionTypeDisplayNames[
                          createdManualTransaction.type
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
                          createdManualTransaction.paymentMethod
                        ]
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px]">
                      凍結金額:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        createdManualTransaction.amount
                      )}
                    </div>
                  </div>
                  {/* additionalInfo */}
                  {createdManualTransactionAdditionalInfo && (
                    <>
                      <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                        <Label className="whitespace-nowrap min-w-[100px]">
                          原交易訂單:
                        </Label>
                        <div
                          className="font-mono cursor-pointer"
                          onClick={() => {
                            if (
                              createdManualTransactionAdditionalInfo.originalTransactionId
                            ) {
                              copyToClipboard({
                                toast,
                                copyingText:
                                  createdManualTransactionAdditionalInfo.originalTransactionId,
                                title: "已複製原交易訂單 ID",
                              });
                            }
                          }}
                        >
                          {
                            createdManualTransactionAdditionalInfo?.originalTransactionId
                          }
                        </div>
                      </div>

                      <div className="flex items-start gap-4 w-full lg:w-fit">
                        <Label className="whitespace-nowrap min-w-[100px] mt-[11px]">
                          原因
                        </Label>

                        <Textarea
                          className="w-full sm:min-w-[350px]"
                          value={createdManualTransactionAdditionalInfo.reason}
                          disabled
                        />
                      </div>

                      <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                        <Label className="whitespace-nowrap min-w-[100px]">
                          凍結狀態:
                        </Label>
                        <div className="font-mono cursor-pointer">
                          {createdManualTransactionAdditionalInfo?.unfrozen ? (
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
                        createdManualTransaction.createdAt
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
                      創建者資訊:
                    </Label>
                    <div className="font-mono">
                      {createdManualTransaction.operatorInfo && (
                        <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                          {JSON.stringify(
                            createdManualTransaction.operatorInfo,
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
                      `/admin/transactions?tab=ManualTransaction&manualTransactionId=${createdManualTransaction.id}`
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
