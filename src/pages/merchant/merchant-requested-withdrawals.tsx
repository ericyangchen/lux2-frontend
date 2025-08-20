import { MerchantRequestedWithdrawalView } from "@/modules/merchant/MerchantRequestedWithdrawalView";

export default function MerchantRequestedWithdrawalPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">申請下發</h1>
        <p className="text-sm text-slate-600">商戶提領請求管理</p>
      </div>
      <MerchantRequestedWithdrawalView />
    </div>
  );
}
