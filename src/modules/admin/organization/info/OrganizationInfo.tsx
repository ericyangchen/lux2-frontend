import { ApplicationError } from "@/lib/error/applicationError";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { CreateSubOrganizationDialog } from "./CreateSubOrganizationDialog";
import { EditOrganizationInfoDialog } from "./EditOrganizationInfoDialog";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrgTypeDisplayNames } from "@/lib/constants/organization";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { showTotpQrCodeInNewWindow } from "./utils";
import { toast } from "@/components/shadcn/ui/use-toast";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useState } from "react";

export default function OrganizationInfo({
  organizationId,
}: {
  organizationId: string;
}) {
  const { organization } = useOrganization({ organizationId });

  const isMerchant = organization?.type === OrgType.MERCHANT;

  const [isCreateSubOrgDialogOpen, setIsCreateSubOrgDialogOpen] =
    useState(false);

  const openCreateSubOrgDialog = () => {
    setIsCreateSubOrgDialogOpen(true);
  };
  const closeCreateSubOrgDialog = () => {
    setIsCreateSubOrgDialogOpen(false);
  };

  const [isEditOrgDialogOpen, setIsEditOrgDialogOpen] = useState(false);
  const openEditDialog = () => {
    setIsEditOrgDialogOpen(true);
  };
  const closeEditDialog = () => {
    setIsEditOrgDialogOpen(false);
  };

  return (
    <>
      <div className="py-4">
        <Label className="text-xl font-bold">資訊</Label>

        <div className="flex flex-wrap">
          {/* name */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              單位名稱:
            </div>
            <div className="text-base truncate max-w-[250px] flex items-center gap-2">
              {organization.name}
              {organization.isTestingAccount && (
                <Badge variant="outline" className="bg-yellow-500 text-black">
                  測試帳號
                </Badge>
              )}
            </div>
          </div>
          {/* type */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              單位類別:
            </div>
            <div className="text-base font-mono">
              {OrgTypeDisplayNames[organization.type] || organization.type}
            </div>
          </div>
          {/* id */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              單位 ID:
            </div>
            <div
              className="text-base cursor-pointer font-mono"
              onClick={() =>
                copyToClipboard({
                  toast,
                  description: `單位 ID: ${organization.id}`,
                  copyingText: organization.id,
                })
              }
            >
              {organization.id}
            </div>
          </div>
          {/* createdAt */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              創建時間:
            </div>
            <div className="text-base">
              {convertDatabaseTimeToReadablePhilippinesTime(
                organization.createdAt
              )}
            </div>
          </div>
          {/* updatedAt */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              更新時間:
            </div>
            <div className="text-base">
              {convertDatabaseTimeToReadablePhilippinesTime(
                organization.updatedAt
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4">
          <div className="text-sm font-medium leading-6 text-gray-500">
            操作:
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openEditDialog}>
              編輯單位
            </Button>
            {!isMerchant && (
              <Button variant="outline" onClick={openCreateSubOrgDialog}>
                新增子單位
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <CreateSubOrganizationDialog
        isOpen={isCreateSubOrgDialogOpen}
        closeDialog={closeCreateSubOrgDialog}
        parentOrganizationId={organizationId}
      />
      <EditOrganizationInfoDialog
        isOpen={isEditOrgDialogOpen}
        closeDialog={closeEditDialog}
        organization={organization}
      />
    </>
  );
}
