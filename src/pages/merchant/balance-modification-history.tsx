import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantBalanceModificationList } from "@/modules/merchant/MerchantBalanceModificationList";

export default function MerchantBalanceModificationHistoryPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <ApplicationHeader title="餘額異動記錄" />
      <div className="flex-1 overflow-hidden p-6">
        <MerchantBalanceModificationList />
      </div>
    </div>
  );
}
