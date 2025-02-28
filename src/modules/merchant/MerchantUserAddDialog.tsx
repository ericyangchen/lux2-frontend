import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { UserRole, UserRoleDisplayNames } from "@/lib/types/user";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { createUserApi } from "@/lib/apis/organizations/users";
import { getApplicationCookies } from "@/lib/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUsersByOrganizationId } from "@/lib/hooks/swr/user";

export function MerchantUserAddDialog({
  isOpen,
  closeDialog,
  role,
  organizationId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  role?: UserRole;
  organizationId: string;
}) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  const handleAddUser = async () => {
    const { accessToken } = getApplicationCookies();

    if (!name || !email || !password || !role || !accessToken) return;

    try {
      setIsLoading(true);
      const response = await createUserApi({
        organizationId,
        name,
        email,
        password,
        role,
        accessToken,
      });
      const data = await response.json();
      if (response.ok) {
        closeDialog();
        toast({
          title: `${UserRoleDisplayNames[role]} 新增成功`,
          description: `帳號: ${email}, 名字: ${name}`,
          variant: "success",
        });
        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${UserRoleDisplayNames[role]} 新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${UserRoleDisplayNames[role]} 新增失敗`,
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
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增 {role && UserRoleDisplayNames[role]}</DialogTitle>
          <DialogDescription>新增一位用戶</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">帳號</Label>
            <Input
              id="email"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">密碼</Label>
            <Input
              id="password"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名字</Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">權限</Label>
            <Input
              id="role"
              className="col-span-3"
              value={role && UserRoleDisplayNames[role]}
              readOnly
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddUser}
            disabled={!name || !email || !password}
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
