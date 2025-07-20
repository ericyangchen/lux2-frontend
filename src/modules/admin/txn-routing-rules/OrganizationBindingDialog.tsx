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
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知錯誤";

      // 檢查是否為衝突錯誤
      if (
        errorMessage.includes("Conflict detected") ||
        errorMessage.includes("conflict")
      ) {
        toast({
          title: "綁定失敗",
          description: "檢測到規則衝突，請檢查組織的現有規則設置",
          variant: "destructive",
        });
      } else {
        toast({
          title: "綁定失敗",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedOrganizations([]);
    setExistingOrganizations([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>綁定組織到規則</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 規則信息 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">規則信息</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">標題：</span>
                {selectedRule.title}
              </div>
              <div>
                <span className="font-medium">描述：</span>
                {selectedRule.description || "無"}
              </div>
              <div>
                <span className="font-medium">金額範圍：</span>
                {selectedRule.minValue !== undefined
                  ? selectedRule.minValue
                  : "0"}{" "}
                -
                {selectedRule.maxValue !== undefined
                  ? selectedRule.maxValue
                  : "無限制"}
              </div>
              <div>
                <span className="font-medium">帳戶類型：</span>
                {selectedRule.accountType || "無"}
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
