import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { ApiCreateRole } from "@/lib/apis/roles/post";
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
import { getApplicationCookies } from "@/lib/utils/cookie";
import { usePermissions } from "@/lib/hooks/swr/permissions";
import { useRolesByOrganization } from "@/lib/hooks/swr/roles";
import { useState, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function RoleCreateDialog({
  isOpen,
  closeDialog,
  organizationId,
  orgType,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  organizationId: string;
  orgType?: OrgType;
}) {
  const { toast } = useToast();
  const { permissions: allPermissions } = usePermissions();
  const { mutate: mutateRoles } = useRolesByOrganization({ organizationId });

  const [name, setName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCreateRole = async () => {
    const { accessToken } = getApplicationCookies();

    if (!name || !accessToken) return;

    try {
      setIsLoading(true);
      const response = await ApiCreateRole({
        organizationId,
        name,
        permissionIds:
          selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      closeDialog();
      toast({
        title: `角色新增成功`,
        description: `角色名稱: ${name}`,
        variant: "success",
      });
      mutateRoles();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `角色新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `角色新增失敗`,
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

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增角色</DialogTitle>
          <DialogDescription>為組織建立一個新角色</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">角色名稱</Label>
            <Input
              id="name"
              className="col-span-3 border-gray-200 focus-visible:ring-gray-900 focus-visible:ring-1 shadow-none rounded-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 客服, 財務"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">權限</Label>
            <div className="col-span-3 space-y-2 max-h-64 overflow-y-auto border border-gray-200 p-4">
              {availablePermissions.length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 mb-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
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
                      />
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {PermissionDisplayNames[
                          permission.name as PermissionEnum
                        ] || permission.name}
                      </label>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-sm text-gray-500">載入權限中...</div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateRole}
            disabled={!name || isLoading}
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-none rounded-none"
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
