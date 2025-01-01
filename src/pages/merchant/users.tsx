import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantUserListView } from "@/modules/merchant/MerchantUserListView";

export default function MerchantUserListPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="用戶" />
      <MerchantUserListView />
    </div>
  );
}
