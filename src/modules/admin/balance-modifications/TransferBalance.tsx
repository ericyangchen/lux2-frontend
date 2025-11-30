import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiTransferBalance } from "@/lib/apis/balance-modifications/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import {
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
} from "@/lib/constants/transaction";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

export function TransferBalance() {
  const { toast } = useToast();

  const [sourceOrganizationId, setSourceOrganizationId] = useState<string>("");
  const [destinationOrganizationId, setDestinationOrganizationId] =
    useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");

  const { user } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleTransferBalance = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !user || disableButton) {
      return;
    }

    if (sourceOrganizationId === destinationOrganizationId) {
      toast({
        title: "錯誤",
        description: "轉出組織與轉入組織不能相同",
        variant: "destructive",
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: "請填寫備註",
        description: "帳戶互轉操作必須填寫備註",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiTransferBalance({
        sourceOrganizationId,
        destinationOrganizationId,
        paymentMethod: paymentMethod as PaymentMethod,
        amount,
        notes: notes || undefined,
        referenceId: referenceId || undefined,
        accessToken,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "帳戶互轉成功",
          description: `已從組織 ${sourceOrganizationId} 轉移 ${formatNumber(
            amount
          )} ${paymentMethod} 至組織 ${destinationOrganizationId}`,
          variant: "success",
        });

        setIsDialogOpen(true);
        clearAll();
      } else {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 帳戶互轉失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "帳戶互轉失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSourceOrganizationId("");
    setDestinationOrganizationId("");
    setPaymentMethod("");
    setAmount("");
    setNotes("");
    setReferenceId("");
  };

  const disableButton =
    !sourceOrganizationId ||
    !destinationOrganizationId ||
    !paymentMethod ||
    !amount ||
    !notes.trim();

  return (
    <>
      <div className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll">
        <Label className="whitespace-nowrap font-bold text-md">
          帳戶互轉
        </Label>

        <div className="flex flex-col gap-4 p-4">
          {/* sourceOrganizationId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px]">
              轉出組織 ID<span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={sourceOrganizationId}
              setSelectedOrganizationId={setSourceOrganizationId}
            />
          </div>

          {/* destinationOrganizationId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px]">
              轉入組織 ID<span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={destinationOrganizationId}
              setSelectedOrganizationId={setDestinationOrganizationId}
            />
          </div>

          {/* paymentMethod */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">
              通道<span className="text-red-500">*</span>
            </Label>
            <div className="w-fit min-w-[200px]">
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇通道" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PaymentMethodCurrencyMapping).map(
                    ([currency, methods]) => {
                      const validMethods = methods.filter(
                        (method): method is PaymentMethod =>
                          Object.values(PaymentMethod).includes(
                            method as PaymentMethod
                          )
                      );
                      if (validMethods.length === 0) return null;
                      return (
                        <SelectGroup key={currency}>
                          <SelectLabel className="text-xs text-gray-500">
                            {currency}
                          </SelectLabel>
                          {validMethods.map((method) => (
                            <SelectItem
                              key={method}
                              value={method}
                              className="pl-6"
                            >
                              {PaymentMethodDisplayNames[method]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* amount */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">
              金額<span className="text-red-500">*</span>
            </Label>
            <div className="w-fit min-w-[200px]">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* referenceId */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">參考編號</Label>
            <div className="w-fit min-w-[200px]">
              <Input
                placeholder="選填"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
          </div>

          {/* notes */}
          <div className="flex items-start gap-4">
            <Label className="whitespace-nowrap w-[70px] pt-2">
              備註 (必填)<span className="text-red-500">*</span>
            </Label>
            <div className="w-full lg:w-[400px]">
              <Textarea
                placeholder="請輸入備註..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleTransferBalance}
              disabled={disableButton || isLoading}
              className="w-fit"
            >
              {isLoading ? "處理中..." : "執行轉帳"}
            </Button>
            <Button variant="outline" onClick={clearAll} className="w-fit">
              清除
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>轉帳成功</DialogTitle>
            <DialogDescription>帳戶互轉操作已成功完成</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

