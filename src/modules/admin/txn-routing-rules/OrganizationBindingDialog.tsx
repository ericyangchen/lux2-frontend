import { useState, useEffect } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import { Label } from "@/components/shadcn/ui/label";
import { Badge } from "@/components/shadcn/ui/badge";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Input } from "@/components/shadcn/ui/input";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Organization } from "@/lib/types/organization";
import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";
import { CreateOrgTxnRoutingRuleRequest } from "@/lib/types/txn-routing-rule";
import { useOrganizationWithChildren } from "@/lib/hooks/swr/organization";
import { getOrganizationsByTxnRoutingRuleId } from "@/lib/apis/admin/txn-routing-rules/org/get";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { flattenOrganizations } from "@/modules/admin/common/flattenOrganizations";
import { PaymentMethodDisplayNames } from "@/lib/constants/transaction";
import { TransactionTypeDisplayNames } from "@/lib/constants/transaction";
import { PaymentChannelDisplayNames } from "@/lib/constants/transaction";

interface OrganizationBindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRule: TxnRoutingRule;
  onSubmit: (data: CreateOrgTxnRoutingRuleRequest) => Promise<void>;
}

export const OrganizationBindingDialog = ({
  open,
  onOpenChange,
  selectedRule,
  onSubmit,
}: OrganizationBindingDialogProps) => {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();
  const { organizationId } = getApplicationCookies();
  const { organization } = useOrganizationWithChildren({ organizationId });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );
  const [existingOrganizations, setExistingOrganizations] = useState<
    Organization[]
  >([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 獲取所有可用的組織
  const allOrganizations = organization
    ? flattenOrganizations(organization)
    : [];

  // 獲取已綁定的組織
  useEffect(() => {
    if (mounted && open && selectedRule && accessToken) {
      setIsLoadingExisting(true);
      getOrganizationsByTxnRoutingRuleId({
        accessToken,
        txnRoutingRuleId: selectedRule.id,
      })
        .then((orgs) => {
          setExistingOrganizations(orgs);
        })
        .catch((error) => {
          console.error("Failed to fetch existing organizations:", error);
          setExistingOrganizations([]);
        })
        .finally(() => {
          setIsLoadingExisting(false);
        });
    }
  }, [open, selectedRule, accessToken, mounted]);

  // 過濾組織（排除已綁定的組織）
  const availableOrganizations = allOrganizations.filter(
    (org) => !existingOrganizations.some((existing) => existing.id === org.id)
  );

  // 根據搜索查詢過濾組織
  const filteredOrganizations = availableOrganizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrganizationToggle = (orgId: string) => {
    setSelectedOrganizations((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrganizations.length === filteredOrganizations.length) {
      setSelectedOrganizations([]);
    } else {
      setSelectedOrganizations(filteredOrganizations.map((org) => org.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedOrganizations.length === 0) {
      toast({
        title: "請選擇組織",
        description: "請至少選擇一個組織進行綁定",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        organizationIds: selectedOrganizations,
        txnRoutingRuleId: selectedRule.id,
      });
      toast({
        title: "綁定成功",
        description: "組織已成功綁定到規則",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "綁定失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedOrganizations([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>綁定組織到規則</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 規則詳情 */}
          <div className="space-y-4">
            <Label>規則詳情</Label>
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{selectedRule.title}</h3>
                <Badge variant={selectedRule.enable ? "default" : "secondary"}>
                  {selectedRule.enable ? "啟用" : "停用"}
                </Badge>
              </div>
              {selectedRule.description && (
                <p className="text-sm text-gray-600">
                  {selectedRule.description}
                </p>
              )}
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span>
                    支付方式:{" "}
                    {PaymentMethodDisplayNames[selectedRule.paymentMethod]}
                  </span>
                  <span>
                    交易類型:{" "}
                    {TransactionTypeDisplayNames[selectedRule.transactionType]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    金額範圍:{" "}
                    {selectedRule.minValue !== undefined &&
                    selectedRule.maxValue !== undefined
                      ? `${selectedRule.minValue} - ${selectedRule.maxValue}`
                      : selectedRule.minValue === undefined &&
                        selectedRule.maxValue === undefined
                      ? "沒有設置"
                      : "無限制"}
                  </span>
                  {selectedRule.accountType && (
                    <span>帳戶類型: {selectedRule.accountType}</span>
                  )}
                </div>
                {/* 顯示所有路由規則 */}
                <div className="mt-2 space-y-1">
                  <span className="font-medium">路由規則:</span>
                  {selectedRule.routingRule.map((routingRule, index) => (
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
          </div>

          {/* 已綁定的組織 */}
          {existingOrganizations.length > 0 && (
            <div className="space-y-2">
              <Label>已綁定的組織 ({existingOrganizations.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {existingOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded"
                  >
                    <Badge variant="secondary" className="text-xs">
                      已綁定
                    </Badge>
                    <span className="text-sm">{org.name}</span>
                    <span className="text-xs text-gray-500">({org.id})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 搜索框 */}
          <div className="space-y-2">
            <Label>選擇組織</Label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索組織名稱或 ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 全選按鈕 */}
          {filteredOrganizations.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={
                  selectedOrganizations.length === filteredOrganizations.length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label
                className="text-sm cursor-pointer"
                onClick={handleSelectAll}
              >
                全選 ({selectedOrganizations.length}/
                {filteredOrganizations.length})
              </Label>
            </div>
          )}

          {/* 組織列表 */}
          <div className="space-y-2">
            {isLoadingExisting ? (
              <div className="text-center py-8 text-gray-500">載入中...</div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "沒有找到匹配的組織" : "沒有可用的組織"}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${
                      selectedOrganizations.includes(org.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleOrganizationToggle(org.id)}
                  >
                    <Checkbox
                      checked={selectedOrganizations.includes(org.id)}
                      onCheckedChange={() => handleOrganizationToggle(org.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{org.name}</div>
                      <div className="text-xs text-gray-500">ID: {org.id}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {org.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedOrganizations.length === 0}
          >
            {isSubmitting
              ? "綁定中..."
              : `綁定 ${selectedOrganizations.length} 個組織`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
