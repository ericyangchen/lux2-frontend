import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BlockedAccountsView } from "@/modules/admin/blocked-accounts/BlockedAccountsView";

export default function AdminBlockedAccountsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="用戶帳號管理" />
      <BlockedAccountsView />
    </div>
  );
}
