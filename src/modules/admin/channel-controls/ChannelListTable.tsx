import {
  DepositAccountTypeDisplayNames,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
  TransactionTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
  WithdrawalAccountTypesByPaymentMethod,
} from "@/lib/constants/transaction";
import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useMemo, useState } from "react";

import { Calculator } from "@/lib/utils/calculator";
import { ChannelAddDialog } from "./ChannelAddDialog";
import { ChannelEditDialog } from "./ChannelEditDialog";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { useTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

interface ChannelListTableProps {
  transactionType: TransactionType;
}

export default function ChannelListTable({
  transactionType,
}: ChannelListTableProps) {
  const { transactionFeeSettings } = useTransactionFeeSettings({
    orgType: OrgType.ADMIN,
  });

  // Filter transaction fee settings by the provided transaction type
  const filteredTransactionFeeSettings = useMemo(() => {
    return transactionFeeSettings.filter(
      (setting) => setting.type === transactionType
    );
  }, [transactionFeeSettings, transactionType]);

  // Group filtered transaction fee settings by payment method
  const transactionFeeSettingsGroupedByPaymentMethod = useMemo(() => {
    const grouped: Partial<
      Record<PaymentMethod, OrganizationTransactionFeeSetting[]>
    > = {};

    filteredTransactionFeeSettings.forEach((setting) => {
      if (!grouped[setting.paymentMethod]) {
        grouped[setting.paymentMethod] = [];
      }
      grouped[setting.paymentMethod]!.push(setting);
    });

    return grouped;
  }, [filteredTransactionFeeSettings]);

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

  // Helper function to get all fee settings from feeSettingList
  const getAllFeeSettings = (setting: OrganizationTransactionFeeSetting) => {
    const feeSettings: Array<{
      accountType: string;
      accountTypeDisplay: string;
      percentage: string;
      fixed: string;
    }> = [];

    if (setting.type === TransactionType.API_DEPOSIT) {
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
    } else if (setting.type === TransactionType.API_WITHDRAWAL) {
      const withdrawalFees = setting.feeSettingList as any;

      // Use payment method specific account types for withdrawal
      const accountTypes = WithdrawalAccountTypesByPaymentMethod[setting.paymentMethod] || [];
      accountTypes.forEach((accountType) => {
        const feeData = withdrawalFees[accountType];
        if (feeData) {
          feeSettings.push({
            accountType,
            accountTypeDisplay: WithdrawalAccountTypeDisplayNames[accountType],
            percentage: feeData.percentage,
            fixed: feeData.fixed,
          });
        }
      });
    }

    return feeSettings;
  };

  type PaymentMethodConfig = {
    type: TransactionType;
    paymentMethod: PaymentMethod;
    minAmount?: string;
    maxAmount?: string;
    channels: Array<
      OrganizationTransactionFeeSetting & {
        feeSettings: Array<{
          accountType: string;
          accountTypeDisplay: string;
          percentage: string;
          fixed: string;
        }>;
      }
    >;
  };

  const paymentMethodConfigurationsByCurrency = useMemo(() => {
    // First, create payment method configurations
    const configurations: PaymentMethodConfig[] = [];

    Object.entries(transactionFeeSettingsGroupedByPaymentMethod).forEach(
      ([paymentMethod, settings]) => {
        if (!settings || !Array.isArray(settings)) return;

        let minAmount;
        let maxAmount;

        // Calculate min/max amounts across all enabled channels
        const isMinAmountUnlimited = settings.some(
          (setting) => !setting.minAmount && setting.enabled
        );
        const isMaxAmountUnlimited = settings.some(
          (setting) => !setting.maxAmount && setting.enabled
        );

        for (const setting of settings) {
          if (!setting.enabled) {
            continue;
          }

          if (!isMinAmountUnlimited && setting.minAmount) {
            if (!minAmount) {
              minAmount = setting.minAmount;
            } else if (Calculator.toBig(setting.minAmount).lt(minAmount)) {
              minAmount = setting.minAmount;
            }
          }

          if (!isMaxAmountUnlimited && setting.maxAmount) {
            if (!maxAmount) {
              maxAmount = setting.maxAmount;
            } else if (Calculator.toBig(setting.maxAmount).gt(maxAmount)) {
              maxAmount = setting.maxAmount;
            }
          }
        }

        configurations.push({
          type: transactionType,
          paymentMethod: paymentMethod as PaymentMethod,
          minAmount,
          maxAmount,
          channels: settings
            .map((setting) => {
              const allFeeSettings = getAllFeeSettings(setting);
              return {
                ...setting,
                feeSettings: allFeeSettings,
              };
            })
            .sort((a, b) => a.paymentChannel.localeCompare(b.paymentChannel)),
        });
      }
    );

    // Group by currency
    const groupedByCurrency = new Map<string, PaymentMethodConfig[]>();

    for (const config of configurations) {
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
  }, [transactionFeeSettingsGroupedByPaymentMethod, transactionType]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<{
    transactionType: TransactionType;
    paymentMethod: PaymentMethod;
  }>();
  const openEditDialog = (
    transactionType: TransactionType,
    paymentMethod: PaymentMethod
  ) => {
    setEditingPaymentMethod({ transactionType, paymentMethod });
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
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                通道:{" "}
                {paymentMethodConfigurationsByCurrency.reduce(
                  (total, currencyGroup) =>
                    total + currencyGroup.paymentMethods.length,
                  0
                )}{" "}
                (上游:{" "}
                {paymentMethodConfigurationsByCurrency.reduce(
                  (total, currencyGroup) =>
                    total +
                    currencyGroup.paymentMethods.reduce(
                      (sum, config) => sum + config.channels.length,
                      0
                    ),
                  0
                )}
                )
              </span>
            </div>
            <button
              className="text-right text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 px-3 py-1.5 rounded-md transition-colors duration-200 shadow-sm"
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
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-100 text-black">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      {getCurrencySymbol(currencyGroup.currency)}{" "}
                      {currencyGroup.currency}
                    </h3>
                  </div>

                  {/* Payment Methods */}
                  <div className="divide-y divide-gray-200">
                    {currencyGroup.paymentMethods.map((config, idx) => (
                      <div key={idx}>
                        {/* Payment Method Header (indented) */}
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <h4 className="text-base font-semibold text-gray-900">
                              {PaymentMethodDisplayNames[config.paymentMethod]}
                            </h4>
                            <div className="text-sm text-gray-600">
                              <span>總最小金額: </span>
                              <span className="font-medium">
                                {config.minAmount
                                  ? formatNumber(config.minAmount)
                                  : "無限制"}
                              </span>
                              <span className="mx-2">|</span>
                              <span>總最大金額: </span>
                              <span className="font-medium">
                                {config.maxAmount
                                  ? formatNumber(config.maxAmount)
                                  : "無限制"}
                              </span>
                            </div>
                          </div>
                          <button
                            className="text-sm font-medium text-purple-700 hover:text-purple-800"
                            onClick={() =>
                              openEditDialog(config.type, config.paymentMethod)
                            }
                          >
                            編輯
                          </button>
                        </div>

                        {/* Payment Channels List (further indented) */}
                        {config.channels.length > 0 ? (
                          <div className="space-y-2 p-4 pl-10 sm:pl-12">
                            {config.channels.map((channel, channelIdx) => (
                              <div
                                key={channelIdx}
                                className={`border border-gray-200 p-3 ${
                                  channel.enabled
                                    ? "bg-white"
                                    : "bg-gray-50 opacity-75"
                                }`}
                              >
                                {/* Channel Header */}
                                <div className="flex justify-between items-center mb-3">
                                  <div
                                    className={`font-medium ${
                                      channel.enabled
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {(
                                      PaymentChannelDisplayNames as Record<
                                        string,
                                        string
                                      >
                                    )[channel.paymentChannel] ||
                                      channel.paymentChannel}
                                    {!channel.enabled && (
                                      <span className="ml-2 text-xs text-red-600 font-normal">
                                        (已停用)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    {channel.minAmount && (
                                      <span className="text-xs text-gray-500">
                                        最小: {formatNumber(channel.minAmount)}
                                      </span>
                                    )}
                                    {channel.maxAmount && (
                                      <span className="text-xs text-gray-500">
                                        最大: {formatNumber(channel.maxAmount)}
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
                                        className={`flex justify-between items-center p-2 ${
                                          channel.enabled
                                            ? "bg-gray-50"
                                            : "bg-gray-100"
                                        }`}
                                      >
                                        <span
                                          className={`text-sm font-medium ${
                                            channel.enabled
                                              ? "text-gray-700"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {feeSetting.accountTypeDisplay}
                                        </span>
                                        <div
                                          className={`text-sm space-x-3 ${
                                            channel.enabled
                                              ? "text-gray-600"
                                              : "text-gray-500"
                                          }`}
                                        >
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
                                              {formatNumber(feeSetting.fixed)}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4 pl-10 sm:pl-12">
                            沒有配置的上游通道
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                沒有上游設定
              </div>
            )}
          </div>
        </div>
      </div>

      <ChannelAddDialog isOpen={isAddDialogOpen} closeDialog={closeAddDialog} />

      {editingPaymentMethod && (
        <ChannelEditDialog
          isOpen={isEditDialogOpen}
          closeDialog={closeEditDialog}
          transactionType={editingPaymentMethod.transactionType}
          paymentMethod={editingPaymentMethod.paymentMethod}
          transactionFeeSettings={
            transactionFeeSettingsGroupedByPaymentMethod[
              editingPaymentMethod.paymentMethod
            ] || []
          }
        />
      )}
    </>
  );
}
