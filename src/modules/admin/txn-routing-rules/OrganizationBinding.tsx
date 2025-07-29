import {
  TxnRoutingRule,
  OrgTxnRoutingRule,
} from "@/lib/types/txn-routing-rule";
import { Organization } from "@/lib/types/organization";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { getOrgTxnRoutingRulesByTxnRoutingRuleId } from "@/lib/apis/admin/txn-routing-rules/org/get";
import { ApiGetOrganizationById } from "@/lib/apis/organizations/get";
import { Switch } from "@/components/shadcn/ui/switch";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { OrgEnableToggleConfirmDialog } from "./OrgEnableToggleConfirmDialog";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { PaymentChannelDisplayNames } from "@/lib/constants/transaction";
import { DepositAccountTypeDisplayNames } from "@/lib/constants/transaction";
import { WithdrawalAccountTypeDisplayNames } from "@/lib/constants/transaction";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";
import { DeleteConfirmDialog } from "./EnableToggleConfirmDialog";

interface OrganizationBindingProps {
  selectedRule?: TxnRoutingRule;
  onAddOrganizations: (ruleId: string) => void;
  onRemoveOrganizations: (orgRuleIds: string[]) => void;
  onToggleOrgRuleEnable: (orgRule: OrgTxnRoutingRule, enabled: boolean) => void;
}

interface OrgTxnRoutingRuleWithName extends OrgTxnRoutingRule {
  organizationName: string;
}

export const OrganizationBinding = ({
  selectedRule,
  onAddOrganizations,
  onRemoveOrganizations,
  onToggleOrgRuleEnable,
}: OrganizationBindingProps) => {
  const [mounted, setMounted] = useState(false);
  const { organizationId } = getApplicationCookies();
  const { organization } = useOrganizationWithChildren({ organizationId });
  const { accessToken } = getApplicationCookies();
  const { toast } = useToast();

  const [selectedOrgRuleIds, setSelectedOrgRuleIds] = useState<string[]>([]);
  const [orgTxnRoutingRules, setOrgTxnRoutingRules] = useState<
    OrgTxnRoutingRuleWithName[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingToggleOrgRule, setPendingToggleOrgRule] = useState<{
    orgRule: OrgTxnRoutingRuleWithName;
    enabled: boolean;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteOrgIds, setPendingDeleteOrgIds] = useState<string[]>([]);

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 當選中的規則改變時，獲取綁定的組織規則
  useEffect(() => {
    if (mounted && selectedRule && accessToken) {
      setIsLoading(true);
      setIsError(false);

      getOrgTxnRoutingRulesByTxnRoutingRuleId({
        accessToken,
        txnRoutingRuleId: selectedRule.id,
      })
        .then(async (orgRules) => {
          // 為每個組織規則獲取組織名稱
          const orgRulesWithNames = await Promise.all(
            orgRules.map(async (orgRule) => {
              try {
                const response = await ApiGetOrganizationById({
                  organizationId: orgRule.organizationId,
                  accessToken,
                });

                if (response.ok) {
                  const organization: Organization = await response.json();
                  return {
                    ...orgRule,
                    organizationName: organization.name,
                  };
                } else {
                  // 如果獲取組織名稱失敗，使用組織 ID 作為回退
                  return {
                    ...orgRule,
                    organizationName: orgRule.organizationId,
                  };
                }
              } catch (error) {
                console.error(
                  `Failed to fetch organization ${orgRule.organizationId}:`,
                  error
                );
                return {
                  ...orgRule,
                  organizationName: orgRule.organizationId,
                };
              }
            })
          );

          setOrgTxnRoutingRules(orgRulesWithNames);
        })
        .catch((error) => {
          console.error("Failed to fetch org txn routing rules:", error);
          setIsError(true);
          setOrgTxnRoutingRules([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setOrgTxnRoutingRules([]);
    }
  }, [selectedRule, accessToken, mounted]);

  // 當規則改變時，清空選擇
  useEffect(() => {
    if (mounted) {
      setSelectedOrgRuleIds([]);
    }
  }, [selectedRule, mounted]);

  const handleSelectOrgRule = (orgRuleId: string) => {
    setSelectedOrgRuleIds((prev) =>
      prev.includes(orgRuleId)
        ? prev.filter((id) => id !== orgRuleId)
        : [...prev, orgRuleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrgRuleIds.length === orgTxnRoutingRules.length) {
      setSelectedOrgRuleIds([]);
    } else {
      setSelectedOrgRuleIds(orgTxnRoutingRules.map((rule) => rule.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedOrgRuleIds.length > 0) {
      onRemoveOrganizations(selectedOrgRuleIds);
      setSelectedOrgRuleIds([]);
    }
  };

  const handleRowClick = (orgRuleId: string) => {
    handleSelectOrgRule(orgRuleId);
  };

  const handleToggleOrgRuleEnable = (
    orgRule: OrgTxnRoutingRuleWithName,
    enabled: boolean
  ) => {
    setPendingToggleOrgRule({ orgRule, enabled });
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingToggleOrgRule) {
      const { orgRule, enabled } = pendingToggleOrgRule;

      // 樂觀更新：立即更新本地狀態
      setOrgTxnRoutingRules((prev) =>
        prev.map((rule) =>
          rule.id === orgRule.id ? { ...rule, enable: enabled } : rule
        )
      );

      try {
        await onToggleOrgRuleEnable(orgRule, enabled);
      } catch (error) {
        // 如果 API 調用失敗，回滾到原始狀態
        setOrgTxnRoutingRules((prev) =>
          prev.map((rule) =>
            rule.id === orgRule.id ? { ...rule, enable: !enabled } : rule
          )
        );
      }

      setConfirmDialogOpen(false);
      setPendingToggleOrgRule(null);
    }
  };

  if (!mounted) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>規則詳情與組織綁定</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedRule) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>規則詳情與組織綁定</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">請選擇一個規則</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>規則詳情與組織綁定</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-6">
          {/* 上半部：規則詳細資訊 */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">{selectedRule.title}</h3>
            {selectedRule.description && (
              <p className="text-sm text-gray-600 mb-4">
                {selectedRule.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">支付方式:</span>
                <span className="ml-2">
                  {PaymentMethodDisplayNames[selectedRule.paymentMethod]}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">交易類型:</span>
                <span className="ml-2">
                  {TransactionTypeDisplayNames[selectedRule.transactionType]}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">金額範圍:</span>
                <span className="ml-2">
                  {selectedRule.minValue !== null &&
                  selectedRule.maxValue !== null &&
                  selectedRule.minValue !== undefined &&
                  selectedRule.maxValue !== undefined
                    ? `${selectedRule.minValue} - ${selectedRule.maxValue}`
                    : selectedRule.minValue === null &&
                      selectedRule.maxValue === null
                    ? "沒有設置"
                    : "無限制"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">帳戶類型:</span>
                <span className="ml-2">
                  {selectedRule.accountType
                    ? selectedRule.transactionType ===
                      TransactionType.API_DEPOSIT
                      ? DepositAccountTypeDisplayNames[
                          selectedRule.accountType as keyof typeof DepositAccountTypeDisplayNames
                        ] || selectedRule.accountType
                      : WithdrawalAccountTypeDisplayNames[
                          selectedRule.accountType as keyof typeof WithdrawalAccountTypeDisplayNames
                        ] || selectedRule.accountType
                    : "全部"}
                </span>
              </div>
            </div>

            {/* 路由規則 */}
            <div className="mt-4">
              <span className="font-medium text-gray-700 text-sm">
                路由規則:
              </span>
              <div className="mt-2 space-y-3">
                {selectedRule.routingRule.map((routingRule, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-sm">
                        優先級{" "}
                        {routingRule.priority !== undefined
                          ? routingRule.priority
                          : "未設定"}
                      </span>
                    </div>
                    {Object.entries(routingRule.percentage).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-medium text-gray-700">
                                支付渠道
                              </th>
                              <th className="text-right py-2 px-3 font-medium text-gray-700">
                                百分比
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(routingRule.percentage).map(
                              ([channel, percentage]) => (
                                <tr
                                  key={channel}
                                  className="border-b border-gray-100 hover:bg-gray-100/50"
                                >
                                  <td className="py-2 px-3">
                                    {PaymentChannelDisplayNames[
                                      channel as keyof typeof PaymentChannelDisplayNames
                                    ] || channel}
                                  </td>
                                  <td className="py-2 px-3 text-right font-medium">
                                    {percentage}%
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm py-2">
                        暫無支付渠道配置
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 下半部：組織綁定功能 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium">組織綁定</h4>
              <div className="flex gap-2">
                {orgTxnRoutingRules.length > 0 && (
                  <Button onClick={handleSelectAll} variant="outline" size="sm">
                    {selectedOrgRuleIds.length === orgTxnRoutingRules.length
                      ? "取消全選"
                      : "全選"}
                  </Button>
                )}
                {selectedOrgRuleIds.length > 0 && (
                  <Button
                    onClick={() => {
                      setPendingDeleteOrgIds(selectedOrgRuleIds);
                      setDeleteDialogOpen(true);
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    刪除選中 ({selectedOrgRuleIds.length})
                  </Button>
                )}
                <Button
                  onClick={() => onAddOrganizations(selectedRule.id)}
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  新增綁定
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">載入中...</div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-red-500">載入失敗</div>
              </div>
            ) : (
              <div className="space-y-2">
                {orgTxnRoutingRules.map((orgRule) => (
                  <div
                    key={orgRule.id}
                    className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedOrgRuleIds.includes(orgRule.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleRowClick(orgRule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">
                            {orgRule.organizationName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={orgRule.enable}
                              onCheckedChange={(enabled) =>
                                handleToggleOrgRuleEnable(orgRule, enabled)
                              }
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span>組織 ID: {orgRule.organizationId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedOrgRuleIds.includes(orgRule.id)}
                          onCheckedChange={() =>
                            handleSelectOrgRule(orgRule.id)
                          }
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {orgTxnRoutingRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    此規則尚未綁定任何組織
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <OrgEnableToggleConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmToggle}
        organizationName={pendingToggleOrgRule?.orgRule.organizationName || ""}
        ruleTitle={selectedRule?.title || ""}
        enabled={pendingToggleOrgRule?.enabled || false}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (pendingDeleteOrgIds.length > 0) {
            onRemoveOrganizations(pendingDeleteOrgIds);
            setDeleteDialogOpen(false);
            setPendingDeleteOrgIds([]);
            setSelectedOrgRuleIds([]);
          }
        }}
        title="確認刪除組織綁定"
        description={`確定要刪除選中的 ${pendingDeleteOrgIds.length} 個組織綁定嗎？此操作不可逆。`}
        confirmText="刪除"
        cancelText="取消"
      />
    </Card>
  );
};
