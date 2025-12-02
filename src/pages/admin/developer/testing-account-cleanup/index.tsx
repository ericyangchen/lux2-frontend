import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { TestingAccountCleanup } from "@/modules/admin/developer/TestingAccountCleanup";

export default function TestingAccountCleanupPage() {
  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="測試帳號清理" />
      <TestingAccountCleanup />
    </div>
  );
}
