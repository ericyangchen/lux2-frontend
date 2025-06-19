import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BalanceModificationView } from "@/modules/admin/balance-modifications/BalanceModificationView";

export default function AdminBalanceModificationPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="餘額操作" />
      <BalanceModificationView />
    </div>
  );
}
