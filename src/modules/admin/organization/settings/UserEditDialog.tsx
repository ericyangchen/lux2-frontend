import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { User, UserRole, UserRoleDisplayNames } from "@/lib/types/user";
import { deleteUserApi, updateUserApi } from "@/lib/apis/organizations/users";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { getApplicationCookies } from "@/lib/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUsersByOrganizationId } from "@/lib/hooks/swr/user";

export function UserEditDialog({
  isOpen,
  closeDialog,
  user,
  organizationId,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  user: User;
  organizationId: string;
}) {
  const { toast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user.role);

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  const handleUpdateUser = async () => {
    const { accessToken } = getApplicationCookies();

    if (!organizationId || !accessToken || !user) return;

    try {
      setIsUpdateLoading(true);

      const response = await updateUserApi({
        organizationId,
        userId: user.id,
        name,
        email,
        password: password || undefined,
        role,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();
        toast({
          title: `${UserRoleDisplayNames[role]} 更新成功`,
          description: `User ID: ${user.id}`,
          variant: "success",
        });

        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${UserRoleDisplayNames[role]} 更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${UserRoleDisplayNames[role]} 更新失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const { accessToken } = getApplicationCookies();

    if (!organizationId || !accessToken || !user) return;

    try {
      setIsDeleteLoading(true);

      const response = await deleteUserApi({
        organizationId,
        userId: user.id,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();
        toast({
          title: `${UserRoleDisplayNames[role]} 刪除成功`,
          description: `用戶 ID: ${user.id}`,
          variant: "success",
        });

        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${UserRoleDisplayNames[role]} 刪除失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${UserRoleDisplayNames[role]} 刪除失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleCloseDialog = () => {
    closeDialog();
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯/刪除 {UserRoleDisplayNames[role]}</DialogTitle>
          <DialogDescription>編輯或刪除一位用戶</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <Input
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">更新Password</Label>
            <Input
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名字</Label>
            <Input
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">權限</Label>
            <div className="col-span-3">
              <Select
                defaultValue={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={UserRole.ADMINISTRATOR}>
                      {UserRoleDisplayNames[UserRole.ADMINISTRATOR]}
                    </SelectItem>
                    <SelectItem value={UserRole.OPERATOR}>
                      {UserRoleDisplayNames[UserRole.OPERATOR]}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <div>
            {!isUpdateLoading && (
              <Button
                onClick={handleDeleteUser}
                disabled={isDeleteLoading || isUpdateLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleteLoading ? "刪除中..." : "刪除"}
              </Button>
            )}
          </div>
          <div>
            {!isDeleteLoading && (
              <Button
                onClick={handleUpdateUser}
                disabled={isDeleteLoading || isUpdateLoading}
              >
                {isUpdateLoading ? "更新中..." : "更新"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
