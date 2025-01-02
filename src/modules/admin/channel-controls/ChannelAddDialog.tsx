import {
  ChannelSettings,
  createOrganizationTransactionFeeConfigsWithSamePaymentMethod,
} from "@/lib/apis/organizations/transaction-fee-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  PaymentChannelCategories,
  PaymentChannelDisplayNames,
  PaymentMethod,
  PaymentMethodDisplayNames,
  TransactionType,
  TransactionTypeDisplayNames,
} from "@/lib/types/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { ApplicationError } from "@/lib/types/applicationError";
import { Button } from "@/components/shadcn/ui/button";
import Decimal from "decimal.js";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { convertStringNumberToPercentageNumber } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { useOrganizationTransactionFeeConfigs } from "@/lib/hooks/swr/transaction-fee-config";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function ChannelAddDialog({
  isOpen,
  closeDialog,
}: {
  isOpen: boolean;
  closeDialog: () => void;
}) {
  const { toast } = useToast();

  const { organizationId } = getApplicationCookies();

  const [type, setType] = useState();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [percentageFee, setPercentageFee] = useState<string>("");
  const [fixedFee, setFixedFee] = useState<string>("0");
  const [channelSettings, setChannelSettings] = useState<ChannelSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [percentageFeeInPercentage, setPercentageFeeInPercentage] =
    useState("");

  const { mutate } = useOrganizationTransactionFeeConfigs({
    organizationId,
    type,
  });

  const disableButton =
    !paymentMethod ||
    isNaN(parseFloat(percentageFee)) ||
    isNaN(parseFloat(percentageFeeInPercentage)) ||
    isNaN(parseFloat(fixedFee)) ||
    parseFloat(percentageFee) >= 1 ||
    parseFloat(fixedFee) < 0 ||
    parseFloat(percentageFee) < 0 ||
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
          parseFloat(channel.minAmount) > parseFloat(channel.maxAmount))
    );

  const remainingChannel = paymentMethod
    ? PaymentChannelCategories[paymentMethod].filter(
        (paymentChannel) =>
          !channelSettings.some(
            (channel) => channel.paymentChannel === paymentChannel
          )
      )
    : [];

  // Handler for the percentage input in decimal format
  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPercentageFee(value);

    // Also update the percentage input accordingly
    if (!isNaN(parseFloat(value))) {
      setPercentageFeeInPercentage(
        convertStringNumberToPercentageNumber(value).toString()
      );
    } else {
      setPercentageFeeInPercentage("");
    }
  };

  // Handler for the percentage input in percentage format
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPercentageFeeInPercentage(value);

    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue) && parsedValue.toString() === value) {
      const percentageValue = new Decimal(parsedValue);
      setPercentageFee(percentageValue.dividedBy(100).toString());
    } else {
      setPercentageFee("");
    }
  };

  const handleCloseDialog = () => {
    closeDialog();
    setPaymentMethod(undefined);
    setPercentageFee("");
    setPercentageFeeInPercentage("");
    setFixedFee("0");
    setChannelSettings([]);
  };

  const handleAddPaymentMethod = async () => {
    const { accessToken } = getApplicationCookies();
    if (!type || disableButton || !accessToken || !organizationId) return;

    const formattedChannelSettings = channelSettings.map((channelSetting) => {
      const settlementInterval = channelSetting.settlementInterval;

      return {
        ...channelSetting,
        ...(settlementInterval && {
          settlementInterval:
            parseInt(settlementInterval) > 1
              ? `${settlementInterval} days`
              : `${settlementInterval} day`,
        }),
      };
    });

    try {
      setIsLoading(true);
      const response =
        await createOrganizationTransactionFeeConfigsWithSamePaymentMethod({
          organizationId,
          type,
          paymentMethod,
          percentageFee,
          fixedFee,
          channelSettings: formattedChannelSettings,
          accessToken,
        });
      const data = await response.json();
      if (response.ok) {
        handleCloseDialog();
        toast({
          title: `${TransactionTypeDisplayNames[type]}通道新增成功`,
          variant: "success",
        });
        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - ${TransactionTypeDisplayNames[type]}通道新增失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `${TransactionTypeDisplayNames[type]}通道新增失敗`,
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
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            新增{type && TransactionTypeDisplayNames[type]}通道
          </DialogTitle>
          <DialogDescription>新增一個通道</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">通道</Label>
            <div className="w-fit min-w-[150px]">
              <Select
                defaultValue={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
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
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">手續費率</Label>
            <div className="flex items-center gap-2 w-fit">
              <Input
                id="percentageFee"
                className="max-w-[100px]"
                value={percentageFee}
                onChange={handleDecimalChange}
              />
              <div>=</div>
              <Input
                id="percentageFeeInPercentage"
                className="max-w-[80px]"
                value={percentageFeeInPercentage}
                onChange={handlePercentageChange}
              />
              <span>%</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">固定手續費</Label>
            <Input
              id="fixedFee"
              className="max-w-[100px]"
              value={fixedFee}
              onChange={(e) => setFixedFee(e.target.value)}
            />
          </div>
        </div>
        <div className="py-4 flex flex-col">
          <Label className="whitespace-nowrap w-[70px] pb-3">
            {type && TransactionTypeDisplayNames[type]}渠道設定
          </Label>

          {paymentMethod && (
            <div className="flex flex-col border p-2 rounded-md max-h-[300px] max-w-[min(100vw-48px,650px-16px)] overflow-scroll">
              <table className="divide-y table-auto">
                <thead className="whitespace-nowrap w-full">
                  <tr>
                    <th className="max-w-[70px] px-3 py-2 text-left text-sm font-semibold text-gray-900">
                      渠道
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      最小金額
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      最大金額
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      結算天數
                    </th>
                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {channelSettings.map((channelSetting, idx) => (
                    <tr key={`${idx}${channelSetting?.paymentChannel}`}>
                      <td className="min-w-[150px] px-1 py-2">
                        <Select
                          defaultValue={channelSetting?.paymentChannel}
                          onValueChange={(value) => {
                            setChannelSettings((prev) =>
                              prev.map((channel, index) =>
                                index === idx
                                  ? {
                                      ...channel,
                                      paymentChannel: value,
                                    }
                                  : channel
                              )
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {PaymentChannelCategories[paymentMethod].map(
                                (paymentChannel) => {
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
                                      {
                                        PaymentChannelDisplayNames[
                                          paymentChannel
                                        ]
                                      }
                                    </SelectItem>
                                  );
                                }
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-1 py-2">
                        <Input
                          value={channelSetting?.minAmount}
                          className="w-full"
                          onChange={(e) => {
                            setChannelSettings((prev) =>
                              prev.map((channel, index) =>
                                index === idx
                                  ? {
                                      ...channel,
                                      minAmount: e.target.value,
                                    }
                                  : channel
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="px-1 py-2">
                        <Input
                          value={channelSetting?.maxAmount}
                          className="w-full"
                          onChange={(e) => {
                            setChannelSettings((prev) =>
                              prev.map((channel, index) =>
                                index === idx
                                  ? {
                                      ...channel,
                                      maxAmount: e.target.value,
                                    }
                                  : channel
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="px-1 py-2 flex items-center gap-1">
                        <Input
                          value={channelSetting?.settlementInterval}
                          className="max-w-[100px]"
                          type="number"
                          onChange={(e) => {
                            const value = e.target.value;

                            setChannelSettings((prev) =>
                              prev.map((channel, index) =>
                                index === idx
                                  ? {
                                      ...channel,
                                      settlementInterval: value,
                                    }
                                  : channel
                              )
                            );
                          }}
                        />
                        <span>天</span>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <Button
                          className="bg-red-500 hover:bg-red-600 rounded-md p-2"
                          onClick={() => {
                            setChannelSettings((prev) =>
                              prev.filter((_, index) => index !== idx)
                            );
                          }}
                        >
                          <XMarkIcon className="h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {remainingChannel.length > 0 && (
                <Button
                  variant="outline"
                  className="w-fit ml-1 mb-2"
                  onClick={() => {
                    setChannelSettings((prev) => [
                      ...prev,
                      {
                        paymentChannel: remainingChannel[0],
                        minAmount: undefined,
                        maxAmount: undefined,
                        enabled: true,
                      },
                    ]);
                  }}
                >
                  新增渠道
                </Button>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddPaymentMethod} disabled={disableButton}>
            {isLoading ? "新增中..." : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
