import {
  ApiMerchantEnableTotp,
  ApiMerchantDisableTotp,
} from "@/lib/apis/otp/post";
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

import { ApiMerchantDeleteUser } from "@/lib/apis/users/delete";
import { ApiMerchantUpdateUser } from "@/lib/apis/users/patch";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { User } from "@/lib/types/user";
import { Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { showTotpQrCodeInNewWindow } from "../admin/organization/info/utils";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { useRolesByOrganization } from "@/lib/hooks/swr/roles";
import { Role } from "@/lib/apis/roles/get";
import { ApiAssignRolesToUserMerchant } from "@/lib/apis/user-roles/post";
import { Permission } from "@/lib/enums/permissions/permission.enum";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

// Helper function to get display name for system roles (merchant only)
function getSystemRoleDisplayName(roleName: string): string {
  switch (roleName) {
    case "MERCHANT_OWNER":
      return "管理員";
    default:
      return roleName;
  }
}

export function MerchantUserEditDialog({
  isOpen,
  closeDialog,
  user,
  organizationId,
  userRoleAssociations,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  user: User;
  organizationId: string;
  userRoleAssociations?: Array<{ userId: string; roleId: string; role: Role }>;
}) {
  const { toast } = useToast();

  const { user: currentUser, mutate: mutateUser } = useUser();
  const permission = useUserPermission({
    accessingOrganizationId: organizationId,
  });
  const { roles: organizationRoles } = useRolesByOrganization({
    organizationId,
  });

  // Get user's roles from userRoleAssociations (batch data) instead of individual API call
  const userRoles = useMemo(() => {
    if (!userRoleAssociations) return [];
    return userRoleAssociations
      .filter((ur) => ur.userId === user.id)
      .map((ur) => ur.role);
  }, [userRoleAssociations, user.id]);

  // Sort roles by createdAt
  const sortedRoles = useMemo(() => {
    if (!organizationRoles) return [];
    return [...organizationRoles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [organizationRoles]);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isOtpEnabled, setIsOtpEnabled] = useState(user.isOtpEnabled);

  // Initialize selected roles from user's current roles
  useEffect(() => {
    if (userRoles.length > 0) {
      setSelectedRoleIds(userRoles.map((r) => r.id));
    }
  }, [userRoles]);

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  // Permission checks
  const canUpdateUser =
    permission.hasPermission(Permission.MERCHANT_UPDATE_USER) ||
    currentUser?.id === user.id; // Users can always update themselves
  
  const canDeleteUser =
    permission.hasPermission(Permission.MERCHANT_DELETE_USER) &&
    currentUser?.id !== user.id; // Can't delete yourself

  // OTP Management

  const handleEnableOtp = async () => {
    try {
      setIsOtpLoading(true);
      const { accessToken } = getApplicationCookies();
      if (!accessToken) return;

      const response = await ApiMerchantEnableTotp({
        organizationId,
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

      const response = await ApiMerchantDisableTotp({
        organizationId,
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

    // Developers can manage OTP for users in their organization
    if (
      permission.isDeveloper &&
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
                  className="text-green-600 border-green-600 hover:bg-green-50 rounded-none"
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

      // Update user first
      const response = await ApiMerchantUpdateUser({
        organizationId,
        userId: user.id,
        name,
        email,
        password: password || undefined,
        accessToken,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApplicationError(data);
      }

      // Assign roles if they changed
      if (selectedRoleIds.length > 0) {
        const assignResponse = await ApiAssignRolesToUserMerchant({
          userId: user.id,
          roleIds: selectedRoleIds,
          accessToken,
        });

        if (!assignResponse.ok) {
          const assignErrorData = await assignResponse.json();
          throw new ApplicationError(assignErrorData);
        }
      }

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
          title: `用戶更新成功`,
            description: `User ID: ${user.id}`,
            variant: "success",
          });
        }

        mutate();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `用戶更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `用戶更新失敗`,
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

      const response = await ApiMerchantDeleteUser({
        organizationId,
        userId: user.id,
        accessToken,
      });

      const data = await response.json();

      if (response.ok) {
        closeDialog();
        toast({
          title: `用戶刪除成功`,
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
          title: `用戶刪除失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `用戶刪除失敗`,
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
    // Roles are loaded from userRoleAssociations (batch data)
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯/刪除用戶</DialogTitle>
          <DialogDescription>編輯或刪除一位用戶</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">帳號</Label>
            <Input
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canUpdateUser}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">更新密碼</Label>
            <Input
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              disabled={!canUpdateUser}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名字</Label>
            <Input
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canUpdateUser}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">角色</Label>
            <div className="col-span-3">
              <Select
                value={selectedRoleIds[0] || ""}
                onValueChange={(value) => setSelectedRoleIds([value])}
                disabled={!canUpdateUser}
              >
                <SelectTrigger className="border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue placeholder="選擇角色" />
                </SelectTrigger>
                <SelectContent>
                  {sortedRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.isSystemRole
                        ? getSystemRoleDisplayName(role.name)
                        : role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {renderOtpSection()}
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <div>
            {canDeleteUser && !isUpdateLoading && (
              <Button
                onClick={handleDeleteUser}
                disabled={isDeleteLoading || isUpdateLoading}
                className="bg-red-500 hover:bg-red-600 shadow-none rounded-none"
              >
                {isDeleteLoading ? "刪除中..." : "刪除"}
              </Button>
            )}
          </div>
          <div>
            {canUpdateUser && !isDeleteLoading && (
              <Button
                onClick={handleUpdateUser}
                disabled={isDeleteLoading || isUpdateLoading}
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
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
