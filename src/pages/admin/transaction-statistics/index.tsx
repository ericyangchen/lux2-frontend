import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { OrganizationList } from "@/modules/admin/organization/OrganizationList";
import { TransactionStatistics } from "@/modules/admin/organization/TransactionStatistics";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";

export default function AdminTransactionStatisticsPage() {
  const { organizationId } = getApplicationCookies();

  const { organization } = useOrganizationWithChildren({ organizationId });

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>();

  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="交易統計" />
      <div className="flex flex-col xl:flex-row gap-4">
        <OrganizationList
          organization={organization}
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
        />
        <div className="xl:w-[calc(100vw-288px-400px-48px)] xl:max-h-[calc(100vh-84px)] overflow-y-auto">
          <TransactionStatistics organizationId={selectedOrganizationId} />
        </div>
      </div>
    </div>
  );
}
