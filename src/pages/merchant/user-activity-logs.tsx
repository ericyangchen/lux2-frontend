import { MerchantUserActivityLogsView } from "@/modules/merchant/MerchantUserActivityLogsView";

export default function MerchantUserActivityLogsPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">操作記錄</h1>
        <p className="text-sm text-slate-600">查看用戶的所有操作活動記錄</p>
      </div>
      <MerchantUserActivityLogsView />
    </div>
  );
}
