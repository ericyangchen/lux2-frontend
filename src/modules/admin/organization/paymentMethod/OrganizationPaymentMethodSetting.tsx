import {
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";

import { Label } from "@/components/shadcn/ui/label";
import OrganizationPaymentMethodTable from "./OrganizationPaymentMethodTable";
import { classNames } from "@/lib/utils";
import { useState } from "react";

enum Tab {
  Deposit = "Deposit",
  Withdrawal = "Withdrawal",
}

const tabDisplayNames = {
  [Tab.Deposit]: TransactionTypeDisplayNames[TransactionType.DEPOSIT],
  [Tab.Withdrawal]: TransactionTypeDisplayNames[TransactionType.WITHDRAWAL],
};

export default function OrganizationPaymentMethodSetting({
  organizationId,
}: {
  organizationId: string;
}) {
  const [selectedTab, setSelectedTab] = useState<string>(Tab.Deposit);

  const type =
    selectedTab === Tab.Deposit
      ? TransactionType.DEPOSIT
      : TransactionType.WITHDRAWAL;

  return (
    <div className="py-8">
      <Label className="text-xl font-bold">通道設定</Label>

      <div className="px-0 sm:px-4 py-4">
        <div className="sm:hidden">
          <label className="sr-only">Select a tab</label>
          <select
            id="paymentMethod-tabs"
            name="tabs"
            defaultValue={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2"
          >
            {Object.values(Tab).map((tab) => (
              <option key={tab} value={tab}>
                {tabDisplayNames[tab]}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4">
            {Object.values(Tab).map((tab) => (
              <button
                key={tab}
                className={classNames(
                  tab === selectedTab
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  "rounded-md px-3 py-2 text-sm font-medium"
                )}
                onClick={() => setSelectedTab(tab)}
              >
                {tabDisplayNames[tab]}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <OrganizationPaymentMethodTable
        organizationId={organizationId}
        type={type}
      />
    </div>
  );
}
