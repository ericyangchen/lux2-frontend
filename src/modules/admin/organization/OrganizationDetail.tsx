import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import Link from "next/link";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import OrganizationBalance from "./balance/OrganizationBalance";
import OrganizationInfo from "./info/OrganizationInfo";
import OrganizationPaymentMethodSetting from "./paymentMethod/OrganizationPaymentMethodSetting";
import { OrganizationSettings } from "./settings/OrganizationSettings";
import { useOrganization } from "@/lib/hooks/swr/organization";

export function OrganizationDetail({
  organizationId,
}: {
  organizationId?: string;
}) {
  const { organization } = useOrganization({ organizationId });

  if (!organizationId || !organization) {
    return (
      <div className="border border-gray-200 p-4 flex h-full justify-center items-center bg-white">
        <span className="text-gray-500">No organization selected</span>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white p-4 divide-y divide-gray-200 min-h-fit xl:h-[calc(100vh-84px)] xl:overflow-y-scroll">
      <OrganizationInfo organizationId={organizationId} />
      <OrganizationBalance organizationId={organizationId} />
      {organization.type === OrgType.ADMIN ? (
        <div className="py-8">
          <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">通道設定</Label>

          <div className="px-0 sm:px-4 py-4 flex gap-2 items-center">
            <span className="text-sm text-gray-600">總代理請至</span>
            <Link href={`/admin/channel-controls`}>
              <Button variant="outline" className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50">上游設定</Button>
            </Link>
            <span className="text-sm text-gray-600">修改</span>
          </div>
        </div>
      ) : (
        <OrganizationPaymentMethodSetting organizationId={organizationId} />
      )}
      {organization.type !== OrgType.AGENT && (
        <OrganizationSettings organizationId={organizationId} />
      )}
    </div>
  );
}
