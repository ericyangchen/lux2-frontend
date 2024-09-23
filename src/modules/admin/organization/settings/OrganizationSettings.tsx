import { Label } from "@/components/shadcn/ui/label";
import { OrganizationIpWhitelistSetting } from "./OrganizationIpWhitelistSetting";
import { OrganizationUserSetting } from "./OrganizationUserSetting";
import { classNames } from "@/lib/utils";
import { useState } from "react";

enum Tab {
  User = "User",
  IpWhitelist = "IP Whitelist",
}

const tabDisplayNames = {
  [Tab.User]: "用戶",
  [Tab.IpWhitelist]: "IP 白名單",
};

export function OrganizationSettings({
  organizationId,
}: {
  organizationId: string;
}) {
  const [selectedTab, setSelectedTab] = useState<string>(Tab.User);

  return (
    <div className="pt-8">
      <Label className="text-xl font-bold">其他設定</Label>

      <div className="px-0 sm:px-4 py-4">
        <div className="sm:hidden">
          <label className="sr-only">Select a tab</label>
          <select
            id="settings-tabs"
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

      {selectedTab === Tab.User && (
        <OrganizationUserSetting organizationId={organizationId} />
      )}
      {selectedTab === Tab.IpWhitelist && (
        <OrganizationIpWhitelistSetting organizationId={organizationId} />
      )}
    </div>
  );
}
