import {
  DepositAccountTypeDisplayNames,
  PaymentChannelDisplayNames,
  PaymentMethodCurrencyMapping,
  PaymentMethodDisplayNames,
  TransactionTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
  WithdrawalAccountTypesByPaymentMethod,
} from "@/lib/constants/transaction";
import { getCurrencySymbol } from "@/lib/utils/currency";

// Get currency for a payment method
const getCurrencyForPaymentMethod = (
  paymentMethod: PaymentMethod
): string | null => {
  for (const [currency, methods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (methods.includes(paymentMethod)) {
      return currency;
    }
  }
  return null;
};
import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";
import { useMemo, useState } from "react";

import { Calculator } from "@/lib/utils/calculator";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { Label } from "@/components/shadcn/ui/label";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { classNames } from "@/lib/utils/classname-utils";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useOrganizationTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

enum Tab {
  API_DEPOSIT = "API_Deposit",
  API_WITHDRAWAL = "API_Withdrawal",
}

const tabDisplayNames = {
  [Tab.API_DEPOSIT]: TransactionTypeDisplayNames[TransactionType.API_DEPOSIT],
  [Tab.API_WITHDRAWAL]:
    TransactionTypeDisplayNames[TransactionType.API_WITHDRAWAL],
};

export default function MerchantPaymentMethodInfo({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [selectedTab, setSelectedTab] = useState<string>(Tab.API_DEPOSIT);
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
          accountTypeDisplay: "",
          percentage: feeData.percentage,
          fixed: feeData.fixed,
        });
      }
    } else {
      const withdrawalFees = setting.feeSettingList as any;

      // Use payment method specific account types for withdrawal
      const accountTypes =
        WithdrawalAccountTypesByPaymentMethod[setting.paymentMethod] || [];
      accountTypes.forEach((accountType) => {
        const feeData = withdrawalFees[accountType];
        if (feeData) {
          feeSettings.push({
            accountType,
            accountTypeDisplay: `至${WithdrawalAccountTypeDisplayNames[accountType]}`,
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

  // Group payment methods by currency
  const paymentMethodsByCurrency = useMemo(() => {
    const grouped: Record<string, PaymentMethod[]> = {};

    availablePaymentMethods.forEach((paymentMethod) => {
      // Find which currency this payment method belongs to
      for (const [currency, methods] of Object.entries(
        PaymentMethodCurrencyMapping
      )) {
        if (methods.includes(paymentMethod)) {
          if (!grouped[currency]) {
            grouped[currency] = [];
          }
          grouped[currency].push(paymentMethod);
          break;
        }
      }
    });

    return grouped;
  }, [availablePaymentMethods]);

  const renderPaymentMethodSection = (type: TransactionType) => {
    const currencies = Object.keys(paymentMethodsByCurrency).sort();

    return (
      <div className="space-y-6">
        {currencies.map((currency) => {
          const paymentMethods = paymentMethodsByCurrency[currency];

          return (
            <div key={currency} className="space-y-4">
              {/* Currency Label */}
              <div className="px-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {currency}
                </h3>
              </div>

              {/* Payment Methods (indented) */}
              <div className="pl-10 space-y-2">
                {paymentMethods.map((paymentMethod) => {
                  const config = getPaymentMethodConfiguration(
                    paymentMethod,
                    type
                  );

                  // Get consolidated fee settings from the first enabled channel
                  // (assuming all channels for same payment method have same fees)
                  const consolidatedFeeSettings =
                    config.channels.length > 0
                      ? config.channels[0].feeSettings
                      : [];

                  const isEnabled = config.channels.some(
                    (channel) => channel.enabled
                  );

                  return (
                    <div
                      key={`${type}-${paymentMethod}`}
                      className="border border-gray-200 bg-white"
                    >
                      {/* Payment Method Header */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <h4 className="text-base font-semibold text-gray-900">
                              {PaymentMethodDisplayNames[paymentMethod]}
                            </h4>
                            <div className="text-xs text-gray-600">
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
                            <span
                              className={`px-2 py-0.5 text-xs font-medium border ${
                                isEnabled
                                  ? "bg-gray-50 text-gray-700 border-gray-300"
                                  : "bg-white text-gray-500 border-gray-200"
                              }`}
                            >
                              {isEnabled ? "啟用" : "停用"}
                            </span>
                          </div>
                          {config.balance && (
                            <div className="text-right">
                              <div className="text-xs text-gray-600 uppercase tracking-wide">
                                可用餘額
                              </div>
                              <div className="text-base font-semibold text-gray-900 mt-1">
                                {(() => {
                                  const currency =
                                    getCurrencyForPaymentMethod(paymentMethod);
                                  const currencySymbol = currency
                                    ? getCurrencySymbol(currency)
                                    : "";
                                  return `${currencySymbol} ${formatNumber(
                                    config.balance.availableAmount
                                  )}`;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fee Settings */}
                      <div className="px-6 py-4">
                        {isEnabled && consolidatedFeeSettings.length > 0 ? (
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              手續費資訊
                            </h4>
                            {consolidatedFeeSettings.map(
                              (feeSetting, feeIdx) => (
                                <div
                                  key={feeIdx}
                                  className="flex justify-between items-center px-4 py-1.5 border border-gray-200"
                                >
                                  <span className="text-sm font-medium text-gray-900">
                                    {feeSetting.accountTypeDisplay}
                                  </span>
                                  <div className="text-sm text-gray-600 space-x-6">
                                    <span>
                                      費率:{" "}
                                      <span className="font-medium text-gray-900">
                                        {formatNumberInPercentage(
                                          feeSetting.percentage
                                        )}
                                      </span>
                                    </span>
                                    <span>
                                      固定費:{" "}
                                      <span className="font-medium text-gray-900">
                                        {formatNumber(feeSetting.fixed)}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            {isEnabled ? "無手續費資訊" : "此通道未啟用"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const currentType =
    selectedTab === Tab.API_DEPOSIT
      ? TransactionType.API_DEPOSIT
      : TransactionType.API_WITHDRAWAL;

  return (
    <div className="border border-gray-200 bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          通道資訊
        </h2>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="sm:hidden">
          <label className="sr-only">Select a tab</label>
          <select
            id="paymentMethod-tabs"
            name="tabs"
            defaultValue={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            className="block w-full border border-gray-200 px-3 py-2 text-sm bg-white"
          >
            {Object.values(Tab).map((tab) => (
              <option key={tab} value={tab}>
                {tabDisplayNames[tab]}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex gap-2">
          {Object.values(Tab).map((tab) => (
            <button
              key={tab}
              className={classNames(
                tab === selectedTab
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900",
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 border-transparent"
              )}
              onClick={() => setSelectedTab(tab)}
            >
              {tabDisplayNames[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">{renderPaymentMethodSection(currentType)}</div>
    </div>
  );
}
