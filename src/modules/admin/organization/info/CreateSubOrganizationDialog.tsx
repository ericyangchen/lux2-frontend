import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiCreateOrganization } from "@/lib/apis/organizations/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrgTypeDisplayNames } from "@/lib/constants/organization";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function CreateSubOrganizationDialog({
  isOpen,
  closeDialog,
  parentOrganizationId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  parentOrganizationId: string;
}) {
  const { toast } = useToast();

  const { organizationId: userOrganizationId } = getApplicationCookies();
  const { mutate } = useOrganizationWithChildren({
    organizationId: userOrganizationId,
  });

  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>(OrgType.MERCHANT);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubOrg = async () => {
    const { accessToken } = getApplicationCookies();

    if (!name || !type || !parentOrganizationId || !accessToken) return;

    try {
      setIsLoading(true);
      const response = await ApiCreateOrganization({
        name,
        type,
        parentId: parentOrganizationId,
        accessToken,
      });
      const data = await response.json();
      if (response.ok) {
        closeDialog();
        toast({
          title: `${type} 子單位新增成功`,
          description: `名稱: ${name}, 上層單位 ID: ${parentOrganizationId}`,
          variant: "success",
        });
        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${type} 子單位新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${type} 子單位新增失敗`,
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
    setName("");
    setType(OrgType.MERCHANT);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增子單位</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名稱</Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">類別</Label>
            <div className="col-span-3">
              <Select
                defaultValue={type}
                onValueChange={(value) => setType(value as OrgType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={OrgType.AGENT}>
                      {OrgTypeDisplayNames[OrgType.AGENT]}
                    </SelectItem>
                    <SelectItem value={OrgType.MERCHANT}>
                      {OrgTypeDisplayNames[OrgType.MERCHANT]}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">上層單位 ID</Label>
            <Input
              id="role"
              className="col-span-3"
              value={parentOrganizationId}
              readOnly
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateSubOrg}
            disabled={!name || !type || !parentOrganizationId}
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
