import { useCallback, useEffect, useState } from "react";

import ChannelListTable from "./ChannelListTable";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { useRouter } from "next/router";

enum Tab {
  DepositChannelList = "DepositChannelList",
  WithdrawalChannelList = "WithdrawalChannelList",
}

const tabDisplayNames = {
  [Tab.DepositChannelList]: "代收渠道",
  [Tab.WithdrawalChannelList]: "代付渠道",
};

export function ChannelControlView() {
  const router = useRouter();
  const { query } = router;

  const [selectedTab, setSelectedTab] = useState<string>(
    (query.tab as Tab) || Tab.DepositChannelList
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

      {selectedTab === Tab.DepositChannelList && (
        <ChannelListTable transactionType={TransactionType.API_DEPOSIT} />
      )}
      {selectedTab === Tab.WithdrawalChannelList && (
        <ChannelListTable transactionType={TransactionType.API_WITHDRAWAL} />
      )}
    </div>
  );
}
