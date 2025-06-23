import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiCreateMerchantRequestedWithdrawal } from "@/lib/apis/txn-merchant-requested-withdrawals/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { BANK_NAMES_MAPPING } from "@/lib/constants/bank-names";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { MerchantRequestedWithdrawalTab } from "./MerchantRequestedWithdrawalView";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function MerchantRequestedWithdrawalCreate({
  setActiveTab,
}: {
  setActiveTab: (tab: MerchantRequestedWithdrawalTab) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [merchantOrderId, setMerchantOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [notifyUrl, setNotifyUrl] = useState("");

  // Payment method specific fields
  const [bankName, setBankName] = useState<string>("");
  const [bankAccount, setBankAccount] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverPhoneNumber, setReceiverPhoneNumber] = useState("");

  const resetForm = () => {
    setMerchantOrderId("");
    setAmount("");
    setPaymentMethod("");
    setNotifyUrl("");
    setBankName("");
    setBankAccount("");
    setReceiverName("");
    setReceiverEmail("");
    setReceiverPhoneNumber("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { accessToken, organizationId } = getApplicationCookies();

    if (!accessToken || !organizationId) {
      toast({
        title: "認證失敗",
        description: "請重新登入",
        variant: "destructive",
      });
      return;
    }

    if (!merchantOrderId || !amount || !paymentMethod) {
      toast({
        title: "表單錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      });
      return;
    }

    // Validate amount format
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      toast({
        title: "金額格式錯誤",
        description: "金額必須是有效的數字，最多兩位小數",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number if provided
    if (receiverPhoneNumber && !/^(\+63|0)?9\d{9}$/.test(receiverPhoneNumber)) {
      toast({
        title: "電話號碼格式錯誤",
        description: "請使用 +639XXXXXXXXX 或 09XXXXXXXXX 格式",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiCreateMerchantRequestedWithdrawal({
        type: TransactionType.MERCHANT_REQUESTED_WITHDRAWAL,
        paymentMethod,
        merchantId: organizationId,
        merchantOrderId,
        amount,
        notifyUrl: notifyUrl || undefined,
        bankName: bankName || undefined,
        bankAccount: bankAccount || undefined,
        receiverName: receiverName || undefined,
        receiverEmail: receiverEmail || undefined,
        receiverPhoneNumber: receiverPhoneNumber || undefined,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "提領請求建立成功",
          description: `商戶訂單號: ${merchantOrderId}`,
          variant: "success",
        });
        resetForm();

        // switch tab to pending withdrawals
        setActiveTab(MerchantRequestedWithdrawalTab.LIST);
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 建立失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "建立失敗",
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="sm:p-4 sm:border rounded-md">
        <div className="mb-6">
          <Label className="text-lg font-bold">建立商戶提領請求</Label>
          <p className="text-sm text-gray-600 mt-1">
            請填寫以下資訊來建立新的提領請求
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="merchantOrderId">
                商戶訂單號 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="merchantOrderId"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
                placeholder="輸入唯一的商戶訂單號"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                金額 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如: 1000 或 1000.50"
                type="text"
              />
              <p className="text-xs text-gray-500">
                支援最多兩位小數，例如: 120, 120.00, 120.50
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                支付錢包 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇支付錢包" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {PaymentMethodDisplayNames[method]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Fields */}
          {/* <div className="space-y-2">
            <Label htmlFor="notifyUrl">回調 URL (選填)</Label>
            <Input
              id="notifyUrl"
              value={notifyUrl}
              onChange={(e) => setNotifyUrl(e.target.value)}
              placeholder="https://your-domain.com/notify"
              type="url"
            />
          </div> */}

          <div className="border-t pt-6">
            <Label className="text-md font-semibold mb-4 block">支付欄位</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bankName">銀行名稱</Label>
                <Select
                  value={bankName}
                  onValueChange={(value) => setBankName(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇銀行名稱" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(BANK_NAMES_MAPPING).map(
                        ([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">銀行帳號</Label>
                <Input
                  id="bankAccount"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="銀行帳號"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverName">收款人姓名</Label>
                <Input
                  id="receiverName"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="收款人姓名"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">最多 50 個字元</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverEmail">收款人電郵</Label>
                <Input
                  id="receiverEmail"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  placeholder="收款人電郵"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverPhoneNumber">收款人電話</Label>
                <Input
                  id="receiverPhoneNumber"
                  value={receiverPhoneNumber}
                  onChange={(e) => setReceiverPhoneNumber(e.target.value)}
                  placeholder="收款人電話"
                />
                <p className="text-xs text-gray-500">使用菲律賓手機號碼格式</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
            >
              重設
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "建立中..." : "建立提領請求"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
