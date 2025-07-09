import {
  ApiCreateManualNotification,
  CreateManualNotificationData,
} from "@/lib/apis/txn-notifications/post";
import {
  CreatorTypeDisplayNames,
  TransactionLogActionDisplayNames,
} from "@/lib/constants/transaction-logs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useState } from "react";

import { ApiGetOrganizationById } from "@/lib/apis/organizations/get";
import { ApiGetTransactionById } from "@/lib/apis/transactions/get";
import { ApiGetTransactionLogsByTransactionId } from "@/lib/apis/txn-logs/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Organization } from "@/lib/types/organization";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Transaction } from "@/lib/types/transaction";
import { TransactionLog } from "@/lib/types/transaction-log";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionStatusDisplayNames } from "@/lib/constants/transaction";
import { classNames } from "@/lib/utils/classname-utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function TestCallbackView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  // Query transaction state
  const [transactionId, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);

  // Manual notification form state
  const [formData, setFormData] = useState<CreateManualNotificationData>({
    id: "",
    merchantId: "",
    merchantOrderId: "",
    paymentMethod: "",
    amount: "",
    totalFee: "",
    balanceChanged: "",
    status: TransactionStatus.SUCCESS,
    message: "",
    successAt: "",
    notifyUrl: "",
    maxAttempts: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction logs state
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const handleQueryTransaction = async () => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No access token available",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction ID",
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

      // Check if the organization is a testing account
      const orgResponse = await ApiGetOrganizationById({
        organizationId: transactionData.merchantId,
        accessToken,
      });

      if (!orgResponse.ok) {
        const orgErrorData = await orgResponse.json();
        throw new ApplicationError(orgErrorData);
      }

      const organizationData: Organization = await orgResponse.json();

      if (!organizationData.isTestingAccount) {
        toast({
          title: "400: Bad Request",
          description:
            "The transaction's merchant is not a testing account, cannot test callback",
          variant: "destructive",
        });
        return;
      }

      // Auto-fill form with transaction data
      setFormData({
        id: transactionData.id,
        merchantId: transactionData.merchantId,
        merchantOrderId: transactionData.merchantOrderId,
        paymentMethod: transactionData.paymentMethod,
        amount: transactionData.amount,
        totalFee: transactionData.totalFee,
        balanceChanged: transactionData.balanceChanged,
        status: transactionData.status,
        message: transactionData.message || "",
        successAt: transactionData.successAt || "",
        notifyUrl: transactionData.notifyUrl || "",
        maxAttempts: 30,
      });

      toast({
        title: "Success",
        description: "Transaction loaded successfully",
      });
    } catch (error) {
      console.error("Error loading transaction:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  const handleSubmitNotification = async () => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No access token available",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    const requiredFields = [
      "id",
      "merchantId",
      "merchantOrderId",
      "paymentMethod",
      "amount",
      "totalFee",
      "balanceChanged",
      "notifyUrl",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof CreateManualNotificationData]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Missing required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Set successAt to current timestamp when sending the request
      const dataWithTimestamp = {
        ...formData,
        successAt: new Date().toISOString(),
      };

      const response = await ApiCreateManualNotification({
        data: dataWithTimestamp,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Manual notification created successfully",
      });

      // Load transaction logs after successful submission
      await loadTransactionLogs(formData.id);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create manual notification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTransactionLogs = async (txnId: string) => {
    if (!accessToken || !txnId) return;

    try {
      setIsLoadingLogs(true);
      const response = await ApiGetTransactionLogsByTransactionId({
        transactionId: txnId,
        accessToken,
      });

      if (response.ok) {
        const logs = await response.json();
        setTransactionLogs(logs);
      }
    } catch (error) {
      console.error("Error loading transaction logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Sort transaction logs by createdAt ascending
  const sortedLogs = transactionLogs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const updateFormData = (
    field: keyof CreateManualNotificationData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Transaction Query and Manual Notification Form */}
        <div className="space-y-6">
          {/* Transaction Query Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">查詢交易</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction ID"
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
                  {isLoadingTransaction ? "Loading..." : "Query"}
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Notification Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">創建手動通知</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">Transaction ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => updateFormData("id", e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  value={formData.merchantId}
                  onChange={(e) => updateFormData("merchantId", e.target.value)}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchantOrderId">Merchant Order ID</Label>
                <Input
                  id="merchantOrderId"
                  value={formData.merchantOrderId}
                  onChange={(e) =>
                    updateFormData("merchantOrderId", e.target.value)
                  }
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    updateFormData("paymentMethod", e.target.value)
                  }
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="totalFee">Total Fee</Label>
                <Input
                  id="totalFee"
                  value={formData.totalFee}
                  onChange={(e) => updateFormData("totalFee", e.target.value)}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="balanceChanged">Balance Changed</Label>
                <Input
                  id="balanceChanged"
                  value={formData.balanceChanged}
                  onChange={(e) =>
                    updateFormData("balanceChanged", e.target.value)
                  }
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    updateFormData("status", value as TransactionStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TransactionStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {TransactionStatusDisplayNames[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  max="500"
                  value={formData.maxAttempts || ""}
                  onChange={(e) =>
                    updateFormData(
                      "maxAttempts",
                      parseInt(e.target.value) || undefined
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notifyUrl">Notify URL</Label>
              <Input
                id="notifyUrl"
                value={formData.notifyUrl}
                onChange={(e) => updateFormData("notifyUrl", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => updateFormData("message", e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitNotification}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Creating..." : "Create Manual Notification"}
            </Button>
          </div>
        </div>

        {/* Right Side - Transaction Logs */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">交易日誌</h3>

          <div className="border rounded-lg max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoadingLogs ? (
              <div className="p-4 text-center text-gray-500">
                Loading transaction logs...
              </div>
            ) : sortedLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No transaction logs available. Submit a notification to see
                logs.
              </div>
            ) : (
              <div className="space-y-0">
                {sortedLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className={classNames(
                      index % 2 === 0 ? "bg-white" : "bg-gray-50",
                      "px-4 py-3 border-b last:border-b-0"
                    )}
                  >
                    {/* Line 1: action, creatorType(creatorIdentifier, creatorIp), createdAt */}
                    <div className="flex items-center gap-4 text-sm mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-xs">動作:</span>
                        <span className="font-medium">
                          {TransactionLogActionDisplayNames[log.action] ||
                            log.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-xs">
                          觸發者類型:
                        </span>
                        <span className="text-xs text-gray-700">
                          {CreatorTypeDisplayNames[log.creatorType] ||
                            log.creatorType}
                          {log.creatorIdentifier && (
                            <span className="text-gray-500">
                              ({log.creatorIdentifier}
                              {log.creatorIp && `, ${log.creatorIp}`})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-gray-500 text-xs">時間:</span>
                        <span className="font-mono text-xs text-gray-600">
                          {convertDatabaseTimeToReadablePhilippinesTime(
                            log.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Line 2: method, route */}
                    {(log.route || log.method) && (
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <span className="text-gray-500">請求:</span>
                        <span className="text-gray-500 font-mono">
                          {log.method} {log.route}
                        </span>
                      </div>
                    )}

                    {/* Line 3: triggeredBy */}
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <span className="text-gray-500">觸發者:</span>
                      <span className="font-mono">
                        {log.triggeredBy || "系統"}
                      </span>
                    </div>

                    {/* Line 4: data */}
                    {log.data && (
                      <div className="mt-2">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 select-none text-sm px-2 py-1 bg-blue-50 rounded inline-block">
                            📋 查看詳情
                          </summary>
                          <div className="mt-2 bg-slate-900 rounded-md overflow-hidden">
                            <div className="bg-slate-800 px-3 py-1 text-xs text-slate-300 font-mono border-b border-slate-700">
                              JSON
                            </div>
                            <div
                              className="overflow-x-auto"
                              style={{ maxWidth: "calc(100vw - 120px)" }}
                            >
                              <pre
                                className="text-xs text-green-400 font-mono p-3 bg-slate-900 whitespace-pre-wrap break-words"
                                style={{ minWidth: "max-content" }}
                              >
                                <code className="language-json">
                                  {JSON.stringify(log.data, null, 2)}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
