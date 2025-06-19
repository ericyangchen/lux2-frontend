import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantRequestedWithdrawalView } from "@/modules/merchant/MerchantRequestedWithdrawalView";

export default function MerchantRequestedWithdrawalPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="商戶提領請求" />
      <MerchantRequestedWithdrawalView />
    </div>
  );
}
