import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { UserActivityLogsView } from "@/modules/admin/user-activity-logs/UserActivityLogsView";

export default function AdminUserActivityLogsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="操作紀錄" />
      <UserActivityLogsView />
    </div>
  );
}
