import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantUserActivityLogsView } from "@/modules/merchant/MerchantUserActivityLogsView";

export default function MerchantUserActivityLogsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="操作紀錄" />
      <MerchantUserActivityLogsView />
    </div>
  );
}
