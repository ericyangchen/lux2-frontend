import { Button } from "@/components/shadcn/ui/button";
import { MerchantRequestedWithdrawalCreate } from "./MerchantRequestedWithdrawalCreate";
import { MerchantRequestedWithdrawalList } from "./MerchantRequestedWithdrawalList";
import { classNames } from "@/lib/utils/classname-utils";
import { useState } from "react";

export enum MerchantRequestedWithdrawalTab {
  LIST = "LIST",
  CREATE = "CREATE",
}

export function MerchantRequestedWithdrawalView() {
  const [activeTab, setActiveTab] = useState<MerchantRequestedWithdrawalTab>(
    MerchantRequestedWithdrawalTab.LIST
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="flex gap-2">
          <Button
            variant={
              activeTab === MerchantRequestedWithdrawalTab.LIST
                ? "default"
                : "outline"
            }
            onClick={() => setActiveTab(MerchantRequestedWithdrawalTab.LIST)}
            className={classNames(
              "px-6",
              activeTab === MerchantRequestedWithdrawalTab.LIST
                ? ""
                : "text-gray-600"
            )}
          >
            查看提領請求
          </Button>
          <Button
            variant={
              activeTab === MerchantRequestedWithdrawalTab.CREATE
                ? "default"
                : "outline"
            }
            onClick={() => setActiveTab(MerchantRequestedWithdrawalTab.CREATE)}
            className={classNames(
              "px-6",
              activeTab === MerchantRequestedWithdrawalTab.CREATE
                ? ""
                : "text-gray-600"
            )}
          >
            建立提領請求
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === MerchantRequestedWithdrawalTab.LIST && (
          <MerchantRequestedWithdrawalList setActiveTab={setActiveTab} />
        )}
        {activeTab === MerchantRequestedWithdrawalTab.CREATE && (
          <MerchantRequestedWithdrawalCreate setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
}
