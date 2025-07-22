import { TxnRoutingRulesView } from "@/modules/admin/txn-routing-rules/TxnRoutingRulesView";
import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";

export default function TxnRoutingRulesPage() {
  useAuthGuard();

  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="路由規則" />
      <TxnRoutingRulesView />
    </div>
  );
}
