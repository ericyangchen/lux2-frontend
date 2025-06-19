import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantWithdrawalRequestListView } from "@/modules/admin/merchant-requested-withdrawals/MerchantWithdrawalRequestListView";

export default function AdminMerchantWithdrawalRequestPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="商戶下發請求" />
      <MerchantWithdrawalRequestListView />
    </div>
  );
}
