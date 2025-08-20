import { MerchantUserListView } from "@/modules/merchant/MerchantUserListView";

export default function MerchantUserListPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">用戶管理</h1>
        <p className="text-sm text-slate-600">管理商戶組織的用戶帳號</p>
      </div>
      <MerchantUserListView />
    </div>
  );
}
