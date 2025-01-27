import { User, UserRole, UserRoleDisplayNames } from "@/lib/types/user";

import { Label } from "@/components/shadcn/ui/label";
import { UserAddDialog } from "./UserAddDialog";
import { UserEditDialog } from "./UserEditDialog";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/timezone";
import { copyToClipboard } from "@/lib/copyToClipboard";
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

  const permission = useUserPermission({
    accessingOrganizationId: organizationId,
  });

  const administratorUsers = users?.filter(
    (user) => user.role === UserRole.ADMINISTRATOR
  );

  const operatorUsers = users?.filter(
    (user) => user.role === UserRole.OPERATOR
  );

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
  const showAdminAddButton =
    (permission.accessingSelfOrg && permission.isAdministrator) ||
    (permission.isGeneralAgentOrg &&
      permission.isAdministrator &&
      administratorUsers?.length == 0);
  const showAdminEditButton =
    permission.accessingSelfOrg && permission.isAdministrator;
  const showOperatorAddButton =
    permission.accessingSelfOrg && permission.isAdministrator;
  const showOperatorEditButton =
    permission.accessingSelfOrg && permission.isAdministrator;

  return (
    <div className="">
      {/* Administrator */}
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="flex justify-between items-center h-7">
            <Label className="text-md font-semibold px-2">
              {UserRoleDisplayNames[UserRole.ADMINISTRATOR]}
            </Label>
            {showAdminAddButton && (
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    role: UserRole.ADMINISTRATOR,
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
                {administratorUsers?.length ? (
                  administratorUsers?.map((administratorUser) => (
                    <tr key={administratorUser.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 font-mono cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: administratorUser.id,
                          })
                        }
                      >
                        {administratorUser.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                        {administratorUser.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {administratorUser.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          administratorUser.createdAt
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium">
                        {showAdminEditButton && (
                          <button
                            className="text-gray-900 hover:text-black"
                            onClick={() =>
                              openEditDialog({
                                id: administratorUser.id,
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
                      沒有{UserRoleDisplayNames[UserRole.ADMINISTRATOR]}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operator */}
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="flex justify-between items-center h-7">
            <Label className="text-md font-semibold px-2">
              {UserRoleDisplayNames[UserRole.OPERATOR]}
            </Label>
            {showOperatorAddButton && (
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    role: UserRole.OPERATOR,
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
                {operatorUsers?.length ? (
                  operatorUsers?.map((operatorUser) => (
                    <tr key={operatorUser.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6 font-mono cursor-pointer"
                        onClick={() =>
                          copyToClipboard({
                            toast,
                            copyingText: operatorUser.id,
                          })
                        }
                      >
                        {operatorUser.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                        {operatorUser.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {operatorUser.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {convertDatabaseTimeToReadablePhilippinesTime(
                          operatorUser.createdAt
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium">
                        {showOperatorEditButton && (
                          <button
                            className="text-gray-900 hover:text-black"
                            onClick={() =>
                              openEditDialog({
                                id: operatorUser.id,
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
                      沒有{UserRoleDisplayNames[UserRole.OPERATOR]}
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
