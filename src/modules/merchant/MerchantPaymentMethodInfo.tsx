import {
  DepositAccountTypeDisplayNames,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
} from "@/lib/constants/transaction";
import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";

import { Calculator } from "@/lib/utils/calculator";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useMemo } from "react";
import { useOrganizationTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

export default function MerchantPaymentMethodInfo({
  organizationId,
}: {
  organizationId?: string;
}) {
  const { balances } = useBalances({ organizationId });

  const { transactionFeeSettings: depositSettings } =
    useOrganizationTransactionFeeSettings({
      organizationId: organizationId || "",
      type: TransactionType.API_DEPOSIT,
    });

  const { transactionFeeSettings: withdrawalSettings } =
    useOrganizationTransactionFeeSettings({
      organizationId: organizationId || "",
      type: TransactionType.API_WITHDRAWAL,
    });

  // Helper function to get all fee settings from feeSettingList
  const getAllFeeSettings = (
    setting: OrganizationTransactionFeeSetting,
    type: TransactionType
  ) => {
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

      // Check each withdrawal account type
      Object.values(WithdrawalToAccountType).forEach((accountType) => {
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

  // Group settings by payment method for both deposit and withdrawal
  const depositSettingsGroupedByPaymentMethod = depositSettings.reduce(
    (acc, setting) => {
      if (acc[setting.paymentMethod]) {
        acc[setting.paymentMethod].push(setting);
      } else {
        acc[setting.paymentMethod] = [setting];
      }
      return acc;
    },
    {} as Record<PaymentMethod, OrganizationTransactionFeeSetting[]>
  );

  const withdrawalSettingsGroupedByPaymentMethod = withdrawalSettings.reduce(
    (acc, setting) => {
      if (acc[setting.paymentMethod]) {
        acc[setting.paymentMethod].push(setting);
      } else {
        acc[setting.paymentMethod] = [setting];
      }
      return acc;
    },
    {} as Record<PaymentMethod, OrganizationTransactionFeeSetting[]>
  );

  // Get all unique payment methods from balances
  const availablePaymentMethods = useMemo(() => {
    const methods = new Set<PaymentMethod>();
    balances?.forEach((balance) => methods.add(balance.paymentMethod));
    return Array.from(methods);
  }, [balances]);

  const getPaymentMethodConfiguration = (
    paymentMethod: PaymentMethod,
    type: TransactionType
  ) => {
    const settings =
      type === TransactionType.API_DEPOSIT
        ? depositSettingsGroupedByPaymentMethod[paymentMethod] || []
        : withdrawalSettingsGroupedByPaymentMethod[paymentMethod] || [];

    let minAmount;
    let maxAmount;

    // if one of the settings has no minAmount, then the minAmount is unlimited
    const isMinAmountUnlimited = settings.some(
      (config) => !config.minAmount && config.enabled
    );
    const isMaxAmountUnlimited = settings.some(
      (config) => !config.maxAmount && config.enabled
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

    return {
      paymentMethod,
      type,
      minAmount,
      maxAmount,
      channels: settings
        .filter((setting) => setting.enabled)
        .map((setting) => {
          const allFeeSettings = getAllFeeSettings(setting, type);
          return {
            ...setting,
            feeSettings: allFeeSettings,
          };
        }),
      balance: balances?.find(
        (balance) => balance.paymentMethod === paymentMethod
      ),
    };
  };

  return (
    <div className="space-y-6">
      {/* Deposit Settings */}
      <div>
        <Label className="text-lg font-semibold mb-4 block">
          {TransactionTypeDisplayNames[TransactionType.API_DEPOSIT]}
        </Label>
        <div className="space-y-4">
          {availablePaymentMethods.map((paymentMethod) => {
            const config = getPaymentMethodConfiguration(
              paymentMethod,
              TransactionType.API_DEPOSIT
            );

            return (
              <div
                key={`deposit-${paymentMethod}`}
                className="bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Payment Method Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {PaymentMethodDisplayNames[paymentMethod]}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <span>最小金額: </span>
                        <span className="font-medium">
                          {config.minAmount
                            ? formatNumber(config.minAmount)
                            : "無限制"}
                        </span>
                        <span className="mx-2">|</span>
                        <span>最大金額: </span>
                        <span className="font-medium">
                          {config.maxAmount
                            ? formatNumber(config.maxAmount)
                            : "無限制"}
                        </span>
                      </div>
                    </div>
                    {config.balance && (
                      <div className="text-right text-sm">
                        <div className="text-gray-600">可用餘額</div>
                        <div className="font-semibold text-lg">
                          {formatNumber(config.balance.availableAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Channels List */}
                <div className="p-4">
                  {config.channels.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        上游渠道
                      </h4>
                      {config.channels.map((channel, channelIdx) => (
                        <div
                          key={channelIdx}
                          className="border border-gray-200 rounded-md p-3"
                        >
                          {/* Channel Header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="font-medium text-gray-900">
                              {PaymentChannelDisplayNames[
                                channel.paymentChannel
                              ] || channel.paymentChannel}
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
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                            {channel.feeSettings.map((feeSetting, feeIdx) => (
                              <div
                                key={feeIdx}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
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
                                      {formatNumber(feeSetting.fixed)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      沒有啟用的上游通道
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Withdrawal Settings */}
      <div>
        <Label className="text-lg font-semibold mb-4 block">
          {TransactionTypeDisplayNames[TransactionType.API_WITHDRAWAL]}
        </Label>
        <div className="space-y-4">
          {availablePaymentMethods.map((paymentMethod) => {
            const config = getPaymentMethodConfiguration(
              paymentMethod,
              TransactionType.API_WITHDRAWAL
            );

            return (
              <div
                key={`withdrawal-${paymentMethod}`}
                className="bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Payment Method Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {PaymentMethodDisplayNames[paymentMethod]}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <span>最小金額: </span>
                        <span className="font-medium">
                          {config.minAmount
                            ? formatNumber(config.minAmount)
                            : "無限制"}
                        </span>
                        <span className="mx-2">|</span>
                        <span>最大金額: </span>
                        <span className="font-medium">
                          {config.maxAmount
                            ? formatNumber(config.maxAmount)
                            : "無限制"}
                        </span>
                      </div>
                    </div>
                    {config.balance && (
                      <div className="text-right text-sm">
                        <div className="text-gray-600">可用餘額</div>
                        <div className="font-semibold text-lg">
                          {formatNumber(config.balance.availableAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Channels List */}
                <div className="p-4">
                  {config.channels.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        上游渠道
                      </h4>
                      {config.channels.map((channel, channelIdx) => (
                        <div
                          key={channelIdx}
                          className="border border-gray-200 rounded-md p-3"
                        >
                          {/* Channel Header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="font-medium text-gray-900">
                              {PaymentChannelDisplayNames[
                                channel.paymentChannel
                              ] || channel.paymentChannel}
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
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                            {channel.feeSettings.map((feeSetting, feeIdx) => (
                              <div
                                key={feeIdx}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
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
                                      {formatNumber(feeSetting.fixed)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      沒有啟用的上游通道
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
