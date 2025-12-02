import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { AvailableChannelsView } from "@/modules/admin/organization-available-channels/AvailableChannelsView";

export default function AdminOrganizationAvailableChannelsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="單位可用渠道" />
      <AvailableChannelsView />
    </div>
  );
}

