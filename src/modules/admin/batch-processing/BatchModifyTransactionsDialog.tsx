import { Dialog, DialogContent } from "@/components/shadcn/ui/dialog";
import {
  HandleStuckTransactionsRequestBody,
  handleStuckTransactionsApi,
} from "@/lib/apis/transactions";
import {
  PaymentChannel,
  PaymentChannelDisplayNames,
  Transaction,
} from "@/lib/types/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useMemo, useState } from "react";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { getApplicationCookies } from "@/lib/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";

// const checkIfAllTransactionsHaveSamePaymentChannel = (
//   transactions: Transaction[],
//   selectedTransactionIds: string[]
// ) => {
//   if (!transactions) return false;

//   const selectedTransactions = transactions.filter((transaction) =>
//     selectedTransactionIds.includes(transaction.id)
//   );

//   const paymentChannels = selectedTransactions.map(
//     (transaction) => transaction.paymentChannel
//   );

//   return paymentChannels.every(
//     (paymentChannel) => paymentChannel === paymentChannels[0]
//   );
// };

export function BatchModifyTransactionsDialog({
  isOpen,
  closeDialog,
  transactions,
  selectedTransactionIds,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  transactions: Transaction[];
  selectedTransactionIds: string[];
}) {
  const { toast } = useToast();

  const handleCloseDialog = () => {
    closeDialog();
  };

  const [isLoading, setIsLoading] = useState(false);

  // paymentChannel
  const [paymentChannel, setPaymentChannel] = useState<
    PaymentChannel | "all"
  >();

  // note
  const [note, setNote] = useState("");

  const handleBatchResend = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !selectedTransactionIds) {
      return;
    }

    try {
      setIsLoading(true);

      const newPaymentChannel =
        !paymentChannel || paymentChannel === "all"
          ? undefined
          : paymentChannel;

      const response = await handleStuckTransactionsApi({
        body: {
          ids: selectedTransactionIds,
          newPaymentChannel,
        } as HandleStuckTransactionsRequestBody,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "重送訂單成功",
          description: `成功重送 ${selectedTransactionIds?.length} 筆訂單`,
          variant: "success",
        });
        handleCloseDialog();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: "重送訂單失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "重送訂單失敗",
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
          <Label className="whitespace-nowrap font-semibold text-2xl text-red-600">
            批量操作 {selectedTransactionIds?.length} 筆訂單
          </Label>

          <div className="flex flex-col gap-2">
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              重送訂單
            </Label>
            <div className="flex flex-col items-start gap-2 w-full min-h-6">
              <div>
                <Button
                  variant="destructive"
                  onClick={handleBatchResend}
                  disabled={isLoading}
                >
                  批量重送
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              更換上游渠道並重送訂單
            </Label>
            {/* paymentChannel */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">上游渠道</Label>
              <div className="w-fit min-w-[150px]">
                <Select
                  defaultValue={paymentChannel}
                  value={paymentChannel}
                  onValueChange={(value) =>
                    setPaymentChannel(value as PaymentChannel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"all"} className="h-8"></SelectItem>
                      {Object.values(PaymentChannel)?.map((paymentChannel) => (
                        <SelectItem key={paymentChannel} value={paymentChannel}>
                          {PaymentChannelDisplayNames[paymentChannel]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 w-full min-h-6">
              <div>
                <Button
                  variant="destructive"
                  onClick={handleBatchResend}
                  disabled={
                    isLoading || !paymentChannel || paymentChannel === "all"
                  }
                >
                  批量重送
                </Button>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-col gap-2">
            <Label className="whitespace-nowrap font-bold text-md mt-8">
              備註
            </Label>
            <div className="flex flex-col items-start gap-2 w-full min-h-6">
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
              <div>
                <Button variant="destructive">批量更新備注</Button>
              </div>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
