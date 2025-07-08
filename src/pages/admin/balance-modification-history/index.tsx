import { AdminBalanceModificationList } from "@/modules/admin/balance-modifications/AdminBalanceModificationList";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";

export default function AdminBalanceModificationHistoryPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <ApplicationHeader title="餘額異動記錄 (管理)" />
      <div className="flex-1 overflow-hidden p-6">
        <AdminBalanceModificationList />
      </div>
    </div>
  );
}
