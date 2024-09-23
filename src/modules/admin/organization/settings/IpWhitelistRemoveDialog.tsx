import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { IpWhitelistType } from "@/lib/types/ip-whitelist";
import { Label } from "@/components/shadcn/ui/label";
import { deleteOrganizationIpWhitelistApi } from "@/lib/apis/organizations/ip-whitelist";
import { getApplicationCookies } from "@/lib/cookie";
import { useIpWhitelists } from "@/lib/hooks/swr/ipWhitelist";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function IpWhitelistRemoveDialog({
  isOpen,
  closeDialog,
  type,
  organizationId,
  ipWhitelistId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  type?: IpWhitelistType;
  organizationId: string;
  ipWhitelistId?: string;
}) {
  const typeDisplayName = type === IpWhitelistType.LOGIN ? "登入" : "代付";
  const typeColor =
    type === IpWhitelistType.LOGIN ? "text-blue-500" : "text-rose-500";

  const { toast } = useToast();

  const { ipWhitelists, mutate } = useIpWhitelists({
    organizationId,
  });
  const ipWhitelist = ipWhitelists?.find((ipWhitelist) => {
    return ipWhitelist.id === ipWhitelistId;
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveIpWhitelist = async () => {
    const { accessToken } = getApplicationCookies();

    if (
      !organizationId ||
      !ipWhitelistId ||
      !type ||
      !accessToken ||
      !ipWhitelist
    )
      return;

    try {
      setIsLoading(true);

      const response = await deleteOrganizationIpWhitelistApi({
        organizationId: organizationId,
        ipWhitelistId: ipWhitelistId,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();
        toast({
          title: `${typeDisplayName} IP 白名單移除成功`,
          description: ipWhitelist.ipAddress,
          variant: "success",
        });

        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${typeDisplayName} IP 白名單移除失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${typeDisplayName} IP 白名單移除失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            移除
            <span className={typeColor}> {typeDisplayName} </span>
            IP 白名單
          </DialogTitle>
          <DialogDescription>移除一個 IP 位址</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ipAddress" className="text-right">
              IP 位址
            </Label>
            <Input
              id="ipAddress"
              className="col-span-3"
              value={ipWhitelist?.ipAddress}
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRemoveIpWhitelist} disabled={isLoading}>
            {isLoading ? "移除中..." : "移除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
