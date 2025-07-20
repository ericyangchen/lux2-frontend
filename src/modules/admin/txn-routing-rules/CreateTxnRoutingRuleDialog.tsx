import { useState, useEffect } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { Badge } from "@/components/shadcn/ui/badge";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import {
  CreateTxnRoutingRuleRequest,
  RoutingRuleItem,
} from "@/lib/types/txn-routing-rule";
import {
  PaymentChannelDisplayNames,
  DepositAccountTypeDisplayNames,
  WithdrawalAccountTypeDisplayNames,
  DepositPaymentChannelCategories,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";
import { useToast } from "@/components/shadcn/ui/use-toast";

interface CreateTxnRoutingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTxnRoutingRuleRequest) => Promise<void>;
}

export const CreateTxnRoutingRuleDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateTxnRoutingRuleDialogProps) => {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountTypeCategory, setAccountTypeCategory] = useState<
    "deposit" | "withdrawal" | "none"
  >("none");
  const [formData, setFormData] = useState<CreateTxnRoutingRuleRequest>({
    title: "",
    description: "",
    minValue: undefined,
    maxValue: undefined,
    accountType: undefined,
    routingRule: [
      {
        priority: 100,
        percentage: {} as Record<PaymentChannel, number>,
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 根據帳戶類型類別獲取可用的帳戶類型
  const getAvailableAccountTypes = () => {
    if (accountTypeCategory === "deposit") {
      return Object.values(DepositToAccountType).map((type) => ({
        value: type,
        label: DepositAccountTypeDisplayNames[type] || type,
      }));
    } else if (accountTypeCategory === "withdrawal") {
      return Object.values(WithdrawalToAccountType).map((type) => ({
        value: type,
        label: WithdrawalAccountTypeDisplayNames[type] || type,
      }));
    }
    return [];
  };

  // 根據帳戶類型類別獲取可用的支付渠道
  const getAvailablePaymentChannels = () => {
    if (accountTypeCategory === "deposit") {
      return Object.values(DepositPaymentChannelCategories).flat();
    } else if (accountTypeCategory === "withdrawal") {
      return Object.values(WithdrawalPaymentChannelCategories).flat();
    }
    return [];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 驗證必填字段
    if (!formData.title.trim()) {
      newErrors.title = "規則標題為必填項";
    }

    // 驗證金額範圍
    if (formData.minValue !== undefined && formData.minValue < 0) {
      newErrors.minValue = "最小金額不能小於0";
    }
    if (formData.maxValue !== undefined && formData.maxValue < 0) {
      newErrors.maxValue = "最大金額不能小於0";
    }
    if (
      formData.minValue !== undefined &&
      formData.maxValue !== undefined &&
      formData.minValue >= formData.maxValue
    ) {
      newErrors.maxValue = "最大金額必須大於最小金額";
    }

    // 驗證路由規則
    if (!formData.routingRule || formData.routingRule.length === 0) {
      newErrors.routingRule = "至少需要一個路由規則";
    } else {
      formData.routingRule.forEach((rule, index) => {
        if (rule.priority < 1) {
          newErrors[`routingRule.${index}.priority`] = "優先級必須大於0";
        }

        const percentageSum = Object.values(rule.percentage).reduce(
          (sum, val) => sum + val,
          0
        );
        if (percentageSum !== 100) {
          newErrors[`routingRule.${index}.percentage`] =
            "百分比總和必須等於100";
        }

        if (Object.keys(rule.percentage).length === 0) {
          newErrors[`routingRule.${index}.percentage`] =
            "至少需要選擇一個支付渠道";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "驗證失敗",
        description: "請檢查表單中的錯誤",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast({
        title: "創建成功",
        description: "規則已成功創建",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "創建失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAccountTypeCategory("none");
    setFormData({
      title: "",
      description: "",
      minValue: undefined,
      maxValue: undefined,
      accountType: undefined,
      routingRule: [
        {
          priority: 100,
          percentage: {} as Record<PaymentChannel, number>,
        },
      ],
    });
    setErrors({});
    onOpenChange(false);
  };

  const addRoutingRule = () => {
    setFormData((prev) => ({
      ...prev,
      routingRule: [
        ...prev.routingRule,
        {
          priority: prev.routingRule.length + 1,
          percentage: {} as Record<PaymentChannel, number>,
        },
      ],
    }));
  };

  const removeRoutingRule = (index: number) => {
    if (formData.routingRule.length > 1) {
      setFormData((prev) => ({
        ...prev,
        routingRule: prev.routingRule.filter((_, i) => i !== index),
      }));
    }
  };

  const updateRoutingRule = (
    index: number,
    field: keyof RoutingRuleItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      routingRule: prev.routingRule.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const updatePercentage = (
    ruleIndex: number,
    channel: PaymentChannel,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      routingRule: prev.routingRule.map((rule, i) =>
        i === ruleIndex
          ? {
              ...rule,
              percentage: {
                ...rule.percentage,
                [channel]: value,
              },
            }
          : rule
      ),
    }));
  };

  const removePercentage = (ruleIndex: number, channel: PaymentChannel) => {
    setFormData((prev) => ({
      ...prev,
      routingRule: prev.routingRule.map((rule, i) =>
        i === ruleIndex
          ? {
              ...rule,
              percentage: Object.fromEntries(
                Object.entries(rule.percentage).filter(
                  ([key]) => key !== channel
                )
              ) as Record<PaymentChannel, number>,
            }
          : rule
      ),
    }));
  };

  // 當帳戶類型類別改變時，重置帳戶類型和路由規則
  const handleAccountTypeCategoryChange = (value: string) => {
    const category = value as "deposit" | "withdrawal" | "none";
    setAccountTypeCategory(category);
    setFormData((prev) => ({
      ...prev,
      accountType: undefined,
      routingRule: [
        {
          priority: 100,
          percentage: {} as Record<PaymentChannel, number>,
        },
      ],
    }));
  };

  const availableAccountTypes = getAvailableAccountTypes();
  const availablePaymentChannels = getAvailablePaymentChannels();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>創建優先級規則</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 帳戶類型類別選擇 */}
          <div className="space-y-2">
            <Label htmlFor="accountTypeCategory">帳戶類型類別</Label>
            <Select
              value={accountTypeCategory}
              onValueChange={handleAccountTypeCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇帳戶類型類別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">無</SelectItem>
                <SelectItem value="deposit">代收</SelectItem>
                <SelectItem value="withdrawal">代付</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">規則標題 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="輸入規則標題"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="輸入規則描述（可選）"
              rows={3}
            />
          </div>

          {/* 金額範圍 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minValue">最小金額</Label>
              <Input
                id="minValue"
                type="text"
                value={
                  formData.minValue !== undefined
                    ? formData.minValue.toString()
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData((prev) => ({
                      ...prev,
                      minValue: undefined,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      minValue: Number(value),
                    }));
                  }
                }}
                placeholder="輸入最小金額"
                className={errors.minValue ? "border-red-500" : ""}
              />
              {errors.minValue && (
                <p className="text-sm text-red-500">{errors.minValue}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxValue">最大金額</Label>
              <Input
                id="maxValue"
                type="text"
                value={
                  formData.maxValue !== undefined
                    ? formData.maxValue.toString()
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData((prev) => ({
                      ...prev,
                      maxValue: undefined,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      maxValue: Number(value),
                    }));
                  }
                }}
                placeholder="輸入最大金額"
                className={errors.maxValue ? "border-red-500" : ""}
              />
              {errors.maxValue && (
                <p className="text-sm text-red-500">{errors.maxValue}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">帳戶類型</Label>
              <Select
                value={formData.accountType || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    accountType:
                      value === "none"
                        ? undefined
                        : (value as
                            | DepositToAccountType
                            | WithdrawalToAccountType),
                  }))
                }
                disabled={accountTypeCategory === "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇帳戶類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">無</SelectItem>
                  {availableAccountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 路由規則 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>路由規則 *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRoutingRule}
                disabled={accountTypeCategory === "none"}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                新增規則
              </Button>
            </div>

            {errors.routingRule && (
              <p className="text-sm text-red-500">{errors.routingRule}</p>
            )}

            <div className="space-y-4">
              {formData.routingRule.map((rule, ruleIndex) => (
                <div
                  key={ruleIndex}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">規則 {ruleIndex + 1}</h4>
                    {formData.routingRule.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoutingRule(ruleIndex)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>優先級</Label>
                      <Input
                        type="text"
                        value={
                          rule.priority !== undefined
                            ? rule.priority.toString()
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          updateRoutingRule(
                            ruleIndex,
                            "priority",
                            value === "" ? undefined : Number(value)
                          );
                        }}
                        placeholder="輸入優先級"
                        className={
                          errors[`routingRule.${ruleIndex}.priority`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`routingRule.${ruleIndex}.priority`] && (
                        <p className="text-sm text-red-500">
                          {errors[`routingRule.${ruleIndex}.priority`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>支付渠道分配</Label>
                      <div className="space-y-2">
                        {/* 已選擇的支付渠道 */}
                        {Object.entries(rule.percentage).map(
                          ([channel, percentage]) => (
                            <div
                              key={channel}
                              className="flex items-center gap-2 p-2 border rounded"
                            >
                              <span className="text-sm flex-1">
                                {PaymentChannelDisplayNames[
                                  channel as PaymentChannel
                                ] || channel}
                              </span>
                              <Input
                                type="text"
                                placeholder="百分比"
                                value={percentage || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updatePercentage(
                                    ruleIndex,
                                    channel as PaymentChannel,
                                    value === "" ? 0 : Number(value)
                                  );
                                }}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-600">%</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removePercentage(
                                    ruleIndex,
                                    channel as PaymentChannel
                                  )
                                }
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        )}

                        {/* 新增支付渠道 */}
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(value) => {
                              if (
                                value &&
                                !rule.percentage[value as PaymentChannel]
                              ) {
                                updatePercentage(
                                  ruleIndex,
                                  value as PaymentChannel,
                                  0
                                );
                              }
                            }}
                            disabled={accountTypeCategory === "none"}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="選擇支付渠道" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePaymentChannels
                                .filter((channel) => !rule.percentage[channel])
                                .map((channel) => (
                                  <SelectItem key={channel} value={channel}>
                                    {PaymentChannelDisplayNames[channel] ||
                                      channel}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {errors[`routingRule.${ruleIndex}.percentage`] && (
                        <p className="text-sm text-red-500">
                          {errors[`routingRule.${ruleIndex}.percentage`]}
                        </p>
                      )}

                      <div className="mt-2">
                        <Badge variant="outline">
                          總計:{" "}
                          {Object.values(rule.percentage).reduce(
                            (sum, val) => sum + val,
                            0
                          )}
                          %
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "創建中..." : "創建規則"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
