import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import DashboardView from "@/modules/admin/dashboard/DashboardView";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="主頁" />
      <DashboardView />
    </div>
  );
}
