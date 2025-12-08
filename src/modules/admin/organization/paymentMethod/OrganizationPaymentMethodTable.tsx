import {
  DepositAccountTypeDisplayNames,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
  WithdrawalAccountTypeDisplayNames,
  WithdrawalAccountTypesByPaymentMethod,
} from "@/lib/constants/transaction";
import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useCallback, useMemo, useState } from "react";

import { Calculator } from "@/lib/utils/calculator";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationPaymentMethodAddDialog } from "./OrganizationPaymentMethodAddDialog";
import { OrganizationPaymentMethodEditDialog } from "./OrganizationPaymentMethodEditDialog";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { useOrganizationTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

export default function OrganizationPaymentMethodTable({
  organizationId,
  type,
}: {
  organizationId: string;
  type: TransactionType;
}) {
  const { transactionFeeSettings } = useOrganizationTransactionFeeSettings({
    organizationId,
    type,
  });

  // group transactionFeeSettings by paymentMethod
  const transactionFeeSettingsGroupedByPaymentMethods =
    transactionFeeSettings.reduce((acc, transactionFeeSetting) => {
      if (acc[transactionFeeSetting.paymentMethod]) {
        acc[transactionFeeSetting.paymentMethod].push(transactionFeeSetting);
      } else {
        acc[transactionFeeSetting.paymentMethod] = [transactionFeeSetting];
      }
      return acc;
    }, {} as Record<PaymentMethod, OrganizationTransactionFeeSetting[]>);

  // Helper function to get all fee settings from feeSettingList
  const getAllFeeSettings = useCallback(
    (setting: OrganizationTransactionFeeSetting) => {
      const feeSettings: Array<{
        accountType: string;
        accountTypeDisplay: string;
        percentage: string;
        fixed: string;
      }> = [];

      if (type === TransactionType.API_DEPOSIT) {
        const depositFees = setting.feeSettingList as any;
        const feeData = depositFees[DepositToAccountType.DEFAULT];
        if (feeData) {
          feeSettings.push({
            accountType: DepositToAccountType.DEFAULT,
            accountTypeDisplay:
              DepositAccountTypeDisplayNames[DepositToAccountType.DEFAULT],
            percentage: feeData.percentage,
            fixed: feeData.fixed,
          });
        }
      } else {
        const withdrawalFees = setting.feeSettingList as any;

        // Use payment method specific account types for withdrawal
        const accountTypes = WithdrawalAccountTypesByPaymentMethod[setting.paymentMethod] || [];
        accountTypes.forEach((accountType) => {
          const feeData = withdrawalFees[accountType];
          if (feeData) {
            feeSettings.push({
              accountType,
              accountTypeDisplay:
                WithdrawalAccountTypeDisplayNames[accountType],
              percentage: feeData.percentage,
              fixed: feeData.fixed,
            });
          }
        });
      }

      return feeSettings;
    },
    [type]
  );

  // Helper function to get currency for a payment method
  const getCurrencyForPaymentMethod = (
    paymentMethod: PaymentMethod
  ): string | null => {
    for (const [currency, paymentMethods] of Object.entries(
      PaymentMethodCurrencyMapping
    )) {
      if (paymentMethods.includes(paymentMethod)) {
        return currency;
      }
    }
    return null;
  };

  const paymentMethodConfigurationsByCurrency = useMemo(() => {
    // First, create payment method configurations
    const paymentMethodConfigurations = Object.entries(
      transactionFeeSettingsGroupedByPaymentMethods
    )?.map(([paymentMethod, transactionFeeSettings]) => {
      let minAmount;
      let maxAmount;

      // if one of the transactionFeeSettings has no minAmount, then the minAmount is unlimited
      const isMinAmountUnlimited = transactionFeeSettings.some(
        (config) => !config.minAmount && config.enabled
      );
      const isMaxAmountUnlimited = transactionFeeSettings.some(
        (config) => !config.maxAmount && config.enabled
      );

      for (const transactionFeeSetting of transactionFeeSettings) {
        if (!transactionFeeSetting.enabled) {
          continue;
        }

        if (!isMinAmountUnlimited && transactionFeeSetting.minAmount) {
          if (!minAmount) {
            minAmount = transactionFeeSetting.minAmount;
          } else if (
            Calculator.toBig(transactionFeeSetting.minAmount).lt(minAmount)
          ) {
            minAmount = transactionFeeSetting.minAmount;
          }
        }

        if (!isMaxAmountUnlimited && transactionFeeSetting.maxAmount) {
          if (!maxAmount) {
            maxAmount = transactionFeeSetting.maxAmount;
          } else if (
            Calculator.toBig(transactionFeeSetting.maxAmount).gt(maxAmount)
          ) {
            maxAmount = transactionFeeSetting.maxAmount;
          }
        }
      }

      return {
        organizationId,
        type,
        paymentMethod: paymentMethod as PaymentMethod,
        minAmount,
        maxAmount,
        channels: transactionFeeSettings
          .map((setting) => {
            const allFeeSettings = getAllFeeSettings(setting);
            return {
              ...setting,
              feeSettings: allFeeSettings,
            };
          })
          .sort((a, b) => a.paymentChannel.localeCompare(b.paymentChannel)),
      };
    });

    // Group by currency
    type PaymentMethodConfig = {
      organizationId: string;
      type: TransactionType;
      paymentMethod: PaymentMethod;
      minAmount: string | undefined;
      maxAmount: string | undefined;
      channels: Array<{
        paymentChannel: string;
        minAmount?: string;
        maxAmount?: string;
        settlementInterval?: string;
        enabled?: boolean;
        feeSettings: Array<{
          accountType: string;
          accountTypeDisplay: string;
          percentage: string;
          fixed: string;
        }>;
      }>;
    };

    const groupedByCurrency = new Map<string, PaymentMethodConfig[]>();

    for (const config of paymentMethodConfigurations) {
      const currency = getCurrencyForPaymentMethod(config.paymentMethod);
      if (currency) {
        if (!groupedByCurrency.has(currency)) {
          groupedByCurrency.set(currency, []);
        }
        groupedByCurrency.get(currency)!.push(config);
      }
    }

    // Sort payment methods within each currency
    for (const currency of Array.from(groupedByCurrency.keys())) {
      const configs = groupedByCurrency.get(currency);
      if (configs) {
        configs.sort((a: PaymentMethodConfig, b: PaymentMethodConfig) =>
          PaymentMethodDisplayNames[a.paymentMethod].localeCompare(
            PaymentMethodDisplayNames[b.paymentMethod]
          )
        );
      }
    }

    // Convert to array and sort currencies
    return Array.from(groupedByCurrency.entries())
      .map(([currency, configs]) => ({
        currency,
        paymentMethods: configs,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [
    getAllFeeSettings,
    organizationId,
    transactionFeeSettingsGroupedByPaymentMethods,
    type,
  ]);

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
              className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-2 py-1 transition-colors duration-200"
              onClick={() => setIsAddDialogOpen(true)}
            >
              新增
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {paymentMethodConfigurationsByCurrency?.length ? (
              paymentMethodConfigurationsByCurrency.map((currencyGroup) => (
                <div
                  key={currencyGroup.currency}
                  className="bg-white border border-gray-200"
                >
                  {/* Currency Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-100 text-black ">
                    <h3 className="text-sm font-semibold  uppercase tracking-wide">
                      {getCurrencySymbol(currencyGroup.currency)}{" "}
                      {currencyGroup.currency}
                    </h3>
                  </div>

                  {/* Payment Methods */}
                  <div className="divide-y divide-gray-200">
                    {currencyGroup.paymentMethods.map(
                      (paymentMethodConfiguration, idx) => (
                        <div key={idx}>
                          {/* Payment Method Header (indented) */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-4">
                              <h4 className="text-base font-semibold text-gray-900">
                                {
                                  PaymentMethodDisplayNames[
                                    paymentMethodConfiguration.paymentMethod
                                  ]
                                }
                              </h4>
                              <div className="text-sm text-gray-600">
                                <span>總最小金額: </span>
                                <span className="font-medium">
                                  {paymentMethodConfiguration.minAmount
                                    ? formatNumber(
                                        paymentMethodConfiguration.minAmount
                                      )
                                    : "無限制"}
                                </span>
                                <span className="mx-2">|</span>
                                <span>總最大金額: </span>
                                <span className="font-medium">
                                  {paymentMethodConfiguration.maxAmount
                                    ? formatNumber(
                                        paymentMethodConfiguration.maxAmount
                                      )
                                    : "無限制"}
                                </span>
                              </div>
                            </div>
                            <button
                              className="text-sm font-medium text-purple-700 hover:text-purple-800"
                              onClick={() =>
                                openEditDialog({
                                  paymentMethod:
                                    paymentMethodConfiguration.paymentMethod,
                                })
                              }
                            >
                              編輯
                            </button>
                          </div>

                          {/* Payment Channels List (further indented) */}
                          {paymentMethodConfiguration.channels.length > 0 ? (
                            <div className="space-y-2 p-4 pl-10 sm:pl-12 ">
                              {paymentMethodConfiguration.channels.map(
                                (channel, channelIdx) => (
                                  <div
                                    key={channelIdx}
                                    className="border border-gray-200 p-3 bg-white"
                                  >
                                    {/* Channel Header */}
                                    <div className="flex justify-between items-center mb-3">
                                      <div className="font-medium text-gray-900">
                                        {(
                                          PaymentChannelDisplayNames as Record<
                                            string,
                                            string
                                          >
                                        )[channel.paymentChannel] ||
                                          channel.paymentChannel}
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        {channel.minAmount && (
                                          <span className="text-xs text-gray-500">
                                            最小:{" "}
                                            {formatNumber(channel.minAmount)}
                                          </span>
                                        )}
                                        {channel.maxAmount && (
                                          <span className="text-xs text-gray-500">
                                            最大:{" "}
                                            {formatNumber(channel.maxAmount)}
                                          </span>
                                        )}
                                        {channel.settlementInterval && (
                                          <span className="text-xs text-gray-500">
                                            結算: {channel.settlementInterval}
                                          </span>
                                        )}
                                        <span
                                          className={`px-2 py-1 text-xs font-medium ${
                                            channel.enabled
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {channel.enabled ? "啟用" : "停用"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Fee Settings */}
                                    <div className="space-y-2">
                                      {channel.feeSettings.map(
                                        (feeSetting, feeIdx) => (
                                          <div
                                            key={feeIdx}
                                            className="flex justify-between items-center p-2 bg-gray-50"
                                          >
                                            <span className="text-sm font-medium text-gray-700">
                                              {feeSetting.accountTypeDisplay}
                                            </span>
                                            <div className="text-sm text-gray-600 space-x-3">
                                              <span>
                                                費率:{" "}
                                                <span className="font-medium">
                                                  {formatNumberInPercentage(
                                                    feeSetting.percentage
                                                  )}
                                                </span>
                                              </span>
                                              <span>
                                                固定費:{" "}
                                                <span className="font-medium">
                                                  {formatNumber(
                                                    feeSetting.fixed
                                                  )}
                                                </span>
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-4 pl-10 sm:pl-12">
                              沒有上游通道
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                沒有{TransactionTypeDisplayNames[type]}通道設定
              </div>
            )}
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
          transactionFeeSettings={
            transactionFeeSettingsGroupedByPaymentMethods[editingPaymentMethod]
          }
        />
      )}
    </>
  );
}
