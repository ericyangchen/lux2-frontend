import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { TestCallbackView } from "@/modules/admin/test-callback/TestCallbackView";

export default function AdminTestCallbackPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="測試回調" />
      <TestCallbackView />
    </div>
  );
}
