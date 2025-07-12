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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useState } from "react";

import { ApiGetTransactionById } from "@/lib/apis/transactions/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Transaction } from "@/lib/types/transaction";
import { TransactionStatus } from "@/lib/enums/transactions/transaction-status.enum";
import { TransactionStatusDisplayNames } from "@/lib/constants/transaction";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function ForceModifyTransactionView() {
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();

  // Query transaction state
  const [transactionId, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);

  // Force modify form state
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>();
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  // Dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Pre-fill current status
      setSelectedStatus(transactionData.status);
      setMessage(transactionData.message || "");

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

  const handleForceModify = async () => {
    if (!accessToken || !transaction || !selectedStatus) {
      toast({
        title: "Error",
        description: "Missing required data",
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
        title: "Success",
        description: "Transaction modified successfully",
      });

      // Refresh transaction data
      await handleQueryTransaction();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error force modifying transaction:", error);
      toast({
        title: "Error",
        description: "Failed to modify transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canForceModify =
    transaction && selectedStatus && selectedStatus !== transaction.status;

  return (
    <div className="w-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Transaction Details */}
        {transaction && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">交易詳情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Transaction ID
                </Label>
                <p className="font-mono text-sm">{transaction.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Type
                </Label>
                <p>{transaction.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Merchant ID
                </Label>
                <p className="font-mono text-sm">{transaction.merchantId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Amount
                </Label>
                <p>{transaction.amount}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Current Status
                </Label>
                <p className="font-semibold">
                  {TransactionStatusDisplayNames[transaction.status]}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Created At
                </Label>
                <p>
                  {convertDatabaseTimeToReadablePhilippinesTime(
                    transaction.createdAt
                  )}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">
                  Current Message
                </Label>
                <p className="text-sm">{transaction.message || "No message"}</p>
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
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as TransactionStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
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
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Enter transaction message..."
                />
              </div>

              <div>
                <Label htmlFor="reason">
                  Reason for Modification (Optional)
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Enter reason for this modification..."
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
                      This action is irreversible. Are you sure you want to
                      force modify this transaction?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <p>
                      <strong>Transaction ID:</strong> {transaction.id}
                    </p>
                    <p>
                      <strong>Current Status:</strong>{" "}
                      {TransactionStatusDisplayNames[transaction.status]}
                    </p>
                    <p>
                      <strong>New Status:</strong>{" "}
                      {selectedStatus &&
                        TransactionStatusDisplayNames[selectedStatus]}
                    </p>
                    {message && (
                      <p>
                        <strong>New Message:</strong> {message}
                      </p>
                    )}
                    {reason && (
                      <p>
                        <strong>Reason:</strong> {reason}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleForceModify}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? "Modifying..." : "Confirm Modify"}
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
