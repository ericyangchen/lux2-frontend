import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { User } from "@/lib/types/user";
import { UserAddDialog } from "./UserAddDialog";
import { UserEditDialog } from "./UserEditDialog";
import { UserRole } from "@/lib/enums/users/user-role.enum";
import { UserRoleDisplayNames } from "@/lib/constants/user";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { useOrganization } from "@/lib/hooks/swr/organization";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useUserPermission } from "@/lib/hooks/useUserPermission";
import { useUsersByOrganizationId } from "@/lib/hooks/swr/user";

export function OrganizationUserSetting({
  organizationId,
}: {
  organizationId: string;
}) {
  const { toast } = useToast();

  const { users } = useUsersByOrganizationId({ organizationId });
  const { organization } = useOrganization({ organizationId });

  const permission = useUserPermission({
    accessingOrganizationId: organizationId,
  });

  const ownerUserRole =
    organization?.type === OrgType.ADMIN
      ? UserRole.ADMIN_OWNER
      : UserRole.MERCHANT_OWNER;

  const staffUserRole =
    organization?.type === OrgType.ADMIN
      ? UserRole.ADMIN_STAFF
      : UserRole.MERCHANT_STAFF;

  const ownerUsers = users?.filter((user) => user.role === ownerUserRole);

  const staffUsers = users?.filter((user) => user.role === staffUserRole);

  // Add Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogRole, setAddDialogRole] = useState<UserRole>();

  const openAddDialog = ({ role }: { role: UserRole }) => {
    setAddDialogRole(role);
    setIsAddDialogOpen(true);
  };
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
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
   * - Show Add Button
   *    - If
   * - Show Edit Button
   * - Show Delete Button
   */
  const showOwnerAddButton =
    permission.isDeveloper ||
    (permission.accessingSelfOrg && permission.isOwner) ||
    (permission.isAdminOrg && permission.isOwner && ownerUsers?.length == 0);
  const showOwnerEditButton =
    permission.isDeveloper ||
    (permission.accessingSelfOrg && permission.isOwner);
  const showStaffAddButton =
    permission.isDeveloper ||
    (permission.accessingSelfOrg && permission.isStaff);
  const showStaffEditButton =
    permission.isDeveloper ||
    (permission.accessingSelfOrg && permission.isStaff);

  return (
    <div className="">
      {/* Organization Owner */}
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="flex justify-between items-center h-7">
            <Label className="text-md font-semibold px-2">
              {UserRoleDisplayNames[ownerUserRole]}
            </Label>
            {showOwnerAddButton && (
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    role: ownerUserRole,
                  })
                }
              >
                新增
              </button>
            )}
          </div>
          <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-2 overflow-x-scroll">
            <table className="divide-y divide-gray-300 w-full">
              <thead className="bg-gray-50">
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
                    創建時間
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
                {ownerUsers?.length ? (
                  ownerUsers?.map((ownerUser) => (
                    <tr key={ownerUser.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 font-mono cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: ownerUser.id,
                          })
                        }
                      >
                        {ownerUser.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                        {ownerUser.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ownerUser.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          ownerUser.createdAt
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium">
                        {showOwnerEditButton && (
                          <button
                            className="text-gray-900 hover:text-black"
                            onClick={() =>
                              openEditDialog({
                                id: ownerUser.id,
                              })
                            }
                          >
                            編輯
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-sm text-gray-500 text-center"
                    >
                      沒有{UserRoleDisplayNames[ownerUserRole]}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Organization Staff */}
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="flex justify-between items-center h-7">
            <Label className="text-md font-semibold px-2">
              {UserRoleDisplayNames[staffUserRole]}
            </Label>
            {showStaffAddButton && (
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    role: staffUserRole,
                  })
                }
              >
                新增
              </button>
            )}
          </div>
          <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-2 overflow-x-scroll">
            <table className="divide-y divide-gray-300 w-full">
              <thead className="bg-gray-50">
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
                    創建時間
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {staffUsers?.length ? (
                  staffUsers?.map((staffUser) => (
                    <tr key={staffUser.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 font-mono cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: staffUser.id,
                          })
                        }
                      >
                        {staffUser.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                        {staffUser.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {staffUser.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          staffUser.createdAt
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium">
                        {showStaffEditButton && (
                          <button
                            className="text-gray-900 hover:text-black"
                            onClick={() =>
                              openEditDialog({
                                id: staffUser.id,
                              })
                            }
                          >
                            編輯
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-sm text-gray-500 text-center"
                    >
                      沒有{UserRoleDisplayNames[staffUserRole]}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <UserAddDialog
        isOpen={isAddDialogOpen}
        closeDialog={closeAddDialog}
        role={addDialogRole}
        orgType={organization?.type}
        organizationId={organizationId}
      />
      {editUser && (
        <UserEditDialog
          isOpen={isEditDialogOpen}
          closeDialog={closeEditDialog}
          user={editUser}
          organizationId={organizationId}
        />
      )}
    </div>
  );
}
