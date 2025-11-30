import { useCallback, useEffect, useState } from "react";

import { DirectAddBalance } from "./DirectAddBalance";
import { DirectSubtractBalance } from "./DirectSubtractBalance";
import { FreezeBalance } from "./FreezeBalance";
import { TransferBalance } from "./TransferBalance";
import { UnfreezeBalance } from "./UnfreezeBalance";
import { classNames } from "@/lib/utils/classname-utils";
import { useRouter } from "next/router";

enum Tab {
  DirectAddBalance = "DirectAddBalance",
  DirectSubtractBalance = "DirectSubtractBalance",
  FreezeBalance = "FreezeBalance",
  UnfreezeBalance = "UnfreezeBalance",
  TransferBalance = "TransferBalance",
}

const tabDisplayNames = {
  [Tab.TransferBalance]: "帳戶互轉",
  [Tab.DirectAddBalance]: "直接加值",
  [Tab.DirectSubtractBalance]: "直接扣除",
  [Tab.FreezeBalance]: "凍結餘額",
  [Tab.UnfreezeBalance]: "解凍餘額",
};

export function BalanceModificationView() {
  const router = useRouter();
  const { query } = router;

  const [selectedTab, setSelectedTab] = useState<string>(
    (query.tab as Tab) || Tab.DirectAddBalance
  );

  const handleSelectTab = useCallback(
    (tab: string) => {
      setSelectedTab(tab);

      router.push(
        {
          query: { tab },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  useEffect(() => {
    if (query.tab && Object.values(Tab).includes(query.tab as Tab)) {
      setSelectedTab(query.tab as Tab);
    } else {
      handleSelectTab(selectedTab);
    }
  }, [handleSelectTab, query.tab, selectedTab]);

  return (
    <div className="">
      {/* tab */}
      <div className="flex gap-4 pb-4 sm:pb-0">
        <div className="px-0 py-4 w-full">
          <div className="sm:hidden">
            <label className="sr-only">Select a tab</label>
            <select
              id="settings-tabs"
              name="tabs"
              defaultValue={selectedTab}
              onChange={(e) => handleSelectTab(e.target.value)}
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
                  onClick={() => handleSelectTab(tab)}
                >
                  {tabDisplayNames[tab]}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {selectedTab === Tab.TransferBalance && <TransferBalance />}
      {selectedTab === Tab.DirectAddBalance && <DirectAddBalance />}
      {selectedTab === Tab.DirectSubtractBalance && <DirectSubtractBalance />}
      {selectedTab === Tab.FreezeBalance && <FreezeBalance />}
      {selectedTab === Tab.UnfreezeBalance && <UnfreezeBalance />}
    </div>
  );
}
