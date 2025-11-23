import { IpWhitelistAddDialog } from "./IpWhitelistAddDialog";
import { IpWhitelistRemoveDialog } from "./IpWhitelistRemoveDialog";
import { IpWhitelistType } from "@/lib/enums/ip-whitelists/ip-whitelist-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { copyToClipboard } from "@/lib/utils/copyToClipboard";
import { useIpWhitelists } from "@/lib/hooks/swr/ipWhitelist";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function OrganizationIpWhitelistSetting({
  organizationId,
}: {
  organizationId: string;
}) {
  const { toast } = useToast();

  const { ipWhitelists } = useIpWhitelists({ organizationId });

  const loginIpWhitelists = ipWhitelists?.filter(
    (ipWhitelist) => ipWhitelist.type === IpWhitelistType.LOGIN
  );

  const withdrawalIpWhitelists = ipWhitelists?.filter(
    (ipWhitelist) => ipWhitelist.type === IpWhitelistType.WITHDRAWAL
  );

  // Add Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<IpWhitelistType>();

  const openAddDialog = ({ type }: { type: IpWhitelistType }) => {
    setAddDialogType(type);
    setIsAddDialogOpen(true);
  };
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  // Remove Dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removeDialogType, setRemoveDialogType] = useState<IpWhitelistType>();
  const [removeDialogIpWhitelistId, setRemoveDialogIpWhitelistId] =
    useState<string>();

  const openRemoveDialog = ({
    type,
    id,
  }: {
    type: IpWhitelistType;
    id: string;
  }) => {
    setRemoveDialogType(type);
    setRemoveDialogIpWhitelistId(id);
    setIsRemoveDialogOpen(true);
  };
  const closeRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
  };

  return (
    <>
      <div className="flow-root">
        {/* Login IP */}
        <div className="px-0 sm:px-4">
          <div className="py-2 pb-4">
            <div className="flex justify-between items-center h-7">
              <Label className="text-md font-semibold px-2">允許登入 IP</Label>
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    type: IpWhitelistType.LOGIN,
                  })
                }
              >
                新增
              </button>
            </div>
            <div className="border border-gray-200 mt-2 overflow-x-scroll">
              <table className="w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      IP 位址
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      創建者
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
                  {loginIpWhitelists?.length ? (
                    loginIpWhitelists?.map((loginIpWhitelist) => (
                      <tr key={loginIpWhitelist.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6 font-semibold">
                          {loginIpWhitelist.ipAddress}
                        </td>
                        <td
                          className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono cursor-pointer"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              description: `創建者 ID: ${loginIpWhitelist?.creatorIdentifier}`,
                              copyingText:
                                loginIpWhitelist?.creatorIdentifier || "",
                            })
                          }
                        >
                          {loginIpWhitelist?.creatorIdentifier}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {convertDatabaseTimeToReadablePhilippinesTime(
                            loginIpWhitelist.createdAt
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() =>
                              openRemoveDialog({
                                type: IpWhitelistType.LOGIN,
                                id: loginIpWhitelist.id,
                              })
                            }
                          >
                            移除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-sm text-gray-500 text-center"
                      >
                        沒有允許的登入 IP
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Withdrawal IP */}
        <div className="px-0 sm:px-4">
          <div className="py-2 pb-4">
            <div className="flex justify-between items-center h-7">
              <Label className="text-md font-semibold px-2">允許代付 IP</Label>
              <button
                className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 transition-colors duration-200"
                onClick={() =>
                  openAddDialog({
                    type: IpWhitelistType.WITHDRAWAL,
                  })
                }
              >
                新增
              </button>
            </div>
            <div className="border border-gray-200 mt-2 overflow-x-scroll">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      IP 位址
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      創建者
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
                  {withdrawalIpWhitelists?.length ? (
                    withdrawalIpWhitelists?.map((withdrawalIpWhitelist) => (
                      <tr key={withdrawalIpWhitelist.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6 font-semibold">
                          {withdrawalIpWhitelist.ipAddress}
                        </td>
                        <td
                          className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono cursor-pointer"
                          onClick={() =>
                            copyToClipboard({
                              toast,
                              description: `創建者 ID: ${withdrawalIpWhitelist?.creatorIdentifier}`,
                              copyingText:
                                withdrawalIpWhitelist?.creatorIdentifier || "",
                            })
                          }
                        >
                          {withdrawalIpWhitelist?.creatorIdentifier}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {convertDatabaseTimeToReadablePhilippinesTime(
                            withdrawalIpWhitelist.createdAt
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() =>
                              openRemoveDialog({
                                type: IpWhitelistType.WITHDRAWAL,
                                id: withdrawalIpWhitelist.id,
                              })
                            }
                          >
                            移除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-sm text-gray-500 text-center"
                      >
                        沒有允許的代付 IP
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <IpWhitelistAddDialog
        isOpen={isAddDialogOpen}
        closeDialog={closeAddDialog}
        type={addDialogType}
        organizationId={organizationId}
      />
      <IpWhitelistRemoveDialog
        isOpen={isRemoveDialogOpen}
        closeDialog={closeRemoveDialog}
        type={removeDialogType}
        organizationId={organizationId}
        ipWhitelistId={removeDialogIpWhitelistId}
      />
    </>
  );
}
