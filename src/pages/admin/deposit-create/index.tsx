import { AdminDepositCreateView } from "@/modules/admin/deposit-create/AdminDepositCreateView";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";

export default function AdminDepositCreatePage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="代收開單" />
      <AdminDepositCreateView />
    </div>
  );
}
