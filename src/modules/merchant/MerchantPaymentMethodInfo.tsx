import {
  DepositAccountTypeDisplayNames,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
} from "@/lib/constants/transaction";
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

  const renderPaymentMethodSection = (type: TransactionType) => {
    return (
      <div className="space-y-4">
        {availablePaymentMethods.map((paymentMethod) => {
          const config = getPaymentMethodConfiguration(paymentMethod, type);

          // Get consolidated fee settings from the first enabled channel
          // (assuming all channels for same payment method have same fees)
          const consolidatedFeeSettings =
            config.channels.length > 0 ? config.channels[0].feeSettings : [];

          const isEnabled = config.channels.some((channel) => channel.enabled);

          return (
            <div
              key={`${type}-${paymentMethod}`}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isEnabled ? "啟用" : "停用"}
                    </span>
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

              {/* Fee Settings */}
              <div className="p-4">
                {isEnabled && consolidatedFeeSettings.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      手續費資訊
                    </h4>
                    {consolidatedFeeSettings.map((feeSetting, feeIdx) => (
                      <div
                        key={feeIdx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {feeSetting.accountTypeDisplay}
                        </span>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>
                            費率:{" "}
                            <span className="font-medium">
                              {formatNumberInPercentage(feeSetting.percentage)}
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
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    {isEnabled ? "無手續費資訊" : "此支付類型未啟用"}
                  </div>
                )}
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
    <div className="">
      <Label className="text-xl font-bold">支付類型資訊</Label>

      <div className="px-0 sm:px-4 py-4">
        <div className="sm:hidden">
          <label className="sr-only">Select a tab</label>
          <select
            id="paymentMethod-tabs"
            name="tabs"
            defaultValue={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2"
          >
            {Object.values(Tab).map((tab) => (
              <option key={tab} value={tab}>
                {tabDisplayNames[tab]}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4">
            {Object.values(Tab).map((tab) => (
              <button
                key={tab}
                className={classNames(
                  tab === selectedTab
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  "rounded-md px-3 py-2 text-sm font-medium"
                )}
                onClick={() => setSelectedTab(tab)}
              >
                {tabDisplayNames[tab]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {renderPaymentMethodSection(currentType)}
    </div>
  );
}
