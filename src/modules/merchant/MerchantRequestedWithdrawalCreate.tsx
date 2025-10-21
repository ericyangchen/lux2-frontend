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
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { ApiCreateMerchantRequestedWithdrawal } from "@/lib/apis/txn-merchant-requested-withdrawals/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { BANK_NAMES_MAPPING } from "@/lib/constants/bank-names";
import { Button } from "@/components/shadcn/ui/button";
import { Calculator } from "@/lib/utils/calculator";
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
import { cn } from "@/lib/utils/classname-utils";

export function MerchantRequestedWithdrawalCreate({
  setActiveTab,
}: {
  setActiveTab: (tab: MerchantRequestedWithdrawalTab) => void;
}) {
  const router = useRouter();
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
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 mb-6 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">建立商戶提領請求</h1>
          </div>
          <p className="text-indigo-100">填寫以下資訊來建立新的提領請求</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields Section */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <h2 className="font-semibold text-indigo-900">必填欄位</h2>
              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Order ID */}
            <div className="space-y-2">
              <Label
                htmlFor="merchantOrderId"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <CreditCardIcon className="h-4 w-4 text-indigo-500" />
                商戶訂單號 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="merchantOrderId"
                value={merchantOrderId}
                onChange={(e) => setMerchantOrderId(e.target.value)}
                placeholder="輸入唯一的商戶訂單號"
                className="font-mono border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <BanknotesIcon className="h-4 w-4 text-indigo-500" />
                金額 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如: 1000 或 1000.50"
                type="text"
                className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                支援最多三位小數，例如: 120, 120.00, 120.500
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label
                htmlFor="paymentMethod"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <CreditCardIcon className="h-4 w-4 text-indigo-500" />
                支付錢包 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400">
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
        </div>

        {/* Optional Payment Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              <h2 className="font-semibold text-purple-900">支付欄位</h2>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <Label
                htmlFor="bankName"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <BuildingLibraryIcon className="h-4 w-4 text-purple-500" />
                銀行名稱
              </Label>
              <Select
                value={bankName}
                onValueChange={(value) => setBankName(value)}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
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
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <CreditCardIcon className="h-4 w-4 text-purple-500" />
                銀行帳號
              </Label>
              <Input
                id="bankAccount"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="銀行帳號"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            {/* Receiver Name */}
            <div className="space-y-2">
              <Label
                htmlFor="receiverName"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4 text-purple-500" />
                收款人姓名
              </Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="收款人姓名"
                maxLength={50}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                最多 50 個字元
              </p>
            </div>

            {/* Receiver Email */}
            <div className="space-y-2">
              <Label
                htmlFor="receiverEmail"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <EnvelopeIcon className="h-4 w-4 text-purple-500" />
                收款人電郵
              </Label>
              <Input
                id="receiverEmail"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                placeholder="收款人電郵"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            {/* Receiver Phone */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="receiverPhoneNumber"
                className="text-slate-700 font-medium flex items-center gap-2"
              >
                <PhoneIcon className="h-4 w-4 text-purple-500" />
                收款人電話
              </Label>
              <Input
                id="receiverPhoneNumber"
                value={receiverPhoneNumber}
                onChange={(e) => setReceiverPhoneNumber(e.target.value)}
                placeholder="收款人電話"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-slate-400"></span>
                使用菲律賓手機號碼格式
              </p>
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
            className="border-slate-300 hover:bg-slate-50"
          >
            重設
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                提領請求已建立
              </DialogTitle>
              <p className="text-slate-600">你想要？</p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                // stay on page, preserve info
              }}
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              繼續建立新請求
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                resetForm();
                setActiveTab(MerchantRequestedWithdrawalTab.LIST);
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              查看已建立之請求
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
