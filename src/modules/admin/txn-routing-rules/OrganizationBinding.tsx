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
      <Card>
        <CardHeader>
          <CardTitle>組織綁定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">載入中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedRule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>組織綁定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">請選擇一個規則</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>組織綁定</CardTitle>
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
          <CardTitle>組織綁定</CardTitle>
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
        <CardTitle>組織綁定</CardTitle>
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
              onClick={handleRemoveSelected}
              variant="destructive"
              size="sm"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              刪除選中 ({selectedOrgRuleIds.length})
            </Button>
          )}
          <Button onClick={() => onAddOrganizations(selectedRule.id)} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            新增綁定
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                      <span className="text-xs text-gray-500">
                        {orgRule.enable ? "啟用" : "停用"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>組織 ID: {orgRule.organizationId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedOrgRuleIds.includes(orgRule.id)}
                    onCheckedChange={() => handleSelectOrgRule(orgRule.id)}
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
      </CardContent>
      <OrgEnableToggleConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmToggle}
        organizationName={pendingToggleOrgRule?.orgRule.organizationName || ""}
        ruleTitle={selectedRule?.title || ""}
        enabled={pendingToggleOrgRule?.enabled || false}
      />
    </Card>
  );
};
