import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";

import { ApiAdminCreateUser } from "@/lib/apis/users/post";
import { ApiAssignRolesToUserAdmin } from "@/lib/apis/user-roles/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUsersByOrganizationId } from "@/lib/hooks/swr/user";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { Permission } from "@/lib/enums/permissions/permission.enum";

// Helper function to get display name for system roles (admin only)
function getSystemRoleDisplayName(roleName: string): string {
  switch (roleName) {
    case "OWNER":
      return "系統管理員";
    case "DEVELOPER":
      return "開發者";
    default:
      return roleName;
  }
}

export function UserAddDialog({
  isOpen,
  closeDialog,
  organizationId,
  organizationRoles,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  organizationId: string;
  organizationRoles?: Role[];
}) {
  const { toast } = useToast();

  const permission = useUserPermission({
    accessingOrganizationId: organizationId,
  });

  const canAssignRoles =
    permission.hasPermission(Permission.ADMIN_MANAGE_ROLES);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useUsersByOrganizationId({
    organizationId,
  });

  // Filter out DEVELOPER role and sort roles
  const availableRoles = useMemo(() => {
    if (!organizationRoles) return [];
    return organizationRoles
      .filter((role) => role.name !== "DEVELOPER")
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
  }, [organizationRoles]);

  // Set default role to first available role (only if user can assign roles)
  useEffect(() => {
    if (
      canAssignRoles &&
      availableRoles &&
      availableRoles.length > 0 &&
      !selectedRoleId
    ) {
      setSelectedRoleId(availableRoles[0].id);
    }
  }, [canAssignRoles, availableRoles, selectedRoleId]);

  const handleAddUser = async () => {
    const { accessToken } = getApplicationCookies();

    if (!name || !email || !password || !accessToken) return;
    
    // Role is required only if user can assign roles
    if (canAssignRoles && !selectedRoleId) return;

    try {
      setIsLoading(true);
      // Create user first
      const createResponse = await ApiAdminCreateUser({
        organizationId,
        name,
        email,
        password,
        orgType: OrgType.ADMIN,
        accessToken,
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new ApplicationError(errorData);
      }

      const userData = await createResponse.json();
      const userId = userData.user.id;

      // Assign role to user only if user has permission and role is selected
      if (canAssignRoles && selectedRoleId) {
        const assignResponse = await ApiAssignRolesToUserAdmin({
          userId,
          roleIds: [selectedRoleId],
          accessToken,
        });

        if (!assignResponse.ok) {
          const errorData = await assignResponse.json();
          throw new ApplicationError(errorData);
        }
      }

      const selectedRole = availableRoles?.find((r) => r.id === selectedRoleId);
        closeDialog();
        toast({
        title: `用戶新增成功`,
        description: `帳號: ${email}, 名字: ${name}${selectedRole ? `, 角色: ${selectedRole.isSystemRole ? getSystemRoleDisplayName(selectedRole.name) : selectedRole.name}` : ""}`,
          variant: "success",
        });
        mutate();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `用戶新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `用戶新增失敗`,
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
    setSelectedRoleId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增用戶</DialogTitle>
          <DialogDescription>新增一位用戶</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">帳號</Label>
            <Input
              id="email"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">密碼</Label>
            <Input
              id="password"
              type="password"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">名字</Label>
            <Input
              id="name"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {canAssignRoles && (
          <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">角色</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="col-span-3 border-gray-200 focus:ring-gray-900 focus:ring-1 shadow-none rounded-none">
                  <SelectValue placeholder="選擇角色" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.isSystemRole
                        ? getSystemRoleDisplayName(role.name)
                        : role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddUser}
            disabled={
              !name ||
              !email ||
              !password ||
              (canAssignRoles && !selectedRoleId) ||
              isLoading
            }
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
