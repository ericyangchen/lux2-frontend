import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { MerchantTransactionList } from "@/modules/merchant/MerchantTransactionList";

export default function MerchantTransactionListPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="訂單查詢" />
      <MerchantTransactionList />
    </div>
  );
}
