import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import ChannelBatchEditView from "@/modules/admin/organization-channel-batch-edit/ChannelBatchEditView";

export default function AdminOrganizationChannelBatchEditPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="批量編輯通道" />
      <ChannelBatchEditView />
    </div>
  );
}
