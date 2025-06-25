import {
  DepositAccountTypeDisplayNames,
  DepositPaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
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
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { useEffect, useState } from "react";

import { ApiCreateTransactionFeeSetting } from "@/lib/apis/txn-fee-settings/post";
import { ApiDeleteTransactionFeeSetting } from "@/lib/apis/txn-fee-settings/delete";
import { ApiUpdateTransactionFeeSetting } from "@/lib/apis/txn-fee-settings/patch";
import { ApplicationError } from "@/lib/error/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import Decimal from "decimal.js";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { FeeSettingList } from "@/lib/interfaces/txn-fee-settings.interface";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { OrgType } from "@/lib/enums/organizations/org-type.enum";
import { OrganizationTransactionFeeSetting } from "@/lib/types/organization-transaction-fee-setting";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Switch } from "@/components/shadcn/ui/switch";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { convertStringNumberToPercentageNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { useTransactionFeeSettings } from "@/lib/hooks/swr/transaction-fee-setting";

export function ChannelEditDialog({
  isOpen,
  closeDialog,
  transactionType,
  paymentMethod,
  transactionFeeSettings,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  transactionType?: TransactionType;
  paymentMethod?: PaymentMethod;
  transactionFeeSettings: OrganizationTransactionFeeSetting[];
}) {
  const { toast } = useToast();

  const { mutate } = useTransactionFeeSettings({
    orgType: OrgType.ADMIN,
  });

  const [editableSettings, setEditableSettings] = useState<
    OrganizationTransactionFeeSetting[]
  >([]);

  // Update editable settings when transactionFeeSettings changes
  useEffect(() => {
    setEditableSettings(
      transactionFeeSettings.map((setting) => ({ ...setting }))
    );
  }, [transactionFeeSettings]);
  const [isLoading, setIsLoading] = useState(false);

  // Store raw input values for percentage fields to allow typing intermediate values like "1."
  const [percentageInputs, setPercentageInputs] = useState<{
    [key: string]: string;
  }>({});

  // Helper function to get fee entries from FeeSettingList
  const getFeeEntries = (feeSettingList: FeeSettingList) => {
    const entries: Array<{
      accountType: string;
      accountTypeDisplay: string;
      percentage: string;
      fixed: string;
    }> = [];

    if (transactionType === TransactionType.API_DEPOSIT) {
      const depositFees = feeSettingList as any;
      if (depositFees[DepositToAccountType.DEFAULT]) {
        entries.push({
          accountType: DepositToAccountType.DEFAULT,
          accountTypeDisplay:
            DepositAccountTypeDisplayNames[DepositToAccountType.DEFAULT],
          percentage: depositFees[DepositToAccountType.DEFAULT].percentage,
          fixed: depositFees[DepositToAccountType.DEFAULT].fixed,
        });
      }
    } else {
      const withdrawalFees = feeSettingList as any;
      Object.values(WithdrawalToAccountType).forEach((accountType) => {
        if (withdrawalFees[accountType]) {
          entries.push({
            accountType,
            accountTypeDisplay: WithdrawalAccountTypeDisplayNames[accountType],
            percentage: withdrawalFees[accountType].percentage,
            fixed: withdrawalFees[accountType].fixed,
          });
        }
      });
    }

    return entries;
  };

  const disableButton =
    !paymentMethod ||
    editableSettings?.length === 0 ||
    editableSettings?.some((setting) => {
      const feeEntries = getFeeEntries(setting.feeSettingList);
      return (
        !setting.paymentChannel ||
        (setting.minAmount && isNaN(parseFloat(setting.minAmount))) ||
        (setting.maxAmount && isNaN(parseFloat(setting.maxAmount))) ||
        (setting.minAmount && parseFloat(setting.minAmount) < 0) ||
        (setting.maxAmount && parseFloat(setting.maxAmount) < 0) ||
        (setting.minAmount &&
          setting.maxAmount &&
          parseFloat(setting.minAmount) > parseFloat(setting.maxAmount)) ||
        feeEntries.some(
          (fee) =>
            isNaN(parseFloat(fee.percentage)) ||
            isNaN(parseFloat(fee.fixed)) ||
            parseFloat(fee.percentage) >= 1 ||
            parseFloat(fee.fixed) < 0 ||
            parseFloat(fee.percentage) < 0
        )
      );
    });

  const paymentChannelCategories =
    transactionType === TransactionType.API_DEPOSIT
      ? DepositPaymentChannelCategories
      : WithdrawalPaymentChannelCategories;

  const remainingChannel = paymentMethod
    ? paymentChannelCategories[paymentMethod]?.filter(
        (paymentChannel) =>
          !editableSettings.some(
            (setting) => setting.paymentChannel === paymentChannel
          )
      ) || []
    : [];

  const handleCloseDialog = () => {
    closeDialog();
    setEditableSettings([]);
    setPercentageInputs({});
    setNewChannels(new Set());
    setRemovedChannelIds(new Set());
  };

  const updateFeeSettingPercentage = (
    settingIdx: number,
    accountType: string,
    percentage: string
  ) => {
    const newSettings = [...editableSettings];
    const feeList = { ...newSettings[settingIdx].feeSettingList } as any;
    if (feeList[accountType]) {
      feeList[accountType] = { ...feeList[accountType], percentage };
      newSettings[settingIdx].feeSettingList = feeList;
      setEditableSettings(newSettings);
    }
  };

  const updateFeeSettingFixed = (
    settingIdx: number,
    accountType: string,
    fixed: string
  ) => {
    const newSettings = [...editableSettings];
    const feeList = { ...newSettings[settingIdx].feeSettingList } as any;
    if (feeList[accountType]) {
      feeList[accountType] = { ...feeList[accountType], fixed };
      newSettings[settingIdx].feeSettingList = feeList;
      setEditableSettings(newSettings);
    }
  };

  const updateSettingProperty = (
    settingIdx: number,
    property: keyof OrganizationTransactionFeeSetting,
    value: any
  ) => {
    const newSettings = [...editableSettings];
    (newSettings[settingIdx] as any)[property] = value;
    setEditableSettings(newSettings);
  };

  // Track which settings are new (not in original transactionFeeSettings)
  const [newChannels, setNewChannels] = useState<Set<string>>(new Set());

  // Track removed channel IDs for deletion
  const [removedChannelIds, setRemovedChannelIds] = useState<Set<string>>(
    new Set()
  );

  const removeChannel = (settingIdx: number) => {
    const settingToRemove = editableSettings[settingIdx];
    const newSettings = editableSettings.filter(
      (_, index) => index !== settingIdx
    );
    setEditableSettings(newSettings);

    // If it was a new channel, remove from newChannels
    if (newChannels.has(settingToRemove.paymentChannel)) {
      setNewChannels((prev) => {
        const newSet = new Set<string>();
        prev.forEach((item) => {
          if (item !== settingToRemove.paymentChannel) {
            newSet.add(item);
          }
        });
        return newSet;
      });
    } else {
      // If it was an existing channel, track it for deletion
      if (settingToRemove.id) {
        setRemovedChannelIds(
          (prev) => new Set([...Array.from(prev), settingToRemove.id])
        );
      }
    }
  };

  const addNewChannel = () => {
    if (remainingChannel.length === 0) return;

    // Create default fee setting list
    const createDefaultFeeSettingList = (): FeeSettingList => {
      if (transactionType === TransactionType.API_DEPOSIT) {
        return {
          [DepositToAccountType.DEFAULT]: {
            percentage: "0",
            fixed: "0",
          },
        } as any;
      } else {
        return {
          [WithdrawalToAccountType.BANK_ACCOUNT]: {
            percentage: "0",
            fixed: "0",
          },
          [WithdrawalToAccountType.GCASH_ACCOUNT]: {
            percentage: "0",
            fixed: "0",
          },
          [WithdrawalToAccountType.MAYA_ACCOUNT]: {
            percentage: "0",
            fixed: "0",
          },
        } as any;
      }
    };

    const { organizationId } = getApplicationCookies();
    const newChannelName = remainingChannel[0];
    const newSetting: OrganizationTransactionFeeSetting = {
      id: "", // No ID needed for new settings
      organizationId: organizationId || "",
      orgType: editableSettings[0]?.orgType || OrgType.ADMIN,
      type: transactionType!,
      paymentMethod: paymentMethod!,
      paymentChannel: newChannelName as any,
      feeSettingList: createDefaultFeeSettingList(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    setEditableSettings([...editableSettings, newSetting]);
    setNewChannels((prev) => {
      const newSet = new Set<string>();
      prev.forEach((item) => newSet.add(item));
      newSet.add(newChannelName);
      return newSet;
    });
  };

  const handleEditPaymentMethod = async () => {
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

      // Delete removed channels first
      for (const removedId of Array.from(removedChannelIds)) {
        const response = await ApiDeleteTransactionFeeSetting({
          id: removedId,
          accessToken,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApplicationError(errorData);
        }
      }

      // Separate new settings from existing ones
      const newSettings = editableSettings.filter((setting) =>
        newChannels.has(setting.paymentChannel)
      );
      const existingSettings = editableSettings.filter(
        (setting) => !newChannels.has(setting.paymentChannel)
      );

      // Create new settings using the API
      for (const setting of newSettings) {
        const settlementInterval = setting.settlementInterval;
        const formattedSettlementInterval = settlementInterval
          ? parseInt(settlementInterval) > 1
            ? `${parseInt(settlementInterval)} days`
            : `${parseInt(settlementInterval)} day`
          : undefined;

        const response = await ApiCreateTransactionFeeSetting({
          organizationId,
          orgType: setting.orgType || OrgType.ADMIN,
          type: transactionType!,
          paymentMethod: paymentMethod!,
          paymentChannel: setting.paymentChannel as any,
          feeSettingList: setting.feeSettingList,
          minAmount: setting.minAmount || undefined,
          maxAmount: setting.maxAmount || undefined,
          settlementInterval: formattedSettlementInterval,
          enabled: setting.enabled,
          accessToken,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApplicationError(errorData);
        }
      }

      // Update existing settings using the API
      for (const setting of existingSettings) {
        const settlementInterval = setting.settlementInterval;
        const formattedSettlementInterval = settlementInterval
          ? parseInt(settlementInterval) > 1
            ? `${parseInt(settlementInterval)} days`
            : `${parseInt(settlementInterval)} day`
          : undefined;

        const response = await ApiUpdateTransactionFeeSetting({
          id: setting.id,
          feeSettingList: setting.feeSettingList,
          minAmount: setting.minAmount || undefined,
          maxAmount: setting.maxAmount || undefined,
          settlementInterval: formattedSettlementInterval,
          enabled: setting.enabled,
          accessToken,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApplicationError(errorData);
        }
      }

      handleCloseDialog();
      toast({
        title: `${TransactionTypeDisplayNames[transactionType!]}通道更新成功`,
        variant: "success",
      });
      mutate();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${
            TransactionTypeDisplayNames[transactionType!]
          }通道更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${TransactionTypeDisplayNames[transactionType!]}通道更新失敗`,
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
            編輯
            {transactionType && TransactionTypeDisplayNames[transactionType]}
            支付類型
          </DialogTitle>
          <DialogDescription>編輯一個通道</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">支付類型</Label>
            <div className="w-fit min-w-[150px]">
              <Select defaultValue={paymentMethod} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(PaymentMethod).map((paymentMethod) => {
                      return (
                        <SelectItem key={paymentMethod} value={paymentMethod}>
                          {PaymentMethodDisplayNames[paymentMethod]}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="py-4 flex flex-col">
          <Label className="whitespace-nowrap w-[70px] pb-3">
            {transactionType && TransactionTypeDisplayNames[transactionType]}
            上游渠道設定
          </Label>

          {paymentMethod && (
            <div className="space-y-4">
              {editableSettings.map((setting, settingIdx) => {
                const feeEntries = getFeeEntries(setting.feeSettingList);

                return (
                  <div key={settingIdx} className="border p-4 rounded-md">
                    {/* Channel Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4">
                        <Select
                          value={setting.paymentChannel}
                          disabled={!newChannels.has(setting.paymentChannel)}
                        >
                          <SelectTrigger className="w-58">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {paymentChannelCategories[paymentMethod]?.map(
                                (paymentChannel) => {
                                  return (
                                    <SelectItem
                                      key={paymentChannel}
                                      value={paymentChannel}
                                      disabled={
                                        editableSettings.some(
                                          (s) =>
                                            s.paymentChannel === paymentChannel
                                        ) &&
                                        paymentChannel !==
                                          setting.paymentChannel
                                      }
                                    >
                                      {PaymentChannelDisplayNames[
                                        paymentChannel
                                      ] || paymentChannel}
                                    </SelectItem>
                                  );
                                }
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={(checked) =>
                            updateSettingProperty(
                              settingIdx,
                              "enabled",
                              checked
                            )
                          }
                        />
                        <span className="text-sm text-gray-600">啟用</span>
                      </div>

                      <button
                        onClick={() => removeChannel(settingIdx)}
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
                          value={setting.minAmount || ""}
                          onChange={(e) =>
                            updateSettingProperty(
                              settingIdx,
                              "minAmount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">最大金額</Label>
                        <Input
                          placeholder="0"
                          value={setting.maxAmount || ""}
                          onChange={(e) =>
                            updateSettingProperty(
                              settingIdx,
                              "maxAmount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">結算天數</Label>
                        <Input
                          placeholder="0"
                          value={setting.settlementInterval || ""}
                          onChange={(e) =>
                            updateSettingProperty(
                              settingIdx,
                              "settlementInterval",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Fee Settings */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">手續費設定</Label>
                      {feeEntries.map((feeEntry, feeIdx) => (
                        <div
                          key={feeIdx}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded"
                        >
                          <div className="w-24">
                            <span className="text-sm font-medium">
                              {feeEntry.accountTypeDisplay}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">費率</Label>
                            <Input
                              className="w-20"
                              value={
                                percentageInputs[
                                  `${settingIdx}-${feeEntry.accountType}`
                                ] ??
                                convertStringNumberToPercentageNumber(
                                  feeEntry.percentage
                                ).toString()
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                const inputKey = `${settingIdx}-${feeEntry.accountType}`;

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
                                      settingIdx,
                                      feeEntry.accountType,
                                      percentageValue.dividedBy(100).toString()
                                    );
                                  } else if (value === "") {
                                    updateFeeSettingPercentage(
                                      settingIdx,
                                      feeEntry.accountType,
                                      "0"
                                    );
                                  }
                                }
                              }}
                              onBlur={() => {
                                // Clear the raw input on blur to show formatted value
                                const inputKey = `${settingIdx}-${feeEntry.accountType}`;
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
                              value={feeEntry.fixed}
                              onChange={(e) =>
                                updateFeeSettingFixed(
                                  settingIdx,
                                  feeEntry.accountType,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {remainingChannel.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={addNewChannel}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    + 新增上游渠道
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleEditPaymentMethod}
            disabled={disableButton || isLoading}
            className="bg-purple-700 hover:bg-purple-800"
          >
            {isLoading ? "更新中..." : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
