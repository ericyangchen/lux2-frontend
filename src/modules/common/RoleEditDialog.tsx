import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { ApiUpdateRole } from "@/lib/apis/roles/patch";
import { ApiDeleteRole } from "@/lib/apis/roles/delete";
import { ApiGetRolePermissions } from "@/lib/apis/roles/get";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Permission } from "@/lib/apis/permissions/get";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PermissionScope } from "@/lib/enums/permissions/permission-scope.enum";
import { Permission as PermissionEnum } from "@/lib/enums/permissions/permission.enum";
import { PermissionDisplayNames } from "@/lib/constants/permissions";
import { Role } from "@/lib/apis/roles/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { usePermissions } from "@/lib/hooks/swr/permissions";
import { useRolesByOrganization } from "@/lib/hooks/swr/roles";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function RoleEditDialog({
  isOpen,
  closeDialog,
  role,
  organizationId,
  orgType,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  role: Role;
  organizationId: string;
  orgType?: OrgType;
}) {
  const { toast } = useToast();
  const { permissions: allPermissions } = usePermissions();
  const { mutate: mutateRoles } = useRolesByOrganization({ organizationId });

  const [name, setName] = useState(role.name);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Fetch role permissions on mount
  useEffect(() => {
    if (isOpen && role.id) {
      const fetchRolePermissions = async () => {
        const { accessToken } = getApplicationCookies();
        if (!accessToken) return;

        try {
          setIsLoadingPermissions(true);
          const response = await ApiGetRolePermissions({
            roleId: role.id,
            accessToken,
          });

          if (response.ok) {
            const permissions: Permission[] = await response.json();
            setSelectedPermissionIds(permissions.map((p) => p.id));
          }
        } catch (error) {
          console.error("Failed to fetch role permissions", error);
        } finally {
          setIsLoadingPermissions(false);
        }
      };

      fetchRolePermissions();
    }
  }, [isOpen, role.id]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(role.name);
      setSelectedPermissionIds([]);
      setIsLoadingPermissions(true);
    } else {
      setName("");
      setSelectedPermissionIds([]);
      setIsLoadingPermissions(false);
    }
  }, [isOpen, role.name]);

  // Filter permissions by org type and sort by createdAt ascending
  const availablePermissions = useMemo(() => {
    if (!orgType || !allPermissions.length) return [];

    return allPermissions
      .filter((perm) => {
        const scopes = Array.isArray(perm.scope) ? perm.scope : [perm.scope];
        if (orgType === OrgType.ADMIN) {
          return scopes.some((s) => s === PermissionScope.ADMIN_ONLY);
        } else if (orgType === OrgType.MERCHANT) {
          return scopes.some((s) => s === PermissionScope.MERCHANT_ONLY);
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
  }, [allPermissions, orgType]);

  const handleUpdateRole = async () => {
    const { accessToken } = getApplicationCookies();

    if (!name || !accessToken) return;

    try {
      setIsLoading(true);
      const response = await ApiUpdateRole({
        roleId: role.id,
        name,
        permissionIds: selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      closeDialog();
      toast({
        title: `角色更新成功`,
        description: `角色名稱: ${name}`,
        variant: "success",
      });
      mutateRoles();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `角色更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `角色更新失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    const { accessToken } = getApplicationCookies();

    if (!accessToken) return;

    if (!confirm(`確定要刪除角色 "${role.name}" 嗎？此操作無法復原。`)) {
      return;
    }

    try {
      setIsDeleteLoading(true);
      const response = await ApiDeleteRole({
        roleId: role.id,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      closeDialog();
      toast({
        title: `角色刪除成功`,
        description: `角色名稱: ${role.name}`,
        variant: "success",
      });
      mutateRoles();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `角色刪除失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `角色刪除失敗`,
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
    setName(role.name);
    setSelectedPermissionIds([]);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Check if all available permissions are selected
  const allSelected = useMemo(() => {
    return (
      availablePermissions.length > 0 &&
      availablePermissions.every((perm) =>
        selectedPermissionIds.includes(perm.id)
      )
    );
  }, [availablePermissions, selectedPermissionIds]);

  // Toggle select all
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPermissionIds([]);
    } else {
      setSelectedPermissionIds(availablePermissions.map((perm) => perm.id));
    }
  };

  // Don't allow editing/deleting system roles
  const isSystemRole = role.isSystemRole;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isSystemRole ? "查看角色" : "編輯/刪除角色"}</DialogTitle>
          <DialogDescription>
            {isSystemRole
              ? "查看系統角色的權限設定（系統角色無法編輯或刪除）"
              : "編輯或刪除角色"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">角色名稱</Label>
            <Input
              id="name"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: STAFF, MANAGER"
              disabled={isSystemRole}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">權限</Label>
            <div className="col-span-3 space-y-2 max-h-64 overflow-y-auto border border-gray-200 p-4">
              {isLoadingPermissions ? (
                <div className="text-sm text-gray-500">載入權限中...</div>
              ) : availablePermissions.length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 mb-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      disabled={isSystemRole}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-semibold leading-none cursor-pointer"
                    >
                      全選 / 取消全選
                    </label>
                  </div>
                  {availablePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissionIds.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                      disabled={isSystemRole}
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {PermissionDisplayNames[permission.name as PermissionEnum] ||
                        permission.name}
                    </label>
                  </div>
                  ))}
                </>
              ) : (
                <div className="text-sm text-gray-500">尚無可用權限</div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <div>
            {!isSystemRole && !isLoading && (
              <Button
                onClick={handleDeleteRole}
                disabled={isDeleteLoading || isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleteLoading ? "刪除中..." : "刪除"}
              </Button>
            )}
          </div>
          <div>
            {!isSystemRole && !isDeleteLoading && (
              <Button
                onClick={handleUpdateRole}
                disabled={!name || isLoading || isDeleteLoading}
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
              >
                {isLoading ? "更新中..." : "更新"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

