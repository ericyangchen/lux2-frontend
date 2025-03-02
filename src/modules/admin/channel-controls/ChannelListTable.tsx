import {
  PaymentChannel,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import { formatNumber, formatNumberInPercentage } from "@/lib/number";

import { ChannelAddDialog } from "./ChannelAddDialog";
import { ChannelEditDialog } from "./ChannelEditDialog";
import { Label } from "@/components/shadcn/ui/label";
import { TransactionFeeConfig } from "@/lib/types/transaction-fee-config";
import { classNames } from "@/lib/utils";
import { getApplicationCookies } from "@/lib/cookie";
import { useOrganizationTransactionFeeConfigs } from "@/lib/hooks/swr/transaction-fee-config";
import { useState } from "react";

export default function ChannelListTable() {
  const { organizationId } = getApplicationCookies();

  const { transactionFeeConfigs } = useOrganizationTransactionFeeConfigs({
    organizationId,
  });

  // sort first by same type, and then by paymentMethod
  const sortedTransactionFeeConfigs = transactionFeeConfigs?.sort(
    (a, b) =>
      a.type.localeCompare(b.type) ||
      a.paymentMethod.localeCompare(b.paymentMethod) ||
      a.paymentChannel.localeCompare(b.paymentChannel)
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransactionFeeConfig, setEditingTransactionFeeConfig] =
    useState<TransactionFeeConfig>();
  const openEditDialog = ({
    editingTransactionFeeConfig,
  }: {
    editingTransactionFeeConfig: TransactionFeeConfig;
  }) => {
    setEditingTransactionFeeConfig(editingTransactionFeeConfig);
    setIsEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTransactionFeeConfig(undefined);
  };

  return (
    <div className="py-2 pb-4">
      <div className="flex justify-between items-center h-7">
        <Label className="text-md font-semibold px-2">上游渠道</Label>
        <button
          className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md transition-colors duration-200"
          onClick={() => setIsAddDialogOpen(true)}
        >
          新增
        </button>
      </div>
      <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-2 overflow-x-scroll">
        <table className="divide-y divide-gray-300 w-full text-center">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                類別
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                通道
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                上游渠道
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                手續費率
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                固定手續費
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                最小金額
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                最大金額
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                結算天數
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900"
              >
                狀態
              </th>
              <th
                scope="col"
                className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTransactionFeeConfigs?.length ? (
              transactionFeeConfigs?.map((transactionFeeConfig) => (
                <tr key={transactionFeeConfig.id}>
                  <td
                    className={classNames(
                      transactionFeeConfig.type === TransactionType.DEPOSIT
                        ? "text-blue-600"
                        : "text-red-600",
                      "text-left whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6"
                    )}
                  >
                    {TransactionTypeDisplayNames[transactionFeeConfig.type]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {
                      PaymentMethodDisplayNames[
                        transactionFeeConfig.paymentMethod
                      ]
                    }
                  </td>
                  <td className="text-left whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-bold">
                    {
                      PaymentChannelDisplayNames[
                        transactionFeeConfig.paymentChannel
                      ]
                    }
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {formatNumberInPercentage(
                      transactionFeeConfig.percentageFee
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {formatNumber(transactionFeeConfig.fixedFee)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {transactionFeeConfig.minAmount
                      ? formatNumber(transactionFeeConfig.minAmount)
                      : "無限制"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {transactionFeeConfig.maxAmount
                      ? formatNumber(transactionFeeConfig.maxAmount)
                      : "無限制"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {transactionFeeConfig.settlementInterval
                      ? transactionFeeConfig.settlementInterval
                      : "無"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                    {transactionFeeConfig.enabled ? (
                      <span className="text-green-600">啟用</span>
                    ) : (
                      <span className="text-red-600">停用</span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() =>
                        openEditDialog({
                          editingTransactionFeeConfig: transactionFeeConfig,
                        })
                      }
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-sm text-gray-500 text-center"
                >
                  沒有上游渠道
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ChannelAddDialog isOpen={isAddDialogOpen} closeDialog={closeAddDialog} />

      {organizationId && editingTransactionFeeConfig && (
        <ChannelEditDialog
          isOpen={isEditDialogOpen}
          closeDialog={closeEditDialog}
          transactionFeeConfig={editingTransactionFeeConfig}
        />
      )}
    </div>
  );
}
