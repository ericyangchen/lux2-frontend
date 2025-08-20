import { MerchantTransactionList } from "@/modules/merchant/MerchantTransactionList";

export default function MerchantTransactionListPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">訂單查詢</h1>
        <p className="text-sm text-slate-600">查看和管理所有交易訂單</p>
      </div>
      <MerchantTransactionList />
    </div>
  );
}
