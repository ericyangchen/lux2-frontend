import { useState, useEffect } from "react";
import { Organization } from "@/lib/types/organization";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrgTypeDisplayNames } from "@/lib/constants/organization";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { flattenOrganizations } from "@/modules/admin/common/flattenOrganizations";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { classNames } from "@/lib/utils/classname-utils";

interface OrganizationListProps {
  selectedOrganization?: Organization;
  onSelectOrganization: (organization: Organization) => void;
}

export const OrganizationList = ({
  selectedOrganization,
  onSelectOrganization,
}: OrganizationListProps) => {
  const [mounted, setMounted] = useState(false);
  const { organizationId } = getApplicationCookies();
  const { organization, isLoading, isError } = useOrganizationWithChildren({
    organizationId,
  });

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 自動選擇第一個組織
  useEffect(() => {
    if (mounted && organization && !selectedOrganization) {
      // 獲取所有組織並只選擇 MERCHANT 類型的組織
      const allOrganizations = flattenOrganizations(organization);
      const merchantOrganizations = allOrganizations.filter(
        (org: Organization) => org.type === OrgType.MERCHANT
      );
      if (merchantOrganizations.length > 0) {
        onSelectOrganization(merchantOrganizations[0]);
      }
    }
  }, [organization, selectedOrganization, mounted, onSelectOrganization]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>組織列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>組織列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">載入失敗</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>組織列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 只顯示 MERCHANT 類型的組織
  const allOrganizations = organization
    ? flattenOrganizations(organization)
    : [];
  const merchantOrganizations = allOrganizations.filter(
    (org: Organization) => org.type === OrgType.MERCHANT
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>組織列表</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-2">
          {merchantOrganizations.map((organization) => (
            <div
              key={organization.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOrganization?.id === organization.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelectOrganization(organization)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base">
                      {organization.name}
                    </h3>
                    <Badge variant="secondary">
                      {OrgTypeDisplayNames[organization.type as OrgType]}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {merchantOrganizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">尚無組織</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
