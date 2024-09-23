import OrganizationBalance from "./balance/OrganizationBalance";
import OrganizationInfo from "./info/OrganizationInfo";
import OrganizationPaymentMethodSetting from "./paymentMethod/OrganizationPaymentMethodSetting";
import { OrganizationSettings } from "./settings/OrganizationSettings";
import { useOrganizationInfo } from "@/lib/hooks/swr/organization";

export function OrganizationDetail({
  organizationId,
}: {
  organizationId?: string;
}) {
  const { organization } = useOrganizationInfo({ organizationId });

  if (!organizationId || !organization) {
    return (
      <div className="border rounded-lg p-4 flex h-full justify-center items-center">
        No organization selected
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 divide-y min-h-fit xl:h-[calc(100vh-84px)] xl:overflow-y-scroll">
      <OrganizationInfo organizationId={organizationId} />
      <OrganizationBalance organizationId={organizationId} />
      <OrganizationPaymentMethodSetting organizationId={organizationId} />
      <OrganizationSettings organizationId={organizationId} />
    </div>
  );
}
