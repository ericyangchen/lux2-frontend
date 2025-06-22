import { ApiDisableUserOtp, ApiEnableTotp } from "@/lib/apis/otp/post";
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
import { useUser, useUsersByOrganizationId } from "@/lib/hooks/swr/user";

import { ApiDeleteUser } from "@/lib/apis/users/delete";
import { ApiUpdateUser } from "@/lib/apis/users/patch";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { User } from "@/lib/types/user";
import { UserRole } from "@/lib/enums/users/user-role.enum";
import { UserRoleDisplayNames } from "@/lib/constants/user";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { showTotpQrCodeInNewWindow } from "../info/utils";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

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

  const { user: currentUser, mutate: mutateUser } = useUser();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user.role);
  const [isOtpEnabled, setIsOtpEnabled] = useState(user.isOtpEnabled);

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  // OTP Management

  const handleEnableOtp = async () => {
    try {
      setIsOtpLoading(true);
      const { accessToken } = getApplicationCookies();
      if (!accessToken) return;

      const response = await ApiEnableTotp({
        userId: user.id,
        accessToken,
      });

      if (response.ok) {
        const data = await response.json();
        showTotpQrCodeInNewWindow({
          name: user.name,
          qrCode: data.qrCodeUrl,
        });
        setIsOtpEnabled(true);
        mutateUser();
        mutate();
        toast({
          title: "成功",
          description: "OTP 已啟用",
        });
      } else {
        toast({
          title: "錯誤",
          description: "無法啟用 OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "啟用 OTP 時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleDisableOtp = async () => {
    try {
      setIsOtpLoading(true);
      const { accessToken } = getApplicationCookies();
      if (!accessToken) return;

      const response = await ApiDisableUserOtp({
        userId: user.id,
        accessToken,
      });

      if (response.ok) {
        setIsOtpEnabled(false);
        mutateUser();
        mutate();
        toast({
          title: "成功",
          description: "OTP 已停用",
        });
      } else {
        toast({
          title: "錯誤",
          description: "無法停用 OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "停用 OTP 時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Permission checks for OTP management
  const canManageOtp = () => {
    if (!currentUser) return false;

    // Users can manage their own OTP
    if (currentUser.id === user.id) return true;

    // ADMIN_OWNER can manage everyone's OTP
    if (currentUser.role === UserRole.ADMIN_OWNER) return true;

    // MERCHANT_OWNER can manage OTP for users in their organization
    if (
      currentUser.role === UserRole.MERCHANT_OWNER &&
      currentUser.organizationId === user.organizationId
    )
      return true;

    return false;
  };

  const canOnlyGenerateOrEnable = () => {
    if (!currentUser) return false;
    return currentUser.id === user.id;
  };

  const renderOtpSection = () => {
    const hasOtp = isOtpEnabled;
    const canManage = canManageOtp();
    const canOnlyGenOrEnable = canOnlyGenerateOrEnable();

    if (!canManage) return null;

    return (
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">OTP 管理</Label>
        <div className="col-span-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                hasOtp ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm">{hasOtp ? "已啟用" : "未啟用"}</span>
          </div>
          <div className="flex gap-2">
            {hasOtp ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisableOtp}
                disabled={isOtpLoading}
              >
                停用 OTP
              </Button>
            ) : (
              canOnlyGenOrEnable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableOtp}
                  disabled={isOtpLoading}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  啟用 OTP
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleUpdateUser = async () => {
    const { accessToken, userId } = getApplicationCookies();

    if (!organizationId || !accessToken || !user) return;

    const isUpdatingSelf = user.id === userId;

    try {
      setIsUpdateLoading(true);

      const response = await ApiUpdateUser({
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

        if (isUpdatingSelf) {
          toast({
            title: "個人資料更新成功",
            description: "正在驗證權限...",
            duration: 1000,
          });

          setTimeout(() => {
            // Trigger user fetch to check if token is still valid
            mutateUser();
          }, 1000);
        } else {
          toast({
            title: `${UserRoleDisplayNames[role]} 更新成功`,
            description: `User ID: ${user.id}`,
            variant: "success",
          });
        }

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

      const response = await ApiDeleteUser({
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
            <Label className="text-right">帳號</Label>
            <Input
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">更新密碼</Label>
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
                    <SelectItem value={UserRole.ADMIN_OWNER}>
                      {UserRoleDisplayNames[UserRole.ADMIN_OWNER]}
                    </SelectItem>
                    <SelectItem value={UserRole.ADMIN_STAFF}>
                      {UserRoleDisplayNames[UserRole.ADMIN_STAFF]}
                    </SelectItem>
                    <SelectItem value={UserRole.MERCHANT_OWNER}>
                      {UserRoleDisplayNames[UserRole.MERCHANT_OWNER]}
                    </SelectItem>
                    <SelectItem value={UserRole.MERCHANT_STAFF}>
                      {UserRoleDisplayNames[UserRole.MERCHANT_STAFF]}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {renderOtpSection()}
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
