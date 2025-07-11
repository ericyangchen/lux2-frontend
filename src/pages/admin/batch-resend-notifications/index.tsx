import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BatchResendNotificationsView } from "@/modules/admin/batch-resend-notifications/BatchResendNotificationsView";

export default function AdminBatchResendNotificationsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="批量重送回調" />
      <BatchResendNotificationsView />
    </div>
  );
}
