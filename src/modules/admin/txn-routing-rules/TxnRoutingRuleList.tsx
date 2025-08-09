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
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { EnableToggleConfirmDialog } from "./EnableToggleConfirmDialog";
import { DeleteConfirmDialog } from "./EnableToggleConfirmDialog";

interface TxnRoutingRuleListProps {
  selectedRule?: TxnRoutingRule;
  onSelectRule: (rule: TxnRoutingRule) => void;
  onDeleteRule: (rule: TxnRoutingRule) => void;
  onToggleRuleEnable: (rule: TxnRoutingRule, enabled: boolean) => void;
}

export const TxnRoutingRuleList = ({
  selectedRule,
  onSelectRule,
  onDeleteRule,
  onToggleRuleEnable,
}: TxnRoutingRuleListProps) => {
  const [mounted, setMounted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingToggleRule, setPendingToggleRule] = useState<{
    rule: TxnRoutingRule;
    enabled: boolean;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteRule, setPendingDeleteRule] =
    useState<TxnRoutingRule | null>(null);
  const { txnRoutingRules, isLoading, isError } = useTxnRoutingRules();

  // 按照 createdAt 排序路由規則
  const sortedTxnRoutingRules = txnRoutingRules
    ? [...txnRoutingRules].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // 升序排列，最早的在前
      })
    : undefined;

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleRuleEnable = (rule: TxnRoutingRule, enabled: boolean) => {
    setPendingToggleRule({ rule, enabled });
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = () => {
    if (pendingToggleRule) {
      onToggleRuleEnable(pendingToggleRule.rule, pendingToggleRule.enabled);
      setConfirmDialogOpen(false);
      setPendingToggleRule(null);
    }
  };

  // 在組件未掛載時顯示加載狀態
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>路由規則</CardTitle>
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
          <CardTitle>路由規則</CardTitle>
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
          <CardTitle>路由規則</CardTitle>
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>路由規則</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-2">
          {sortedTxnRoutingRules?.map((rule) => (
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base">{rule.title}</h3>
                  </div>
                  {rule.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {rule.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enable}
                    onCheckedChange={(checked) =>
                      handleToggleRuleEnable(rule, checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteRule(rule);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(!sortedTxnRoutingRules || sortedTxnRoutingRules.length === 0) && (
            <div className="text-center py-8 text-gray-500">尚無路由規則</div>
          )}
        </div>
      </CardContent>
      <EnableToggleConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmToggle}
        ruleTitle={pendingToggleRule?.rule.title || ""}
        enabled={pendingToggleRule?.enabled || false}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (pendingDeleteRule) {
            onDeleteRule(pendingDeleteRule);
            setDeleteDialogOpen(false);
            setPendingDeleteRule(null);
          }
        }}
        title="確認刪除規則"
        description={`確定要刪除路由規則「${
          pendingDeleteRule?.title || ""
        }」嗎？此操作不可逆。`}
        confirmText="刪除"
        cancelText="取消"
      />
    </Card>
  );
};
