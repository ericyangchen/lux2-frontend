import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  ManualTransaction,
  ManualTransactionType,
  ManualTransactionTypeDisplayNames,
} from "@/lib/types/manual-transaction";
import {
  PaymentMethod,
  PaymentMethodDisplayNames,
} from "@/lib/types/transaction";
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
import { Textarea } from "@/components/shadcn/ui/textarea";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { createManualTransactionApi } from "@/lib/apis/manual-transactions";
import { formatNumberWithoutMinFraction } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

export default function ManualDeposit() {
  const router = useRouter();

  const { toast } = useToast();

  const [manualTransactionType, setManualTransactionType] =
    useState<ManualTransactionType>(ManualTransactionType.MANUAL_DEPOSIT);
  const [organizationId, setOrganizationId] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const { user } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [createdManualTransaction, setCreatedManualTransaction] =
    useState<ManualTransaction>();

  const handleAddManualDeposit = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken || !user || disableButton) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await createManualTransactionApi({
        type: manualTransactionType,
        organizationId,
        paymentMethod,
        amount,
        additionalInfo: {
          note,
        },
        accessToken,
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: `手動充值訂單 新增成功`,
          description: `ID: ${data?.manualTransaction.id}`,
          variant: "success",
        });

        setCreatedManualTransaction(data?.manualTransaction);
        setIsDialogOpen(true);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 手動充值訂單 新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `手動充值訂單 新增失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setOrganizationId("");
    setPaymentMethod("");
    setAmount("");
    setNote("");
    setCreatedManualTransaction(undefined);
  };

  const disableButton = !organizationId || !paymentMethod || !amount;

  return (
    <>
      <div className="sm:p-4 sm:border rounded-md w-full lg:h-[calc(100vh-152px)] lg:overflow-y-scroll">
        <Label className="whitespace-nowrap font-bold text-md">
          新增手動充值訂單
        </Label>

        <div className="flex flex-col gap-4 p-4">
          {/* manualTransactionType */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px]">
              類別<span className="text-red-500">*</span>
            </Label>
            <Select
              defaultValue={manualTransactionType}
              value={manualTransactionType}
              onValueChange={(value) =>
                setManualTransactionType(value as ManualTransactionType)
              }
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"all"} className="h-8"></SelectItem>
                  <SelectItem value={ManualTransactionType.MANUAL_DEPOSIT}>
                    {
                      ManualTransactionTypeDisplayNames[
                        ManualTransactionType.MANUAL_DEPOSIT
                      ]
                    }
                  </SelectItem>
                  <SelectItem value={ManualTransactionType.MANUAL_WITHDRAWAL}>
                    {
                      ManualTransactionTypeDisplayNames[
                        ManualTransactionType.MANUAL_WITHDRAWAL
                      ]
                    }
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* organizationId */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px]">
              單位 ID<span className="text-red-500">*</span>
            </Label>
            <OrganizationSearchBar
              selectedOrganizationId={organizationId}
              setSelectedOrganizationId={setOrganizationId}
            />
          </div>

          {/* paymentMethod */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">
              通道<span className="text-red-500">*</span>
            </Label>
            <div className="w-fit min-w-[150px]">
              <Select
                defaultValue={paymentMethod}
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
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
            <Label className="whitespace-nowrap min-w-[70px]">
              充值金額<span className="text-red-500">*</span>
            </Label>
            <Input
              className="w-[150px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* additionalInfo */}
          <div className="flex items-start gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px] mt-[11px]">
              備註
            </Label>

            <Textarea
              className="w-full sm:min-w-[350px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* operator */}
          <div className="flex items-center gap-4 w-full lg:w-fit">
            <Label className="whitespace-nowrap min-w-[70px]">操作員</Label>
            <Input className="w-[350px]" value={user?.id} disabled />
          </div>
        </div>

        {/* submit button */}
        <div className="pt-4">
          <Button
            className="w-[120px]"
            onClick={handleAddManualDeposit}
            disabled={disableButton}
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </div>
      </div>

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
              <DialogTitle>手動充值訂單 新增成功</DialogTitle>
              <DialogDescription className="text-black pt-4">
                <div>
                  <Label className="whitespace-nowrap font-bold text-md pb-4">
                    訂單資訊
                  </Label>

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
                    <div
                      className="font-mono cursor-pointer"
                      onClick={() =>
                        copyToClipboard({
                          toast,
                          copyingText: createdManualTransaction.organizationId,
                          title: "已複製單位 ID",
                        })
                      }
                    >
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
                      金額:
                    </Label>
                    <div className="font-mono">
                      {formatNumberWithoutMinFraction(
                        createdManualTransaction.amount
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 w-full lg:w-fit min-h-6">
                    <Label className="whitespace-nowrap min-w-[100px] mt-[5px]">
                      備註:
                    </Label>
                    <div className="font-mono">
                      {createdManualTransaction.additionalInfo && (
                        <pre className="text-xs bg-gray-100 rounded-md whitespace-pre-wrap p-4 overflow-auto">
                          {JSON.stringify(
                            createdManualTransaction.additionalInfo,
                            null,
                            2
                          )}
                        </pre>
                      )}
                    </div>
                  </div>

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
