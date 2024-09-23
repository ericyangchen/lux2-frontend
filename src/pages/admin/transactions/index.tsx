import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { TransactionListView } from "@/modules/admin/transactions/TransactionListView";

export default function AdminTransactionListPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="訂單查詢" />
      <TransactionListView />
    </div>
  );
}
