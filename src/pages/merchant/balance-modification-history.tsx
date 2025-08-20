import { MerchantBalanceModificationList } from "@/modules/merchant/MerchantBalanceModificationList";

export default function MerchantBalanceModificationHistoryPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          餘額異動記錄
        </h1>
        <p className="text-sm text-slate-600">查看帳戶餘額的所有變動記錄</p>
      </div>
      <MerchantBalanceModificationList />
    </div>
  );
}
