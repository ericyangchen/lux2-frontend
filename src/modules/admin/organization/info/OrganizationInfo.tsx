import {
  OrganizationType,
  OrganizationTypeDisplayNames,
} from "@/lib/types/organization";
import {
  getOrganizationTotpQrCodeApi,
  setOrganizationTotpSecretApi,
} from "@/lib/apis/organizations/totp";
import {
  useCheckOrganizationTotpEnabled,
  useOrganizationInfo,
} from "@/lib/hooks/swr/organization";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { CreateSubOrganizationDialog } from "./CreateSubOrganizationDialog";
import { EditOrganizationInfoDialog } from "./EditOrganizationInfoDialog";
import { EditOrganizationTotpDialog } from "./EditOrganizationTotpDialog";
import { Label } from "@/components/shadcn/ui/label";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
import { getApplicationCookies } from "@/lib/cookie";
import { showTotpQrCodeInNewWindow } from "./utils";
import { toast } from "@/components/shadcn/ui/use-toast";
import { useState } from "react";

export default function OrganizationInfo({
  organizationId,
}: {
  organizationId: string;
}) {
  const { organization } = useOrganizationInfo({ organizationId });

  const { totpEnabled, mutate } = useCheckOrganizationTotpEnabled({
    organizationId,
  });

  const isMerchant = organization?.type === OrganizationType.MERCHANT;

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

  const handleShowTotpQrCode = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    try {
      const res = await getOrganizationTotpQrCodeApi({
        organizationId,
        accessToken,
      });

      const data = await res.json();

      if (res.ok) {
        // open qr code dialog
        toast({
          title: "QR Code 已在新分頁開啟",
          description: "",
          variant: "success",
        });

        if (
          !showTotpQrCodeInNewWindow({
            name: organization?.name,
            qrCode: data.qrCode,
          })
        ) {
          toast({
            title: "QR Code 在新分頁開啟失敗",
            description: "",
            variant: "destructive",
          });
        }
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - QR Code 開啟失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `QR Code 開啟失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const handleEnableTotp = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    try {
      const res = await setOrganizationTotpSecretApi({
        organizationId,
        accessToken,
      });

      const data = await res.json();

      if (res.ok) {
        mutate();

        // open qr code dialog
        toast({
          title: "QR Code 已在新分頁開啟",
          description: "",
          variant: "success",
        });

        if (
          !showTotpQrCodeInNewWindow({
            name: organization?.name,
            qrCode: data.qrCode,
          })
        ) {
          toast({
            title: "QR Code 在新分頁開啟失敗",
            description: "",
            variant: "destructive",
          });
        }
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - QR Code 開啟失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `QR Code 開啟失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const [isEditOrgTotpDialogOpen, setIsEditOrgTotpDialogOpen] = useState(false);

  const openEditTotpDialog = () => {
    setIsEditOrgTotpDialogOpen(true);
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
            <div className="text-base truncate max-w-[250px]">
              {organization.name}
            </div>
          </div>
          {/* type */}
          <div className="flex flex-col p-4">
            <div className="text-sm font-medium leading-6 text-gray-500">
              單位類別:
            </div>
            <div className="text-base font-mono">
              {OrganizationTypeDisplayNames[organization.type] ||
                organization.type}
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
            {totpEnabled ? (
              <>
                <Button variant="outline" onClick={handleShowTotpQrCode}>
                  顯示驗證碼
                </Button>
                <Button variant="outline" onClick={openEditTotpDialog}>
                  編輯驗證碼
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEnableTotp}>
                啟用驗證碼
              </Button>
            )}
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
      <EditOrganizationTotpDialog
        isOpen={isEditOrgTotpDialogOpen}
        closeDialog={() => setIsEditOrgTotpDialogOpen(false)}
        organization={organization}
      />
    </>
  );
}
