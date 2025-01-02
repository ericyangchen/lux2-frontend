import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import MerchantDashboardView from "@/modules/merchant/MerchantDashboardView";

export default function MerchantDashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="系統主頁" />
      <MerchantDashboardView />
    </div>
  );
}
