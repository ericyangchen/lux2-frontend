import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  disableOrganizationTotpApi,
  setOrganizationTotpSecretApi,
} from "@/lib/apis/organizations/totp";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Organization } from "@/lib/types/organization";
import { getApplicationCookies } from "@/lib/cookie";
import { showTotpQrCodeInNewWindow } from "./utils";
import { useCheckOrganizationTotpEnabled } from "@/lib/hooks/swr/organization";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function EditOrganizationTotpDialog({
  isOpen,
  closeDialog,
  organization,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  organization: Organization;
}) {
  const { toast } = useToast();

  const { mutate } = useCheckOrganizationTotpEnabled({
    organizationId: organization.id,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTotp = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    try {
      setIsLoading(true);

      const response = await setOrganizationTotpSecretApi({
        organizationId: organization.id,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();

        toast({
          title: `驗證碼更新成功`,
          description: `驗證碼更新成功 單位ID: ${organization.id}`,
          variant: "success",
        });
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 驗證碼更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `驗證碼更新失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTotp = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    try {
      setIsLoading(true);

      const response = await disableOrganizationTotpApi({
        organizationId: organization.id,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        mutate();

        closeDialog();

        toast({
          title: `驗證碼停用成功`,
          description: `驗證碼停用成功 單位ID: ${organization.id}`,
          variant: "success",
        });
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 驗證碼停用失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `驗證碼停用失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯驗證碼</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleUpdateTotp}
            disabled={isLoading}
            variant="destructive"
          >
            更新驗證碼
          </Button>
          <Button
            onClick={handleDisableTotp}
            disabled={isLoading}
            variant="destructive"
          >
            停用驗證碼
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
