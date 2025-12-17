import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { ApiCleanupTransactionsBatch } from "@/lib/apis/transactions/cleanup-batch";

export function TransactionCleanupSection() {
  const [transactionIds, setTransactionIds] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    if (!transactionIds.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one transaction ID",
        variant: "destructive",
      });
      return;
    }

    const { accessToken } = getApplicationCookies();
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Access token not found",
        variant: "destructive",
      });
      return;
    }

    // Parse transaction IDs from newline-separated string
    const ids = transactionIds
      .split("\n")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (ids.length === 0) {
      toast({
        title: "Error",
        description: "No valid transaction IDs found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiCleanupTransactionsBatch({
        transactionIds: ids,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to cleanup transactions");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description:
          data.message ||
          `Successfully cleaned up ${ids.length} transaction(s)`,
      });

      // Clear the input
      setTransactionIds("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cleanup transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Cleanup</CardTitle>
        <CardDescription>
          Clean up transactions by soft deleting them, hard deleting transaction
          logs, reversing balance changes, and hard deleting balance records.
          Enter transaction IDs separated by new lines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-ids">Transaction IDs</Label>
          <Textarea
            id="transaction-ids"
            placeholder="Enter transaction IDs, one per line&#10;ltx1234567890&#10;ltx0987654321"
            value={transactionIds}
            onChange={(e) => setTransactionIds(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            Enter one transaction ID per line. The cleanup will:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Soft delete the transactions</li>
              <li>Hard delete transaction logs</li>
              <li>Reverse balance changes</li>
              <li>Hard delete balance records</li>
            </ul>
          </p>
        </div>

        <Button
          onClick={handleCleanup}
          disabled={isLoading || !transactionIds.trim()}
          variant="destructive"
          className="w-fit"
        >
          {isLoading ? "Cleaning up..." : "Cleanup Transactions"}
        </Button>
      </CardContent>
    </Card>
  );
}
