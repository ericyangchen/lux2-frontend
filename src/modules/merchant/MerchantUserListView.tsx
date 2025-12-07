import { useUser, useUsersByOrganizationId } from "@/lib/hooks/swr/user";
import { useRolesByOrganization } from "@/lib/hooks/swr/roles";

import { Label } from "@/components/shadcn/ui/label";
import { MerchantUserAddDialog } from "./MerchantUserAddDialog";
import { MerchantUserEditDialog } from "./MerchantUserEditDialog";
import { RoleCreateDialog } from "@/modules/common/RoleCreateDialog";
import { RoleEditDialog } from "@/modules/common/RoleEditDialog";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { Permission } from "@/lib/enums/permissions/permission.enum";
import { User } from "@/lib/types/user";
import { Role } from "@/lib/apis/roles/get";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState, useMemo } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { getSystemRoleDisplayName } from "@/lib/utils/roles";

interface UserWithRoles extends User {
  roles?: Role[];
}

export function MerchantUserListView() {
  const { toast } = useToast();

  const { user: currentUser } = useUser();

  const { organizationId } = getApplicationCookies();

  const { users } = useUsersByOrganizationId({ organizationId });
  const { roles: organizationRoles } = useRolesByOrganization({
    organizationId,
  });

  // Sort roles by createdAt ascending
  const sortedRoles = useMemo(() => {
    if (!organizationRoles) return [];
    return [...organizationRoles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [organizationRoles]);

  // Extract user-role associations from roles (each role has userRoles array)
  const userRoleAssociations = useMemo(() => {
    if (!organizationRoles) return [];
    const associations: Array<{ userId: string; roleId: string; role: Role }> =
      [];
    organizationRoles.forEach((role) => {
      if (role.userRoles && Array.isArray(role.userRoles)) {
        role.userRoles.forEach(
          (userRole: { userId: string; roleId: string }) => {
            associations.push({
              userId: userRole.userId,
              roleId: role.id,
              role: role,
            });
          }
        );
      }
    });
    return associations;
  }, [organizationRoles]);

  const permission = useUserPermission({
    accessingOrganizationId: organizationId,
  });

  // Add User Dialog
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const openAddDialog = () => setIsAddUserDialogOpen(true);
  const closeAddDialog = () => setIsAddUserDialogOpen(false);

  // Add Role Dialog
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);

  // Edit Role Dialog
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role>();
  const openEditRoleDialog = (role: Role) => {
    setEditRole(role);
    setIsEditRoleDialogOpen(true);
  };
  const closeEditRoleDialog = () => {
    setIsEditRoleDialogOpen(false);
    setEditRole(undefined);
  };

  // Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User>();

  const openEditDialog = ({ id }: { id: string }) => {
    const user = users?.find((user) => user.id === id);

    if (!user) {
      toast({
        title: "用戶不存在",
        description: `用戶 ID 不存在: ${id}`,
        variant: "destructive",
      });
    }

    setEditUser(user);
    setIsEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditUser(undefined);
  };

  /**
   * Permissions:
   * - Show Add Button - if user has MERCHANT_CREATE_USER permission
   * - Show Edit Button - if user has MERCHANT_UPDATE_USER permission
   * - Show Delete Button - if user has MERCHANT_DELETE_USER permission
   */
  const canCreateUser = permission.hasPermission(
    Permission.MERCHANT_CREATE_USER
  );
  const canEditUser = permission.hasPermission(Permission.MERCHANT_UPDATE_USER);
  const canDeleteUser = permission.hasPermission(
    Permission.MERCHANT_DELETE_USER
  );

  const canManageRoles = permission.hasPermission(
    Permission.MERCHANT_MANAGE_ROLES
  );

  return (
    <div className="space-y-8">
      {/* Roles Section */}
      {canManageRoles && (
        <div className="border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              角色管理
            </h2>
            <button
              className="text-sm font-medium text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 transition-colors"
              onClick={() => setIsAddRoleDialogOpen(true)}
            >
              新增角色
            </button>
          </div>
          <div className="p-6">
            {sortedRoles && sortedRoles.length > 0 ? (
              <div className="space-y-2">
                {sortedRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 border border-gray-200"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {role.isSystemRole
                          ? getSystemRoleDisplayName(role.name)
                          : role.name}
                      </span>
                      {role.isSystemRole && (
                        <span className="ml-2 text-xs text-gray-500">
                          (系統角色)
                        </span>
                      )}
                    </div>
                    <button
                      className="text-sm text-gray-900 hover:text-black"
                      onClick={() => openEditRoleDialog(role)}
                    >
                      {role.isSystemRole ? "查看" : "編輯"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                尚無角色
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            用戶列表
          </h2>
          {canCreateUser && (
            <button
              className="text-sm font-medium text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 transition-colors"
              onClick={openAddDialog}
            >
              新增用戶
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  ID
                </th>

                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  帳號
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  名字
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  角色
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  創建時間
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  OTP
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <MerchantUserRow
                    key={user.id}
                    user={user}
                    organizationRoles={organizationRoles || []}
                    userRoleAssociations={userRoleAssociations}
                    canEdit={canEditUser || user.id === currentUser?.id}
                    onEdit={() => openEditDialog({ id: user.id })}
                    toast={toast}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-sm text-gray-500 text-center"
                  >
                    沒有用戶
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      {organizationId && (
        <>
          <RoleCreateDialog
            isOpen={isAddRoleDialogOpen}
            closeDialog={() => setIsAddRoleDialogOpen(false)}
            organizationId={organizationId}
            orgType={OrgType.MERCHANT}
          />
          {editRole && (
            <RoleEditDialog
              isOpen={isEditRoleDialogOpen}
              closeDialog={closeEditRoleDialog}
              role={editRole}
              organizationId={organizationId}
              orgType={OrgType.MERCHANT}
            />
          )}
          <MerchantUserAddDialog
            isOpen={isAddUserDialogOpen}
            closeDialog={closeAddDialog}
            orgType={OrgType.MERCHANT}
            organizationId={organizationId}
            organizationRoles={organizationRoles}
          />
          {editUser && (
            <MerchantUserEditDialog
              isOpen={isEditDialogOpen}
              closeDialog={closeEditDialog}
              user={editUser}
              organizationId={organizationId}
              userRoleAssociations={userRoleAssociations}
            />
          )}
        </>
      )}
    </div>
  );
}

// MerchantUserRow component to fetch and display user roles
function MerchantUserRow({
  user,
  organizationRoles,
  userRoleAssociations,
  canEdit,
  onEdit,
  toast,
}: {
  user: User;
  organizationRoles: Role[];
  userRoleAssociations: Array<{ userId: string; roleId: string; role: Role }>;
  canEdit: boolean;
  onEdit: () => void;
  toast: any;
}) {
  const roleNames = useMemo(() => {
    if (!userRoleAssociations) return [];
    return userRoleAssociations
      .filter((ur) => ur.userId === user.id)
      .map((ur) =>
        ur.role.isSystemRole
          ? getSystemRoleDisplayName(ur.role.name)
          : ur.role.name
      );
  }, [userRoleAssociations, user.id]);

  return (
    <tr>
      <td
        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 font-mono cursor-pointer"
        onClick={() =>
          copyToClipboard({
            toast,
            copyingText: user.id,
          })
        }
      >
        {user.id}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
        {user.email}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {user.name}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {roleNames.length > 0 ? roleNames.join(", ") : "無角色"}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {convertDatabaseTimeToReadablePhilippinesTime(user.createdAt)}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              user.isOtpEnabled ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
          {user.isOtpEnabled ? "已啟用" : "未啟用"}
        </div>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium">
        {canEdit && (
          <button className="text-gray-900 hover:text-black" onClick={onEdit}>
            編輯
          </button>
        )}
      </td>
    </tr>
  );
}
