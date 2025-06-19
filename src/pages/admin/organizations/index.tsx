import { ApplicationHeader } from "@/modules/common/ApplicationHeader";
import { OrganizationDetail } from "@/modules/admin/organization/OrganizationDetail";
import { OrganizationList } from "@/modules/admin/organization/OrganizationList";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";

export default function AdminOrganizationListPage() {
  const { organizationId } = getApplicationCookies();

  const { organization } = useOrganizationWithChildren({ organizationId });

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>();

  return (
    <div className="flex flex-col h-full">
      <ApplicationHeader title="單位列表" />
      <div className="flex flex-col xl:flex-row gap-4">
        <OrganizationList
          organization={organization}
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
        />
        <div className="xl:w-[calc(100vw-288px-400px-48px)]">
          <OrganizationDetail organizationId={selectedOrganizationId} />
        </div>
      </div>
    </div>
  );
}
