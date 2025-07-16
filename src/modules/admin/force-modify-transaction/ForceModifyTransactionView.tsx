import {
  AdminForceModifyTransactionData,
  ApiAdminForceModifyTransaction,
} from "@/lib/apis/transactions/admin-force-modify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import {
  PaymentMethodDisplayNames,
  TransactionInternalStatusDisplayNames,
  TransactionStatusDisplayNames,
  TransactionTypeDisplayNames,
} from "@/lib/constants/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useMemo, useState } from "react";

import { ApiGetOrganizationById } from "@/lib/apis/organizations/get";
import { ApiGetTransactionById } from "@/lib/apis/transactions/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Organization } from "@/lib/types/organization";
import { PROBLEM_WITHDRAWAL_INTERNAL_STATUSES } from "@/lib/constants/problem-withdrawal-statuses";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Transaction } from "@/lib/types/transaction";
import { TransactionInternalStatus } from "@/lib/enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { formatNumberInPercentage } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function ForceModifyTransactionView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  // Query transaction state
  const [transactionId, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [merchantOrganization, setMerchantOrganization] =
    useState<Organization | null>(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);

  // Force modify form state
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>();
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  // Dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableModifyStatuses = useMemo(() => {
    if (transaction?.type === TransactionType.API_DEPOSIT) {
      return [TransactionStatus.SUCCESS, TransactionStatus.FAILED];
    } else if (
      transaction?.type === TransactionType.API_WITHDRAWAL ||
      transaction?.type === TransactionType.MERCHANT_REQUESTED_WITHDRAWAL
    ) {
      return [TransactionStatus.FAILED, TransactionStatus.SUCCESS];
    }
    return [];
  }, [transaction]);

  const handleQueryTransaction = async () => {
    if (!accessToken) {
      toast({
        title: "錯誤",
        description: "無法取得存取權杖",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入交易 ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingTransaction(true);
      const response = await ApiGetTransactionById({
        id: transactionId.trim(),
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const transactionData = await response.json();
      setTransaction(transactionData);

      // Fetch merchant organization data
      try {
        const orgResponse = await ApiGetOrganizationById({
          organizationId: transactionData.merchantId,
          accessToken,
        });

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setMerchantOrganization(orgData);
        }
      } catch (error) {
        console.error("Error loading merchant organization:", error);
        // Don't show error toast for organization fetch failure
      }

      // Pre-fill current status
      setSelectedStatus(transactionData.status);
      setMessage(transactionData.message || "");

      toast({
        title: "成功",
        description: "交易資料已載入",
      });
    } catch (error) {
      console.error("Error loading transaction:", error);
      toast({
        title: "錯誤",
        description: "載入交易失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  const handleForceModify = async () => {
    if (!accessToken || !transaction || !selectedStatus) {
      toast({
        title: "錯誤",
        description: "缺少必要資料",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const forceModifyData: AdminForceModifyTransactionData = {
        status: selectedStatus,
        message: message || undefined,
        reason: reason || undefined,
      };

      const response = await ApiAdminForceModifyTransaction({
        id: transaction.id,
        data: forceModifyData,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result = await response.json();

      toast({
        title: "成功",
        description: "交易已修改成功",
      });

      // Refresh transaction data
      await handleQueryTransaction();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error force modifying transaction:", error);
      toast({
        title: "錯誤",
        description: "修改交易失敗",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canForceModify =
    transaction && selectedStatus && selectedStatus !== transaction.status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIndicatorColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInternalStatusColor = (
    internalStatus: TransactionInternalStatus
  ) => {
    return PROBLEM_WITHDRAWAL_INTERNAL_STATUSES.includes(internalStatus)
      ? "text-orange-500"
      : "text-gray-700";
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Transaction Query Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">查詢交易</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="transactionId">交易 ID</Label>
              <Input
                id="transactionId"
                placeholder="請輸入交易 ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleQueryTransaction}
                disabled={isLoadingTransaction}
                className="whitespace-nowrap"
              >
                {isLoadingTransaction ? "載入中..." : "查詢"}
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">交易詳情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  類別
                </Label>
                <p>{TransactionTypeDisplayNames[transaction.type]}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  系統訂單號
                </Label>
                <p className="font-mono text-sm">{transaction.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  商戶
                </Label>
                <p className="font-mono text-sm">
                  {merchantOrganization?.name || "載入中..."} (
                  {transaction.merchantId})
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  商戶訂單號
                </Label>
                <p className="font-mono text-sm">
                  {transaction.merchantOrderId}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  支付類型
                </Label>
                <p>{PaymentMethodDisplayNames[transaction.paymentMethod]}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  金額
                </Label>
                <p>{transaction.amount}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  狀態
                </Label>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(
                      transaction.status
                    )}`}
                  ></div>
                  <span
                    className={`text-sm whitespace-nowrap ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {TransactionStatusDisplayNames[transaction.status]}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  詳細狀態
                </Label>
                <p
                  className={`font-semibold text-sm ${getInternalStatusColor(
                    transaction.internalStatus
                  )}`}
                >
                  {
                    TransactionInternalStatusDisplayNames[
                      transaction.internalStatus
                    ]
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  手續費率
                </Label>
                <p>{formatNumberInPercentage(transaction.feePercentage)}%</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  固定手續費
                </Label>
                <p>{transaction.feeFixed}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  總手續費
                </Label>
                <p>{transaction.totalFee}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  餘額變動
                </Label>
                <p>{transaction.balanceChanged}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  系統創建時間
                </Label>
                <p>
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.createdAt
                  )}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  系統更新時間
                </Label>
                <p>
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.updatedAt
                  )}
                </p>
              </div>
              {transaction.successAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    成功時間
                  </Label>
                  <p>
                    {convertDatabaseTimeToReadablePhilippinesTime(
                      transaction.successAt
                    )}
                  </p>
                </div>
              )}
              {transaction.notifyUrl && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">
                    通知網址
                  </Label>
                  <p className="text-sm font-mono break-all">
                    {transaction.notifyUrl}
                  </p>
                </div>
              )}
              {transaction.note && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">
                    備註
                  </Label>
                  <p className="text-sm">{transaction.note}</p>
                </div>
              )}
              {(transaction.bankName ||
                transaction.bankAccount ||
                transaction.receiverName) && (
                <>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      銀行資訊
                    </Label>
                  </div>
                  {transaction.bankName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        銀行名稱
                      </Label>
                      <p className="text-sm">{transaction.bankName}</p>
                    </div>
                  )}
                  {transaction.bankAccount && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        銀行帳戶
                      </Label>
                      <p className="text-sm font-mono">
                        {transaction.bankAccount}
                      </p>
                    </div>
                  )}
                  {transaction.receiverName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        接收方姓名
                      </Label>
                      <p className="text-sm">{transaction.receiverName}</p>
                    </div>
                  )}
                  {transaction.receiverEmail && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        接收方電子郵件
                      </Label>
                      <p className="text-sm">{transaction.receiverEmail}</p>
                    </div>
                  )}
                  {transaction.receiverPhoneNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        接收方電話
                      </Label>
                      <p className="text-sm">
                        {transaction.receiverPhoneNumber}
                      </p>
                    </div>
                  )}
                </>
              )}
              {(transaction.senderName ||
                transaction.senderEmail ||
                transaction.senderPhoneNumber) && (
                <>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      發送方資訊
                    </Label>
                  </div>
                  {transaction.senderName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        發送方姓名
                      </Label>
                      <p className="text-sm">{transaction.senderName}</p>
                    </div>
                  )}
                  {transaction.senderEmail && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        發送方電子郵件
                      </Label>
                      <p className="text-sm">{transaction.senderEmail}</p>
                    </div>
                  )}
                  {transaction.senderPhoneNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        發送方電話
                      </Label>
                      <p className="text-sm">{transaction.senderPhoneNumber}</p>
                    </div>
                  )}
                </>
              )}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">
                  訊息
                </Label>
                <p className="text-sm">
                  {transaction.message || (
                    <span className="text-gray-500">無</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Force Modify Section */}
        {transaction && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">強制修改</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">新狀態</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as TransactionStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇新狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModifyStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TransactionStatusDisplayNames[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">訊息: (可選擇性回傳下游)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="請輸入交易訊息..."
                />
              </div>

              <div>
                <Label htmlFor="reason">修改原因: (可選擇性不回傳下游)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="請輸入修改原因..."
                />
              </div>

              <Dialog
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={!canForceModify}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    強制修改
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>確認強制修改</DialogTitle>
                    <DialogDescription>
                      此操作不可逆。您確定要強制修改此交易嗎？
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <p>
                      <strong>交易 ID:</strong> {transaction.id}
                    </p>
                    <p>
                      <strong>當前狀態:</strong>{" "}
                      {TransactionStatusDisplayNames[transaction.status]}
                    </p>
                    <p>
                      <strong>新狀態:</strong>{" "}
                      {selectedStatus &&
                        TransactionStatusDisplayNames[selectedStatus]}
                    </p>
                    {message && (
                      <p>
                        <strong>新訊息:</strong> {message}
                      </p>
                    )}
                    {reason && (
                      <p>
                        <strong>原因:</strong> {reason}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleForceModify}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? "修改中..." : "確認修改"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
