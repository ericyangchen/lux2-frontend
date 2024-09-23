import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useEffect, useState } from "react";
import {
  useOrganizationInfo,
  useOrganizationWithChildren,
} from "@/lib/hooks/swr/organization";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Organization } from "@/lib/types/organization";
import { getApplicationCookies } from "@/lib/cookie";
import { updateOrganizationInfoApi } from "@/lib/apis/organizations/organization";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function EditOrganizationInfoDialog({
  isOpen,
  closeDialog,
  organization,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  organization: Organization;
}) {
  const { toast } = useToast();

  const { organizationId: userOrganizationId } = getApplicationCookies();
  const { mutate: mutateList } = useOrganizationWithChildren({
    organizationId: userOrganizationId,
  });
  const { mutate: mutateInfo } = useOrganizationInfo({
    organizationId: organization.id,
  });

  const [name, setName] = useState(organization.name);

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateUser = async () => {
    const { accessToken } = getApplicationCookies();
    if (!name || !organization || !accessToken) return;
    try {
      setIsLoading(true);
      const response = await updateOrganizationInfoApi({
        organizationId: organization.id,
        name,
        accessToken,
      });
      const data = await response.json();
      if (response.ok) {
        closeDialog();
        toast({
          title: `單位更新成功`,
          description: `單位 ID: ${organization.id}`,
          variant: "success",
        });
        mutateInfo();
        mutateList();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 單位更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `單位更新失敗`,
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
    setName(organization.name);
  };

  useEffect(() => {
    setName(organization.name);
  }, [organization]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯單位</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名稱</Label>
            <Input
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdateUser} disabled={isLoading}>
            {isLoading ? "更新中..." : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
