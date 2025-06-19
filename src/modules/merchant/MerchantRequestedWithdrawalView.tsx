import { Button } from "@/components/shadcn/ui/button";
import { MerchantRequestedWithdrawalCreate } from "./MerchantRequestedWithdrawalCreate";
import { MerchantRequestedWithdrawalList } from "./MerchantRequestedWithdrawalList";
import { classNames } from "@/lib/utils/classname-utils";
import { useState } from "react";

export function MerchantRequestedWithdrawalView() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "list" ? "default" : "outline"}
            onClick={() => setActiveTab("list")}
            className={classNames(
              "px-6",
              activeTab === "list" ? "" : "text-gray-600"
            )}
          >
            查看提領請求
          </Button>
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            onClick={() => setActiveTab("create")}
            className={classNames(
              "px-6",
              activeTab === "create" ? "" : "text-gray-600"
            )}
          >
            建立提領請求
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "list" && <MerchantRequestedWithdrawalList />}
        {activeTab === "create" && <MerchantRequestedWithdrawalCreate />}
      </div>
    </div>
  );
}
