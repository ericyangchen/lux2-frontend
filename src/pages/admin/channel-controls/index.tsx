import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { ChannelControlView } from "@/modules/admin/channel-controls/ChannelControlView";

export default function ChannelControlPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="渠道管理" />
      <ChannelControlView />
    </div>
  );
}
