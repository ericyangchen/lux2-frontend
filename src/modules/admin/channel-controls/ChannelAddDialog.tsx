import {
  DepositAccountTypeDisplayNames,
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
  TransactionTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApiCreateTransactionFeeSetting } from "@/lib/apis/txn-fee-settings/post";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import Decimal from "decimal.js";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Switch } from "@/components/shadcn/ui/switch";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { convertStringNumberToPercentageNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

interface FeeSettingData {
  accountType: string;
  accountTypeDisplay: string;
  percentage: string;
  fixed: string;
}

interface ChannelSettings {
  paymentChannel: string;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled?: boolean;
  feeSettings: FeeSettingData[];
}

export function ChannelAddDialog({
  isOpen,
  closeDialog,
}: {
  isOpen: boolean;
  closeDialog: () => void;
}) {
  const { toast } = useToast();

  const { organizationId } = getApplicationCookies();

  const [transactionType, setTransactionType] = useState<TransactionType>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [channelSettings, setChannelSettings] = useState<ChannelSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Store raw input values for percentage fields to allow typing intermediate values like "1."
  const [percentageInputs, setPercentageInputs] = useState<{
    [key: string]: string;
  }>({});

  const { transactionFeeSettings, mutate } = useTransactionFeeSettings({
    orgType: OrgType.ADMIN,
  });

  // Get payment methods that already have configured channels for the selected transaction type
  const configuredPaymentMethods = new Set(
    transactionFeeSettings
      .filter((setting) => setting.type === transactionType)
      .map((setting) => setting.paymentMethod)
  );

  // Filter out payment methods that already have configured channels
  const availablePaymentMethods = Object.values(PaymentMethod).filter(
    (method) => !configuredPaymentMethods.has(method)
  );

  const disableButton =
    !transactionType ||
    !paymentMethod ||
    channelSettings?.length === 0 ||
    channelSettings?.some(
      (channel) =>
        !channel.paymentChannel ||
        (channel.minAmount && isNaN(parseFloat(channel.minAmount))) ||
        (channel.maxAmount && isNaN(parseFloat(channel.maxAmount))) ||
        (channel.minAmount && parseFloat(channel.minAmount) < 0) ||
        (channel.maxAmount && parseFloat(channel.maxAmount) < 0) ||
        (channel.minAmount &&
          channel.maxAmount &&
          parseFloat(channel.minAmount) > parseFloat(channel.maxAmount)) ||
        channel.feeSettings.some(
          (fee) =>
            isNaN(parseFloat(fee.percentage)) ||
            isNaN(parseFloat(fee.fixed)) ||
            parseFloat(fee.percentage) >= 1 ||
            parseFloat(fee.fixed) < 0 ||
            parseFloat(fee.percentage) < 0
        )
    );

  const paymentChannelCategories =
    transactionType === TransactionType.API_DEPOSIT
      ? DepositPaymentChannelCategories
      : WithdrawalPaymentChannelCategories;

  const remainingChannel = paymentMethod
    ? paymentChannelCategories[paymentMethod]?.filter(
        (paymentChannel) =>
          !channelSettings.some(
            (channel) => channel.paymentChannel === paymentChannel
          )
      ) || []
    : [];

  const handleCloseDialog = () => {
    closeDialog();
    setTransactionType(undefined);
    setPaymentMethod(undefined);
    setChannelSettings([]);
    setPercentageInputs({});
  };

  const updateFeeSettingPercentage = (
    channelIdx: number,
    feeIdx: number,
    percentage: string
  ) => {
    const newChannelSettings = [...channelSettings];
    newChannelSettings[channelIdx].feeSettings[feeIdx].percentage = percentage;
    setChannelSettings(newChannelSettings);
  };

  const updateFeeSettingFixed = (
    channelIdx: number,
    feeIdx: number,
    fixed: string
  ) => {
    const newChannelSettings = [...channelSettings];
    newChannelSettings[channelIdx].feeSettings[feeIdx].fixed = fixed;
    setChannelSettings(newChannelSettings);
  };

  const createDefaultFeeSettings = (): FeeSettingData[] => {
    const defaultFeeSettings: FeeSettingData[] = [];
    if (transactionType === TransactionType.API_DEPOSIT) {
      defaultFeeSettings.push({
        accountType: DepositToAccountType.DEFAULT,
        accountTypeDisplay:
          DepositAccountTypeDisplayNames[DepositToAccountType.DEFAULT],
        percentage: "0",
        fixed: "0",
      });
    } else {
      Object.values(WithdrawalToAccountType).forEach((accountType) => {
        defaultFeeSettings.push({
          accountType,
          accountTypeDisplay: WithdrawalAccountTypeDisplayNames[accountType],
          percentage: "0",
          fixed: "0",
        });
      });
    }
    return defaultFeeSettings;
  };

  const handleTransactionTypeChange = (value: string) => {
    const type = value as TransactionType;
    setTransactionType(type);
    setPaymentMethod(undefined);
    setChannelSettings([]);
    setPercentageInputs({});
  };

  const handlePaymentMethodChange = (value: string) => {
    const method = value as PaymentMethod;
    setPaymentMethod(method);
    setChannelSettings([]);
    setPercentageInputs({});
  };

  const handleAddPaymentMethod = async () => {
    const { accessToken, organizationId } = getApplicationCookies();

    if (
      !transactionType ||
      !paymentMethod ||
      disableButton ||
      !accessToken ||
      !organizationId
    )
      return;

    try {
      setIsLoading(true);

      // Create settings for each channel
      for (const channelSetting of channelSettings) {
        const settlementInterval = channelSetting.settlementInterval;
        const formattedSettlementInterval = settlementInterval
          ? parseInt(settlementInterval) > 1
            ? `${parseInt(settlementInterval)} days`
            : `${parseInt(settlementInterval)} day`
          : undefined;

        // Create the fee setting list from the fee settings
        const createFeeSettingList = () => {
          const feeList: any = {};
          channelSetting.feeSettings.forEach((fee) => {
            feeList[fee.accountType] = {
              percentage: fee.percentage,
              fixed: fee.fixed,
            };
          });

          return feeList;
        };

        const response = await ApiCreateTransactionFeeSetting({
          organizationId,
          orgType: OrgType.ADMIN,
          type: transactionType,
          paymentMethod,
          paymentChannel: channelSetting.paymentChannel as any,
          feeSettingList: createFeeSettingList(),
          minAmount: channelSetting.minAmount || undefined,
          maxAmount: channelSetting.maxAmount || undefined,
          settlementInterval: formattedSettlementInterval,
          enabled: channelSetting.enabled ?? true,
          accessToken,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApplicationError(errorData);
        }
      }

      handleCloseDialog();
      toast({
        title: `${TransactionTypeDisplayNames[transactionType!]}通道新增成功`,
        variant: "success",
      });
      mutate();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${
            TransactionTypeDisplayNames[transactionType!]
          }通道新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${TransactionTypeDisplayNames[transactionType!]}通道新增失敗`,
          description: "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            新增
            {transactionType && TransactionTypeDisplayNames[transactionType]}
            通道
          </DialogTitle>
          <DialogDescription>新增一個通道</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">類別</Label>
            <div className="w-fit min-w-[150px]">
              <Select onValueChange={handleTransactionTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇交易類別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(TransactionType)
                      .filter(
                        (type) =>
                          type === TransactionType.API_DEPOSIT ||
                          type === TransactionType.API_WITHDRAWAL
                      )
                      .map((type) => (
                        <SelectItem key={type} value={type}>
                          {TransactionTypeDisplayNames[type]}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">通道</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                disabled={!transactionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇通道" />
                </SelectTrigger>
                <SelectContent>
                  {availablePaymentMethods.length > 0 ? (
                    Object.entries(PaymentMethodCurrencyMapping).map(
                      ([currency, methods]) => {
                        const validMethods = methods.filter(
                          (method): method is PaymentMethod =>
                            Object.values(PaymentMethod).includes(
                              method as PaymentMethod
                            ) &&
                            availablePaymentMethods.includes(
                              method as PaymentMethod
                            )
                        );
                        if (validMethods.length === 0) return null;
                        return (
                          <SelectGroup key={currency}>
                            <SelectLabel className="text-xs text-gray-500">
                              {currency}
                            </SelectLabel>
                            {validMethods.map((method) => (
                              <SelectItem
                                key={method}
                                value={method}
                                className="pl-6"
                              >
                                {PaymentMethodDisplayNames[method]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        );
                      }
                    )
                  ) : (
                    <SelectGroup>
                      <SelectItem value="disabled" disabled>
                        所有通道都已配置
                      </SelectItem>
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {availablePaymentMethods.length === 0 && transactionType ? (
          <div className="py-8 text-center text-gray-500">
            <p>所有通道都已配置完成</p>
            <p className="text-sm mt-2">如需新增通道，請使用編輯功能</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col">
            <Label className="whitespace-nowrap w-[70px] pb-3">
              {transactionType && TransactionTypeDisplayNames[transactionType]}
              上游設定
            </Label>

            {paymentMethod && (
              <div className="space-y-4">
                {channelSettings.map((channelSetting, channelIdx) => (
                  <div key={channelIdx} className="border p-4 rounded-md">
                    {/* Channel Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4">
                        <Select
                          value={channelSetting.paymentChannel}
                          onValueChange={(value) => {
                            const newChannelSettings = [...channelSettings];
                            newChannelSettings[channelIdx].paymentChannel =
                              value;
                            setChannelSettings(newChannelSettings);
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {paymentChannelCategories[paymentMethod]
                                ?.sort((a, b) =>
                                  (
                                    PaymentChannelDisplayNames[a] || a
                                  ).localeCompare(
                                    PaymentChannelDisplayNames[b] || b
                                  )
                                )
                                .map((paymentChannel) => {
                                  return (
                                    <SelectItem
                                      key={paymentChannel}
                                      value={paymentChannel}
                                      disabled={
                                        channelSettings.some(
                                          (channel) =>
                                            channel.paymentChannel ===
                                            paymentChannel
                                        ) &&
                                        paymentChannel !==
                                          channelSetting?.paymentChannel
                                      }
                                    >
                                      {PaymentChannelDisplayNames[
                                        paymentChannel
                                      ] || paymentChannel}
                                    </SelectItem>
                                  );
                                })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <Switch
                          checked={channelSetting.enabled}
                          onCheckedChange={(checked) => {
                            const newChannelSettings = [...channelSettings];
                            newChannelSettings[channelIdx].enabled = checked;
                            setChannelSettings(newChannelSettings);
                          }}
                        />
                        <span className="text-sm text-gray-600">啟用</span>
                      </div>

                      <button
                        onClick={() => {
                          const newChannelSettings = channelSettings.filter(
                            (_, index) => index !== channelIdx
                          );
                          setChannelSettings(newChannelSettings);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Channel Settings */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm">最小金額</Label>
                        <Input
                          placeholder="0"
                          value={channelSetting.minAmount || ""}
                          onChange={(e) => {
                            const newChannelSettings = [...channelSettings];
                            newChannelSettings[channelIdx].minAmount =
                              e.target.value;
                            setChannelSettings(newChannelSettings);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">最大金額</Label>
                        <Input
                          placeholder="0"
                          value={channelSetting.maxAmount || ""}
                          onChange={(e) => {
                            const newChannelSettings = [...channelSettings];
                            newChannelSettings[channelIdx].maxAmount =
                              e.target.value;
                            setChannelSettings(newChannelSettings);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">結算天數</Label>
                        <Input
                          placeholder="0"
                          value={channelSetting.settlementInterval || ""}
                          onChange={(e) => {
                            const newChannelSettings = [...channelSettings];
                            newChannelSettings[channelIdx].settlementInterval =
                              e.target.value;
                            setChannelSettings(newChannelSettings);
                          }}
                        />
                      </div>
                    </div>

                    {/* Fee Settings */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">手續費設定</Label>
                      {channelSetting.feeSettings.map((feeSetting, feeIdx) => (
                        <div
                          key={feeIdx}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded"
                        >
                          <div className="w-24">
                            <span className="text-sm font-medium">
                              {feeSetting.accountTypeDisplay}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">費率</Label>
                            <Input
                              className="w-20"
                              value={
                                percentageInputs[`${channelIdx}-${feeIdx}`] ??
                                convertStringNumberToPercentageNumber(
                                  feeSetting.percentage
                                ).toString()
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const inputKey = `${channelIdx}-${feeIdx}`;

                                // Allow empty string, decimal point, and valid number patterns
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  // Store the raw input value
                                  setPercentageInputs((prev) => ({
                                    ...prev,
                                    [inputKey]: value,
                                  }));

                                  const parsedValue = parseFloat(value);
                                  if (!isNaN(parsedValue)) {
                                    const percentageValue = new Decimal(
                                      parsedValue
                                    );
                                    updateFeeSettingPercentage(
                                      channelIdx,
                                      feeIdx,
                                      percentageValue.dividedBy(100).toString()
                                    );
                                  } else if (value === "") {
                                    updateFeeSettingPercentage(
                                      channelIdx,
                                      feeIdx,
                                      "0"
                                    );
                                  }
                                }
                              }}
                              onBlur={() => {
                                // Clear the raw input on blur to show formatted value
                                const inputKey = `${channelIdx}-${feeIdx}`;
                                setPercentageInputs((prev) => {
                                  const newInputs = { ...prev };
                                  delete newInputs[inputKey];
                                  return newInputs;
                                });
                              }}
                            />
                            <span className="text-sm">%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">固定費</Label>
                            <Input
                              className="w-24"
                              value={feeSetting.fixed}
                              onChange={(e) =>
                                updateFeeSettingFixed(
                                  channelIdx,
                                  feeIdx,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {remainingChannel.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setChannelSettings([
                          ...channelSettings,
                          {
                            paymentChannel: remainingChannel[0],
                            enabled: true,
                            feeSettings: createDefaultFeeSettings(),
                          },
                        ]);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      + 新增上游
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleAddPaymentMethod}
            disabled={disableButton || isLoading}
            className="bg-purple-700 hover:bg-purple-800"
          >
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
