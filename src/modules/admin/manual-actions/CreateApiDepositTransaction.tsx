import {
  CreateDepositTransactionRequestBody,
  CreateDepositTransactionResponseBody,
  PaymentMethod,
  PaymentMethodDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
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
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationSearchBar } from "../common/OrganizationSearchBar";
import { OrganizationType } from "@/lib/types/organization";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { formatNumberWithoutMinFraction } from "@/lib/number";
import { generalAgentCreateApiDepositTransactionApi } from "@/lib/apis/transactions";
import { getApplicationCookies } from "@/lib/cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

export default function CreateApiDepositTransaction() {
  const router = useRouter();

  const { toast } = useToast();

  const { user } = useUser();

  const [body, setBody] = useState<
    Partial<CreateDepositTransactionRequestBody>
  >({});

  const setMerchantId = (merchantId: string) => {
    setBody((prev) => ({ ...prev, merchantId }));
  };
  const setMerchantOrderId = (merchantOrderId: string) => {
    setBody((prev) => ({ ...prev, merchantOrderId }));
  };
  const setPaymentMethod = (paymentMethod: PaymentMethod) => {
    setBody((prev) => ({ ...prev, paymentMethod }));
  };
  const setAmount = (amount: string) => {
    setBody((prev) => ({ ...prev, amount }));
  };
  const setNotifyUrl = (notifyUrl: string) => {
    setBody((prev) => ({ ...prev, notifyUrl }));
  };
  const setBankName = (bankName: string) => {
    setBody((prev) => ({ ...prev, bankName }));
  };
  const setSenderName = (senderName: string) => {
    setBody((prev) => ({ ...prev, senderName }));
  };
  const setNote = (note: string) => {
    setBody((prev) => ({ ...prev, note }));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [createdApiDepositTransaction, setCreatedApiDepositTransaction] =
    useState<CreateDepositTransactionResponseBody>();

  const handleCreateApiDepositTransaction = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !user || disableButton) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await generalAgentCreateApiDepositTransactionApi({
        body: body as CreateDepositTransactionRequestBody,
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: `提交代收訂單 成功`,
          description: `ID: ${data?.id}`,
          variant: "success",
        });

        setCreatedApiDepositTransaction(data);
        setIsDialogOpen(true);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 提交代收訂單 失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `提交代收訂單 失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setBody({});
    setCreatedApiDepositTransaction(undefined);
  };

  const disableButton =
    !body.merchantId || !body.paymentMethod || !body.amount || isLoading;

  return (
    <>
      <div className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll">
        <Label className="whitespace-nowrap font-bold text-md">
          手動提交代收訂單
        </Label>

        <div className="flex flex-col gap-4 p-4">
          {/* TransactionType */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">
              類別<span className="text-red-500">*</span>
            </Label>
            <Select value={TransactionType.DEPOSIT} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"all"} className="h-8"></SelectItem>
                  <SelectItem value={TransactionType.DEPOSIT}>
                    {TransactionTypeDisplayNames[TransactionType.DEPOSIT]}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* merchantId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">
              單位 ID<span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={body?.merchantId}
              setSelectedOrganizationId={setMerchantId}
              organizationType={OrganizationType.MERCHANT}
            />
          </div>

          {/* merchantOrderId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">商戶訂單號</Label>
            <Input
              className="w-[350px]"
              value={body?.merchantOrderId}
              onChange={(e) => setMerchantOrderId(e.target.value)}
              placeholder="預設為系統自動訂單號"
            />
          </div>

          {/* paymentMethod */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[90px]">
              通道<span className="text-red-500">*</span>
            </Label>
            <div className="w-fit min-w-[150px]">
              <Select
                defaultValue={body?.paymentMethod}
                value={body?.paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(PaymentMethod).map((paymentMethod) => {
                      return (
                        <SelectItem key={paymentMethod} value={paymentMethod}>
                          {PaymentMethodDisplayNames[paymentMethod]}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* amount */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">
              充值金額<span className="text-red-500">*</span>
            </Label>
            <Input
              className="w-[150px]"
              value={body?.amount}
              type="number"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* notifyUrl */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">notifyUrl</Label>
            <Input
              className="w-[400px]"
              value={body?.notifyUrl}
              onChange={(e) => setNotifyUrl(e.target.value)}
            />
          </div>

          {/* bankName */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">bankName</Label>
            <Input
              className="w-[150px]"
              value={body?.bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>

          {/* senderName */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">senderName</Label>
            <Input
              className="w-[150px]"
              value={body?.senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          {/* note */}
          <div className="flex items-start gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px] mt-[11px]">
              備註
            </Label>

            <Textarea
              className="w-full sm:min-w-[350px]"
              value={body?.note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* operator */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[90px]">操作員</Label>
            <Input className="w-[350px]" value={user?.id} disabled />
          </div>
        </div>

        {/* submit button */}
        <div className="pt-4">
          <Button
            className="w-[120px]"
            onClick={handleCreateApiDepositTransaction}
            disabled={disableButton}
          >
            {isLoading ? "提交中..." : "提交訂單"}
          </Button>
        </div>
      </div>

      {createdApiDepositTransaction && (
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
              <DialogTitle>提交代收訂單 成功</DialogTitle>
              <DialogDescription className="text-black pt-4">
                <div>
                  <Label className="whitespace-nowrap font-bold text-md pb-4">
                    回覆
                  </Label>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      id:
                    </Label>
                    <div
                      className="font-mono cursor-pointer"
                      onClick={() =>
                        copyToClipboard({
                          toast,
                          copyingText: createdApiDepositTransaction.id,
                          title: "已複製系統自動訂單號",
                        })
                      }
                    >
                      {createdApiDepositTransaction.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      merchantId:
                    </Label>
                    <div
                      className="font-mono cursor-pointer"
                      onClick={() =>
                        copyToClipboard({
                          toast,
                          copyingText: createdApiDepositTransaction.merchantId,
                          title: "已複製單位 ID",
                        })
                      }
                    >
                      {createdApiDepositTransaction.merchantId}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      merchantOrderId:
                    </Label>
                    <div
                      className="font-mono cursor-pointer"
                      onClick={() =>
                        copyToClipboard({
                          toast,
                          copyingText:
                            createdApiDepositTransaction.merchantOrderId,
                          title: "已複製商戶訂單號",
                        })
                      }
                    >
                      {createdApiDepositTransaction.merchantOrderId}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      paymentMethod:
                    </Label>
                    <div className="font-mono">
                      {
                        PaymentMethodDisplayNames[
                          createdApiDepositTransaction.paymentMethod as PaymentMethod
                        ]
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      amount:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        createdApiDepositTransaction.amount
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      totalFee:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        createdApiDepositTransaction.totalFee
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      balanceChanged:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        createdApiDepositTransaction.balanceChanged
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      status:
                    </Label>
                    <div className="font-mono">
                      {createdApiDepositTransaction.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      message:
                    </Label>
                    <div className="font-mono">
                      {createdApiDepositTransaction?.message}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      createdAt:
                    </Label>
                    <div className="font-mono">
                      {convertDatabaseTimeToReadablePhilippinesTime(
                        createdApiDepositTransaction.createdAt
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[120px]">
                      paymentUrl:
                    </Label>
                    <div className="font-mono">
                      <a
                        href={createdApiDepositTransaction?.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {createdApiDepositTransaction?.paymentUrl}
                      </a>
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
                      `/admin/transactions?tab=ApiTransaction&transactionId=${createdApiDepositTransaction.id}`
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
