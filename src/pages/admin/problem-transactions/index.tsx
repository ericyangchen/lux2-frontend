import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { ProblemTransactionsView } from "@/modules/admin/problem-transactions/ProblemTransactionsView";

export default function AdminProblemTransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="待處理交易" />
      <ProblemTransactionsView />
    </div>
  );
}
