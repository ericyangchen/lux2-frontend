import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function MerchantRequestedWithdrawalCreate({
  setActiveTab,
}: {
  setActiveTab: (tab: MerchantRequestedWithdrawalTab) => void;
}) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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
    if (!/^\d+(\.\d{1,3})?$/.test(amount)) {
      toast({
        title: "金額格式錯誤",
        description: "金額必須是有效的數字，最多三位小數",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number if provided
    if (receiverPhoneNumber && !/^09\d{9}$/.test(receiverPhoneNumber)) {
      toast({
        title: "電話號碼格式錯誤",
        description: "請使用 09XXXXXXXXX 格式",
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
        setShowSuccessDialog(true); // show dialog
        // do not resetForm or setActiveTab here
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
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="border border-gray-200 bg-white mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
              建立商戶提領請求
            </h1>
          </div>
        </div>
        <div className="px-6 py-3">
          <p className="text-sm text-gray-600">
            填寫以下資訊來建立新的提領請求
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields Section */}
        <div className="bg-white border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                必填欄位
              </h2>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Order ID */}
            <div className="space-y-2">
              <Label
                htmlFor="merchantOrderId"
                className="text-gray-700 font-medium"
              >
                商戶訂單號 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="merchantOrderId"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
                placeholder="輸入唯一的商戶訂單號"
                className="font-mono border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 font-medium">
                金額 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如: 1000 或 1000.50"
                type="text"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
              <p className="text-xs text-gray-500">
                支援最多三位小數，例如: 120, 120.00, 120.500
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label
                htmlFor="paymentMethod"
                className="text-gray-700 font-medium"
              >
                通道 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue placeholder="選擇通道" />
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
        </div>

        {/* Optional Payment Details Section */}
        <div className="bg-white border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                支付欄位
              </h2>
              <span className="text-xs text-gray-500">(選填)</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-gray-700 font-medium">
                銀行名稱
              </Label>
              <Select
                value={bankName}
                onValueChange={(value) => setBankName(value)}
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue placeholder="選擇銀行名稱" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(BANK_NAMES_MAPPING).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label
                htmlFor="bankAccount"
                className="text-gray-700 font-medium"
              >
                銀行帳號
              </Label>
              <Input
                id="bankAccount"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="銀行帳號"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
            </div>

            {/* Receiver Name */}
            <div className="space-y-2">
              <Label
                htmlFor="receiverName"
                className="text-gray-700 font-medium"
              >
                收款人姓名
              </Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="收款人姓名"
                maxLength={50}
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
              <p className="text-xs text-gray-500">最多 50 個字元</p>
            </div>

            {/* Receiver Email */}
            <div className="space-y-2">
              <Label
                htmlFor="receiverEmail"
                className="text-gray-700 font-medium"
              >
                收款人電郵
              </Label>
              <Input
                id="receiverEmail"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                placeholder="收款人電郵"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
            </div>

            {/* Receiver Phone */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="receiverPhoneNumber"
                className="text-gray-700 font-medium"
              >
                收款人電話
              </Label>
              <Input
                id="receiverPhoneNumber"
                value={receiverPhoneNumber}
                onChange={(e) => setReceiverPhoneNumber(e.target.value)}
                placeholder="收款人電話"
                className="border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              />
              <p className="text-xs text-gray-500">使用菲律賓手機號碼格式</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isLoading}
            className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
          >
            重設
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></span>
                建立中...
              </span>
            ) : (
              "建立提領請求"
            )}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md border border-gray-200 rounded-none shadow-none">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-gray-900 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
                提領請求已建立
              </DialogTitle>
              <p className="text-sm text-gray-600">你想要？</p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                // stay on page, preserve info
              }}
              className="w-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-none rounded-none"
            >
              繼續建立新請求
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                resetForm();
                setActiveTab(MerchantRequestedWithdrawalTab.LIST);
              }}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
            >
              查看已建立之請求
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
