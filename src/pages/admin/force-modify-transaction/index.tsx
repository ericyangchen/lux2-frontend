import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { ForceModifyTransactionView } from "@/modules/admin/force-modify-transaction/ForceModifyTransactionView";

export default function AdminForceModifyTransactionPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="強制修改訂單" />
      <ForceModifyTransactionView />
    </div>
  );
}
