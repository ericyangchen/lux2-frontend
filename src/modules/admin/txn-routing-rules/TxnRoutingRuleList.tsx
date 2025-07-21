import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { useTxnRoutingRules } from "@/lib/hooks/swr/txnRoutingRule";
import { Switch } from "@/components/shadcn/ui/switch";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { PaymentChannelDisplayNames } from "@/lib/constants/transaction";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";

interface TxnRoutingRuleListProps {
  selectedRule?: TxnRoutingRule;
  onSelectRule: (rule: TxnRoutingRule) => void;
  onCreateRule: () => void;
  onDeleteRule: (rule: TxnRoutingRule) => void;
  onToggleRuleEnable: (rule: TxnRoutingRule, enabled: boolean) => void;
}

export const TxnRoutingRuleList = ({
  selectedRule,
  onSelectRule,
  onCreateRule,
  onDeleteRule,
  onToggleRuleEnable,
}: TxnRoutingRuleListProps) => {
  const [mounted, setMounted] = useState(false);
  const { txnRoutingRules, isLoading, isError } = useTxnRoutingRules();

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 在組件未掛載時顯示加載狀態
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>優先級規則</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>優先級規則</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>優先級規則</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">載入失敗</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>優先級規則</CardTitle>
        <Button onClick={onCreateRule} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          新增規則
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {txnRoutingRules?.map((rule) => (
            <div
              key={rule.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRule?.id === rule.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelectRule(rule)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{rule.title}</h3>
                    <Badge variant={rule.enable ? "default" : "secondary"}>
                      {rule.enable ? "啟用" : "停用"}
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="text-xs text-gray-600 mb-1">
                      {rule.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>
                        支付方式:{" "}
                        {PaymentMethodDisplayNames[rule.paymentMethod]}
                      </span>
                      <span>
                        交易類型:{" "}
                        {TransactionTypeDisplayNames[rule.transactionType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        金額範圍:{" "}
                        {rule.minValue !== null &&
                        rule.maxValue !== null &&
                        rule.minValue !== undefined &&
                        rule.maxValue !== undefined
                          ? `${rule.minValue} - ${rule.maxValue}`
                          : rule.minValue === null && rule.maxValue === null
                          ? "沒有設置"
                          : "無限制"}
                      </span>
                      {rule.accountType && (
                        <span>帳戶類型: {rule.accountType}</span>
                      )}
                    </div>
                    {/* 顯示所有路由規則 */}
                    <div className="mt-2 space-y-1">
                      <span className="font-medium">路由規則:</span>
                      {rule.routingRule.map((routingRule, index) => (
                        <div
                          key={index}
                          className="ml-2 text-xs bg-gray-50 p-1 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {routingRule.priority}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(routingRule.percentage).map(
                                ([channel, percentage]) => (
                                  <Badge key={channel} className="text-xs">
                                    {PaymentChannelDisplayNames[
                                      channel as keyof typeof PaymentChannelDisplayNames
                                    ] || channel}
                                    : {percentage}%
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enable}
                    onCheckedChange={(checked) =>
                      onToggleRuleEnable(rule, checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRule(rule);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(!txnRoutingRules || txnRoutingRules.length === 0) && (
            <div className="text-center py-8 text-gray-500">尚無優先級規則</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
