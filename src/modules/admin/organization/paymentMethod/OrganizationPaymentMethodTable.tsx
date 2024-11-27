import {
  PaymentMethod,
  PaymentMethodDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import { formatNumber, formatNumberInPercentage } from "@/lib/number";
import { useMemo, useState } from "react";

import { Calculator } from "@/lib/calculator";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationPaymentMethodAddDialog } from "./OrganizationPaymentMethodAddDialog";
import { OrganizationPaymentMethodEditDialog } from "./OrganizationPaymentMethodEditDialog";
import { TransactionFeeConfig } from "@/lib/types/transaction-fee-config";
import { useOrganizationTransactionFeeConfigs } from "@/lib/hooks/swr/transaction-fee-config";

export default function OrganizationPaymentMethodTable({
  organizationId,
  type,
}: {
  organizationId: string;
  type: TransactionType;
}) {
  const { transactionFeeConfigs } = useOrganizationTransactionFeeConfigs({
    organizationId,
    type,
  });

  // group transactionFeeConfigs by paymentMethod
  const transactionFeeConfigsGroupedByPaymentMethods =
    transactionFeeConfigs.reduce((acc, transactionFeeConfig) => {
      if (acc[transactionFeeConfig.paymentMethod]) {
        acc[transactionFeeConfig.paymentMethod].push(transactionFeeConfig);
      } else {
        acc[transactionFeeConfig.paymentMethod] = [transactionFeeConfig];
      }
      return acc;
    }, {} as Record<PaymentMethod, TransactionFeeConfig[]>);

  const paymentMethodConfigurations = useMemo(
    () =>
      Object.entries(transactionFeeConfigsGroupedByPaymentMethods)?.map(
        ([paymentMethod, transactionFeeConfigs]) => {
          let minAmount;
          let maxAmount;

          // if one of the transactionFeeConfigs has no minAmount, then the minAmount is unlimited
          const isMinAmountUnlimited = transactionFeeConfigs.some(
            (config) => !config.minAmount && config.enabled
          );
          const isMaxAmountUnlimited = transactionFeeConfigs.some(
            (config) => !config.maxAmount && config.enabled
          );

          for (const transactionFeeConfig of transactionFeeConfigs) {
            if (!transactionFeeConfig.enabled) {
              continue;
            }

            if (!isMinAmountUnlimited && transactionFeeConfig.minAmount) {
              if (!minAmount) {
                minAmount = transactionFeeConfig.minAmount;
              } else if (
                Calculator.toBig(transactionFeeConfig.minAmount).lt(minAmount)
              ) {
                minAmount = transactionFeeConfig.minAmount;
              }
            }

            if (!isMaxAmountUnlimited && transactionFeeConfig.maxAmount) {
              if (!maxAmount) {
                maxAmount = transactionFeeConfig.maxAmount;
              } else if (
                Calculator.toBig(transactionFeeConfig.maxAmount).gt(maxAmount)
              ) {
                maxAmount = transactionFeeConfig.maxAmount;
              }
            }
          }

          return {
            organizationId,
            type,
            paymentMethod: paymentMethod as PaymentMethod,
            minAmount,
            maxAmount,
            percentageFee: transactionFeeConfigs[0].percentageFee,
            fixedFee: transactionFeeConfigs[0].fixedFee,
          };
        }
      ),
    [organizationId, transactionFeeConfigsGroupedByPaymentMethods, type]
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod>();
  const openEditDialog = ({
    paymentMethod,
  }: {
    paymentMethod: PaymentMethod;
  }) => {
    setEditingPaymentMethod(paymentMethod);
    setIsEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingPaymentMethod(undefined);
  };

  return (
    <>
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="flex justify-between items-center h-7">
            <Label className="text-md font-semibold px-2">
              {TransactionTypeDisplayNames[type]}
            </Label>
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
                    通道
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
                    總最小金額
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                  >
                    總最大金額
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
                {paymentMethodConfigurations?.length ? (
                  paymentMethodConfigurations?.map(
                    (paymentMethodConfiguration, idx) => (
                      <tr key={idx}>
                        <td className="text-left whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {
                            PaymentMethodDisplayNames[
                              paymentMethodConfiguration.paymentMethod
                            ]
                          }
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatNumberInPercentage(
                            paymentMethodConfiguration.percentageFee
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatNumber(paymentMethodConfiguration.fixedFee)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {paymentMethodConfiguration.minAmount
                            ? formatNumber(paymentMethodConfiguration.minAmount)
                            : "無限制"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {paymentMethodConfiguration.maxAmount
                            ? formatNumber(paymentMethodConfiguration.maxAmount)
                            : "無限制"}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() =>
                              openEditDialog({
                                paymentMethod:
                                  paymentMethodConfiguration.paymentMethod,
                              })
                            }
                          >
                            編輯
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-sm text-gray-500 text-center"
                    >
                      沒有{TransactionTypeDisplayNames[type]}通道設定
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrganizationPaymentMethodAddDialog
        isOpen={isAddDialogOpen}
        closeDialog={closeAddDialog}
        type={type}
        organizationId={organizationId}
      />

      {editingPaymentMethod && (
        <OrganizationPaymentMethodEditDialog
          isOpen={isEditDialogOpen}
          closeDialog={closeEditDialog}
          type={type}
          organizationId={organizationId}
          paymentMethod={editingPaymentMethod}
          transactionFeeConfigs={
            transactionFeeConfigsGroupedByPaymentMethods[editingPaymentMethod]
          }
        />
      )}
    </>
  );
}
