import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";

import { ApiCreateIpWhitelist } from "@/lib/apis/ip-whitelists/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { IpWhitelistType } from "@/lib/enums/ip-whitelists/ip-whitelist-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useIpWhitelists } from "@/lib/hooks/swr/ipWhitelist";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUser } from "@/lib/hooks/swr/user";

export function IpWhitelistAddDialog({
  isOpen,
  closeDialog,
  type,
  organizationId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  type?: IpWhitelistType;
  organizationId: string;
}) {
  const typeDisplayName = type === IpWhitelistType.LOGIN ? "登入" : "代付";
  const typeColor =
    type === IpWhitelistType.LOGIN ? "text-blue-500" : "text-rose-500";

  const { toast } = useToast();

  const { user } = useUser();

  const [ipAddress, setIpAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useIpWhitelists({
    organizationId,
  });

  const handleAddIpWhitelist = async () => {
    const { accessToken } = getApplicationCookies();

    if (!user || !type || !accessToken) return;

    try {
      setIsLoading(true);

      const response = await ApiCreateIpWhitelist({
        organizationId,
        type,
        ipAddress,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();
        toast({
          title: `${typeDisplayName} IP 白名單新增成功`,
          description: ipAddress,
          variant: "success",
        });

        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${typeDisplayName} IP 白名單新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${typeDisplayName} IP 白名單新增失敗`,
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
    setIpAddress("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            新增
            <span className={typeColor}> {typeDisplayName} </span>
            IP 白名單
          </DialogTitle>
          <DialogDescription>新增一個 IP 位址</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ipAddress" className="text-right">
              IP 位址
            </Label>
            <Input
              id="ipAddress"
              className="col-span-3"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">創建者</Label>
            <Input
              id="creatorId"
              className="col-span-3"
              value={user?.id}
              readOnly
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddIpWhitelist} disabled={!ipAddress}>
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
