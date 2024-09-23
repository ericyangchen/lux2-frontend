import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { ManualActionView } from "@/modules/admin/manual-actions/ManualActionView";

export default function AdminManualActionListPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="手動作業" />
      <ManualActionView />
    </div>
  );
}
