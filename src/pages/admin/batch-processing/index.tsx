import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { BatchProcessingView } from "@/modules/admin/batch-processing/BatchProcessingView";

export default function AdminBatchProcessingPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="批量操作" />
      <BatchProcessingView />
    </div>
  );
}
