import {
  CreatorTypeDisplayNames,
  TransactionLogActionDisplayNames,
} from "@/lib/constants/transaction-logs";
import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";
import {
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionInternalStatusDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
} from "@/lib/constants/transaction";
import {
  formatNumberInPercentage,
  formatNumberWithoutMinFraction,
} from "@/lib/utils/number";
import { useEffect, useState } from "react";

import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useTransaction } from "@/lib/hooks/swr/transaction";
import { useTransactionLogs } from "@/lib/hooks/swr/transaction-logs";

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

  const { transactionLogs, isLoading: isLoadingLogs } = useTransactionLogs({
    transactionId,
  });

  const handleCloseDialog = () => {
    closeDialog();
  };

  // Sort transaction logs by createdAt ascending
  const sortedLogs = transactionLogs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[800px] max-h-[100vh] overflow-y-auto">
        {transaction && (
          <div className="flex flex-col gap-2">
            {/* 訂單資訊 */}
            <Label className="whitespace-nowrap font-bold text-md">
              訂單資訊
            </Label>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                系統訂單號:
              </Label>
              <div
                className="font-mono cursor-pointer"
                onClick={() =>
                  copyToClipboard({
                    toast,
                    copyingText: transaction.id,
                    title: "已複製系統訂單號",
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
              <div className="font-mono">{transaction.notifyUrl || "無"}</div>
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
                支付類型:
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
                {transaction.settlementInterval || "無"}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                手續費率:
              </Label>
              <div className="font-mono">
                {formatNumberInPercentage(transaction.feePercentage)}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                固定手續費:
              </Label>
              <div className="font-mono">
                {formatNumberWithoutMinFraction(transaction.feeFixed)}
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
                    PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.includes(
                      transaction.internalStatus
                    )
                      ? "text-orange-500"
                      : ""
                  )}
                >
                  {
                    TransactionInternalStatusDisplayNames[
                      transaction.internalStatus
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
              <div className="font-mono">{transaction.message || "無"}</div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
              <Label className="whitespace-nowrap min-w-[100px] font-normal">
                成功時間:
              </Label>
              <div className="font-mono">
                {transaction.successAt
                  ? convertDatabaseTimeToReadablePhilippinesTime(
                      transaction.successAt
                    )
                  : "無"}
              </div>
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
                {transaction.transactionFeeAllocationTable && (
                  <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                    {JSON.stringify(
                      transaction.transactionFeeAllocationTable,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>

            {/* 交易日誌 */}
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              交易日誌
            </Label>
            {isLoadingLogs ? (
              <div className="text-center py-4">
                <Label className="text-gray-400">載入中...</Label>
              </div>
            ) : sortedLogs.length > 0 ? (
              <div className="flex flex-col border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-900">
                    <div>時間</div>
                    <div>動作</div>
                    <div>觸發者</div>
                    <div>創建者類型</div>
                    <div>詳細資料</div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {sortedLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className={classNames(
                        index % 2 === 0 ? "bg-white" : "bg-gray-50",
                        "px-4 py-3 border-b last:border-b-0"
                      )}
                    >
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div className="font-mono text-xs">
                          {convertDatabaseTimeToReadablePhilippinesTime(
                            log.createdAt
                          )}
                        </div>
                        <div className="font-medium">
                          {TransactionLogActionDisplayNames[log.action] ||
                            log.action}
                        </div>
                        <div className="font-mono text-xs">
                          {log.triggeredBy || "系統"}
                        </div>
                        <div className="text-xs">
                          {CreatorTypeDisplayNames[log.creatorType] ||
                            log.creatorType}
                        </div>
                        <div className="text-xs">
                          {log.data ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800">
                                查看詳情
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 rounded p-2 overflow-auto max-w-xs">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">無</span>
                          )}
                        </div>
                      </div>
                      {(log.route || log.method) && (
                        <div className="mt-2 text-xs text-gray-500 font-mono">
                          {log.method} {log.route}
                        </div>
                      )}
                      {log.creatorIdentifier && (
                        <div className="mt-1 text-xs text-gray-500">
                          創建者: {log.creatorIdentifier}{" "}
                          {log.creatorIp && `(${log.creatorIp})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Label className="text-gray-400">無交易日誌</Label>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
