import { useState, useEffect } from "react";
import { Organization } from "@/lib/types/organization";
import {
  TxnRoutingRule,
  OrgTxnRoutingRule,
} from "@/lib/types/txn-routing-rule";
import { getOrgTxnRoutingRules } from "@/lib/apis/admin/txn-routing-rules/org/get";
import { getTxnRoutingRules } from "@/lib/apis/admin/txn-routing-rules/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { getConflictingRules } from "@/lib/utils/txn-routing-rule";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Switch } from "@/components/shadcn/ui/switch";
import {
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { OrgEnableToggleConfirmDialog } from "./OrgEnableToggleConfirmDialog";
import { DeleteConfirmDialog } from "./EnableToggleConfirmDialog";

interface OrganizationRoutingRulesProps {
  selectedOrganization?: Organization;
  onAddRule: (organizationId: string) => void;
  onRemoveRule: (orgRuleIds: string[]) => void;
  onToggleRuleEnable: (orgRule: OrgTxnRoutingRule, enabled: boolean) => void;
}

interface RuleWithBinding extends TxnRoutingRule {
  orgRuleId: string;
  orgRuleEnable: boolean;
}

export const OrganizationRoutingRules = ({
  selectedOrganization,
  onAddRule,
  onRemoveRule,
  onToggleRuleEnable,
}: OrganizationRoutingRulesProps) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [rulesWithBinding, setRulesWithBinding] = useState<RuleWithBinding[]>(
    []
  );
  const { accessToken } = getApplicationCookies();

  // 確認彈窗狀態
  const [toggleConfirmDialogOpen, setToggleConfirmDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [pendingToggleRule, setPendingToggleRule] = useState<{
    rule: RuleWithBinding;
    enabled: boolean;
  } | null>(null);
  const [pendingDeleteRuleIds, setPendingDeleteRuleIds] = useState<string[]>(
    []
  );

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 當選中的組織改變時，獲取組織綁定的路由規則
  useEffect(() => {
    if (mounted && selectedOrganization && accessToken) {
      setIsLoading(true);
      setIsError(false);

      // 先獲取組織的綁定關係
      getOrgTxnRoutingRules({
        accessToken,
        organizationId: selectedOrganization.id,
      })
        .then(async (orgRules) => {
          if (orgRules.length === 0) {
            setRulesWithBinding([]);
            return;
          }

          // 獲取所有相關的規則詳細資訊
          const ruleIds = orgRules.map((orgRule) => orgRule.txnRoutingRuleId);

          try {
            const allRules = await getTxnRoutingRules({ accessToken });

            // 合併綁定關係和規則詳細資訊
            const rulesWithBindingInfo = orgRules
              .map((orgRule) => {
                const rule = allRules.find(
                  (r: TxnRoutingRule) => r.id === orgRule.txnRoutingRuleId
                );
                if (!rule) {
                  console.warn(
                    `找不到規則 ID ${orgRule.txnRoutingRuleId} 的詳細資訊`
                  );
                  return null;
                }
                return {
                  ...rule,
                  orgRuleId: orgRule.id,
                  orgRuleEnable: orgRule.enable,
                };
              })
              .filter(Boolean) as RuleWithBinding[];

            setRulesWithBinding(rulesWithBindingInfo);
          } catch (error) {
            console.error("獲取規則詳細資訊失敗:", error);
            setIsError(true);
            setRulesWithBinding([]);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch org txn routing rules:", error);
          setIsError(true);
          setRulesWithBinding([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRulesWithBinding([]);
    }
  }, [selectedOrganization, accessToken, mounted]);

  // 處理 toggle 確認
  const handleToggleConfirm = async () => {
    if (pendingToggleRule) {
      const { rule, enabled } = pendingToggleRule;

      // 樂觀更新：立即更新本地狀態
      setRulesWithBinding((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, orgRuleEnable: enabled } : r
        )
      );

      try {
        // 創建一個 OrgTxnRoutingRule 對象
        const orgRule: OrgTxnRoutingRule = {
          id: rule.orgRuleId,
          organizationId: selectedOrganization!.id,
          txnRoutingRuleId: rule.id,
          enable: enabled,
          createdAt: "",
          updatedAt: "",
        };
        await onToggleRuleEnable(orgRule, enabled);
      } catch (error) {
        // 如果 API 調用失敗，回滾到原始狀態
        setRulesWithBinding((prev) =>
          prev.map((r) =>
            r.id === rule.id ? { ...r, orgRuleEnable: !enabled } : r
          )
        );
      }

      setToggleConfirmDialogOpen(false);
      setPendingToggleRule(null);
    }
  };

  // 處理刪除確認
  const handleDeleteConfirm = () => {
    if (pendingDeleteRuleIds.length > 0) {
      onRemoveRule(pendingDeleteRuleIds);
      setDeleteConfirmDialogOpen(false);
      setPendingDeleteRuleIds([]);
    }
  };

  if (!mounted) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>組織路由規則</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedOrganization) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>組織路由規則</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">請選擇一個組織</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>組織路由規則</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
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
        <CardTitle>組織詳情與所綁定的規則</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-6">
          {/* 上半部：組織詳細資訊 */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedOrganization.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">組織ID:</span>
                <span className="ml-2">{selectedOrganization.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">組織類型:</span>
                <span className="ml-2">{selectedOrganization.type}</span>
              </div>
            </div>
          </div>

          {/* 下半部：路由規則列表 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold">綁定的路由規則</h4>
              <Button
                onClick={() => onAddRule(selectedOrganization.id)}
                size="sm"
                disabled={isLoading}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                新增綁定
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">載入中...</div>
              </div>
            ) : rulesWithBinding.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                該組織尚未綁定任何路由規則
              </div>
            ) : (
              <div className="space-y-2">
                {rulesWithBinding.map((rule) => {
                  const conflictingRules = getConflictingRules(
                    rule,
                    rulesWithBinding
                  );
                  return (
                    <div
                      key={rule.id}
                      className="p-3 border rounded-lg transition-colors border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-base">
                              {rule.title}
                            </h3>
                          </div>
                          {rule.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {rule.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>
                              支付方式:{" "}
                              {PaymentMethodDisplayNames[rule.paymentMethod] ||
                                rule.paymentMethod}
                            </span>
                            <span>
                              交易類型:{" "}
                              {TransactionTypeDisplayNames[
                                rule.transactionType
                              ] || rule.transactionType}
                            </span>
                            {rule.accountType && (
                              <span>帳戶類型: {rule.accountType}</span>
                            )}
                          </div>
                          {(rule.minValue !== null ||
                            rule.maxValue !== null) && (
                            <div className="mt-1 text-xs text-gray-500">
                              金額範圍:{" "}
                              {rule.minValue !== null
                                ? `${rule.minValue}`
                                : "0"}{" "}
                              -{" "}
                              {rule.maxValue !== null
                                ? `${rule.maxValue}`
                                : "無限制"}
                            </div>
                          )}
                          {/* 衝突警告 */}
                          {conflictingRules.length > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="flex items-center gap-1 text-xs text-yellow-800">
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                <span className="font-medium">規則衝突:</span>
                              </div>
                              <div className="mt-1 text-xs text-yellow-700">
                                與以下規則存在衝突:{" "}
                                {conflictingRules.map((conflictRule, index) => (
                                  <span key={conflictRule.id}>
                                    {index > 0 && ", "}
                                    <span className="font-medium">
                                      {conflictRule.title}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.orgRuleEnable ?? rule.enable}
                            onCheckedChange={(checked) => {
                              setPendingToggleRule({ rule, enabled: checked });
                              setToggleConfirmDialogOpen(true);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPendingDeleteRuleIds([rule.orgRuleId]);
                              setDeleteConfirmDialogOpen(true);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <OrgEnableToggleConfirmDialog
        open={toggleConfirmDialogOpen}
        onOpenChange={setToggleConfirmDialogOpen}
        onConfirm={handleToggleConfirm}
        organizationName={selectedOrganization?.name || ""}
        ruleTitle={pendingToggleRule?.rule.title || ""}
        enabled={pendingToggleRule?.enabled || false}
      />
      <DeleteConfirmDialog
        open={deleteConfirmDialogOpen}
        onOpenChange={setDeleteConfirmDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="確認刪除規則綁定"
        description={`確定要刪除選中的 ${pendingDeleteRuleIds.length} 個規則綁定嗎？此操作不可逆。`}
        confirmText="刪除"
        cancelText="取消"
      />
    </Card>
  );
};
