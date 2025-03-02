import {
  ChannelSettings,
  createOrganizationTransactionFeeConfigsWithSamePaymentMethod,
  updateGeneralAgentTransactionFeeConfig,
  updateOrganizationTransactionFeeConfigsWithSamePaymentMethod,
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
  PaymentChannel,
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
import { Switch } from "@/components/shadcn/ui/switch";
import { TransactionFeeConfig } from "@/lib/types/transaction-fee-config";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/lib/utils";
import { convertStringNumberToPercentageNumber } from "@/lib/number";
import { getApplicationCookies } from "@/lib/cookie";
import { useOrganizationTransactionFeeConfigs } from "@/lib/hooks/swr/transaction-fee-config";
import { useState } from "react";
import { useToast } from "@/components/shadcn/ui/use-toast";

export function ChannelEditDialog({
  isOpen,
  closeDialog,
  transactionFeeConfig,
}: {
  isOpen: boolean;
  closeDialog: () => void;
  transactionFeeConfig: TransactionFeeConfig;
}) {
  const { toast } = useToast();

  const { mutate } = useOrganizationTransactionFeeConfigs({
    organizationId: transactionFeeConfig.organizationId,
  });

  const [percentageFee, setPercentageFee] = useState<string>(
    transactionFeeConfig?.percentageFee
  );
  const [fixedFee, setFixedFee] = useState<string>(
    transactionFeeConfig?.fixedFee || "0"
  );
  const [minAmount, setMinAmount] = useState(transactionFeeConfig?.minAmount);
  const [maxAmount, setMaxAmount] = useState(transactionFeeConfig?.maxAmount);
  const [settlementInterval, setSettlementInterval] = useState(
    transactionFeeConfig?.settlementInterval
  );
  const [enabled, setEnabled] = useState<boolean>(
    transactionFeeConfig?.enabled || false
  );

  const [isLoading, setIsLoading] = useState(false);

  const [percentageFeeInPercentage, setPercentageFeeInPercentage] = useState(
    convertStringNumberToPercentageNumber(
      transactionFeeConfig?.percentageFee
    ).toString()
  );

  const disableButton =
    !transactionFeeConfig ||
    isNaN(parseFloat(percentageFee)) ||
    isNaN(parseFloat(percentageFeeInPercentage)) ||
    isNaN(parseFloat(fixedFee)) ||
    parseFloat(percentageFee) >= 1 ||
    parseFloat(fixedFee) < 0 ||
    parseFloat(percentageFee) < 0 ||
    (!!minAmount && isNaN(parseFloat(minAmount))) ||
    (!!maxAmount && isNaN(parseFloat(maxAmount))) ||
    (!!minAmount && parseFloat(minAmount) < 0) ||
    (!!maxAmount && parseFloat(maxAmount) < 0) ||
    (!!minAmount &&
      !!maxAmount &&
      parseFloat(minAmount) > parseFloat(maxAmount));

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
    setPercentageFee("");
    setPercentageFeeInPercentage("");
    setFixedFee("0");
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setSettlementInterval(undefined);
    setEnabled(false);
  };

  const handleEditPaymentChannel = async () => {
    const { accessToken, organizationId } = getApplicationCookies();
    if (disableButton || !accessToken || !organizationId) return;

    const formattedSettlementInterval = settlementInterval
      ? parseInt(settlementInterval) > 1
        ? `${parseInt(settlementInterval)} days`
        : `${parseInt(settlementInterval)} day`
      : `0 day`;

    try {
      setIsLoading(true);
      const response = await updateGeneralAgentTransactionFeeConfig({
        accessToken,
        transactionFeeConfigId: transactionFeeConfig.id,
        organizationId,
        type: transactionFeeConfig.type,
        paymentMethod: transactionFeeConfig.paymentMethod,
        paymentChannel: transactionFeeConfig.paymentChannel,
        percentageFee,
        fixedFee,
        minAmount,
        maxAmount,
        settlementInterval: formattedSettlementInterval,
        enabled,
      });
      const data = await response.json();
      if (response.ok) {
        handleCloseDialog();
        toast({
          title: `上游渠道更新成功`,
          variant: "success",
        });
        mutate();
      } else {
        throw new ApplicationError(data);
      }
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: `${error.statusCode} - 上游渠道更新失敗`,
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `上游渠道更新失敗`,
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
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-normal">編輯上游渠道: </span>
              <div className="flex items-center gap-1">
                {transactionFeeConfig.type === TransactionType.DEPOSIT ? (
                  <span className="text-white p-1 bg-blue-600 rounded-md">
                    {TransactionTypeDisplayNames[transactionFeeConfig.type]}
                  </span>
                ) : (
                  <span className="text-white p-1 bg-red-600 rounded-md">
                    {TransactionTypeDisplayNames[transactionFeeConfig.type]}
                  </span>
                )}
                {
                  PaymentChannelDisplayNames[
                    transactionFeeConfig.paymentChannel
                  ]
                }
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">類別</Label>
            <div className="w-fit min-w-[150px]">
              <td
                className={classNames(
                  transactionFeeConfig.type === TransactionType.DEPOSIT
                    ? "text-blue-600"
                    : "text-red-600"
                )}
              >
                {TransactionTypeDisplayNames[transactionFeeConfig.type]}
              </td>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">通道</Label>
            <div className="w-fit min-w-[150px]">
              {PaymentMethodDisplayNames[transactionFeeConfig.paymentMethod]}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">上游渠道</Label>
            <div className="w-fit min-w-[150px]">
              {PaymentChannelDisplayNames[transactionFeeConfig.paymentChannel]}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">手續費率</Label>
            <div className="flex items-center gap-2 w-fit">
              {/* <Input
                id="percentageFee"
                className="max-w-[100px]"
                value={percentageFee}
                onChange={handleDecimalChange}
              />
              <div>=</div> */}
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
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">最小金額</Label>
            <Input
              value={minAmount}
              placeholder="無限制"
              className="max-w-[100px]"
              onChange={(e) => {
                setMinAmount(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">最大金額</Label>
            <Input
              value={maxAmount}
              placeholder="無限制"
              className="max-w-[100px]"
              onChange={(e) => {
                setMaxAmount(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">結算天數</Label>
            <Input
              value={settlementInterval}
              className="max-w-[100px]"
              onChange={(e) => {
                setSettlementInterval(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap w-[70px]">狀態</Label>
            <Switch
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
              checked={enabled}
              onCheckedChange={(value) => {
                setEnabled(value);
              }}
            />
            {enabled ? (
              <span className="text-green-600">啟用</span>
            ) : (
              <span className="text-red-600">停用</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEditPaymentChannel} disabled={disableButton}>
            {isLoading ? "更新中..." : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
