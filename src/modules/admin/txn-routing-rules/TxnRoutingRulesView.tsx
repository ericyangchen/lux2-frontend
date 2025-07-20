import { useState, useEffect } from "react";
import {
  TxnRoutingRule,
  OrgTxnRoutingRule,
  CreateTxnRoutingRuleRequest,
  CreateOrgTxnRoutingRuleRequest,
} from "@/lib/types/txn-routing-rule";
import { TxnRoutingRuleList } from "./TxnRoutingRuleList";
import { OrganizationBinding } from "./OrganizationBinding";
import { CreateTxnRoutingRuleDialog } from "./CreateTxnRoutingRuleDialog";
import { OrganizationBindingDialog } from "./OrganizationBindingDialog";
import { useToast } from "@/components/shadcn/ui/use-toast";
import { getApplicationCookies } from "@/lib/utils/cookie";
import { createTxnRoutingRule } from "@/lib/apis/admin/txn-routing-rules/post";
import { updateTxnRoutingRule } from "@/lib/apis/admin/txn-routing-rules/put";
import { deleteTxnRoutingRule } from "@/lib/apis/admin/txn-routing-rules/delete";
import { createOrgTxnRoutingRule } from "@/lib/apis/admin/txn-routing-rules/org/post";
import { updateOrgTxnRoutingRule } from "@/lib/apis/admin/txn-routing-rules/org/put";
import { deleteOrgTxnRoutingRules } from "@/lib/apis/admin/txn-routing-rules/org/delete";
import { getOrgTxnRoutingRulesByTxnRoutingRuleId } from "@/lib/apis/admin/txn-routing-rules/org/get";
import { useTxnRoutingRules } from "@/lib/hooks/swr/txnRoutingRule";

export const TxnRoutingRulesView = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TxnRoutingRule>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();
  const { txnRoutingRules, mutate: mutateTxnRoutingRules } =
    useTxnRoutingRules();

  // 防止 hydration 錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  // 自動選擇第一個規則
  useEffect(() => {
    if (
      mounted &&
      txnRoutingRules &&
      txnRoutingRules.length > 0 &&
      !selectedRule
    ) {
      setSelectedRule(txnRoutingRules[0]);
    } else if (mounted && txnRoutingRules && txnRoutingRules.length === 0) {
      // 如果沒有規則，清空選擇
      setSelectedRule(undefined);
    }
  }, [txnRoutingRules, selectedRule, mounted]);

  const handleCreateRule = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateRuleSubmit = async (data: CreateTxnRoutingRuleRequest) => {
    if (!accessToken) return;

    try {
      await createTxnRoutingRule({ accessToken, data });
      await mutateTxnRoutingRules();
      toast({
        title: "創建成功",
        description: "規則已成功創建",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知錯誤";

      // 檢查是否為支付渠道驗證錯誤
      if (
        errorMessage.includes("payment channels") ||
        errorMessage.includes("PaymentChannel")
      ) {
        toast({
          title: "創建失敗",
          description: "支付渠道與帳戶類型不匹配，請檢查設置",
          variant: "destructive",
        });
      } else {
        toast({
          title: "創建失敗",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleDeleteRule = async (rule: TxnRoutingRule) => {
    if (!accessToken) return;

    try {
      // 先獲取該規則的所有組織綁定
      const orgRules = await getOrgTxnRoutingRulesByTxnRoutingRuleId({
        accessToken,
        txnRoutingRuleId: rule.id,
      });

      // 如果有組織綁定，先刪除它們
      if (orgRules.length > 0) {
        const orgRuleIds = orgRules.map(
          (orgRule: OrgTxnRoutingRule) => orgRule.id
        );
        await deleteOrgTxnRoutingRules({
          accessToken,
          data: { ids: orgRuleIds },
        });
      }

      // 然後刪除規則本身
      await deleteTxnRoutingRule({ accessToken, id: rule.id });
      await mutateTxnRoutingRules();

      // 如果刪除的是當前選中的規則，自動選擇下一個規則
      if (selectedRule?.id === rule.id) {
        // 等待 mutate 完成後，useEffect 會自動選擇第一個可用的規則
        setSelectedRule(undefined);
      }

      toast({
        title: "刪除成功",
        description: `優先級規則已刪除${
          orgRules.length > 0
            ? `，並同步刪除了 ${orgRules.length} 個組織綁定`
            : ""
        }`,
      });
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    }
  };

  const handleToggleRuleEnable = async (
    rule: TxnRoutingRule,
    enabled: boolean
  ) => {
    if (!accessToken) return;

    try {
      await updateTxnRoutingRule({
        accessToken,
        id: rule.id,
        data: { enable: enabled },
      });
      await mutateTxnRoutingRules();
      toast({
        title: "更新成功",
        description: `規則已${enabled ? "啟用" : "停用"}`,
      });
    } catch (error) {
      toast({
        title: "更新失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    }
  };

  const handleAddOrganizations = (ruleId: string) => {
    if (!selectedRule) {
      toast({
        title: "請選擇規則",
        description: "請先選擇一個優先級規則",
        variant: "destructive",
      });
      return;
    }
    setBindingDialogOpen(true);
  };

  const handleCreateOrgBinding = async (
    data: CreateOrgTxnRoutingRuleRequest
  ) => {
    if (!accessToken) return;

    try {
      await createOrgTxnRoutingRule({ accessToken, data });
      await mutateTxnRoutingRules();
      // 觸發重新渲染，讓 OrganizationBinding 組件重新獲取綁定列表
      setSelectedRule((prev) => (prev ? { ...prev } : undefined));
      toast({
        title: "綁定成功",
        description: `已成功綁定 ${data.organizationIds.length} 個組織`,
      });
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
      throw error;
    }
  };

  const handleRemoveOrganizations = async (orgRuleIds: string[]) => {
    if (!accessToken) return;

    try {
      await deleteOrgTxnRoutingRules({
        accessToken,
        data: { ids: orgRuleIds },
      });
      await mutateTxnRoutingRules();
      // 觸發重新渲染，讓 OrganizationBinding 組件重新獲取綁定列表
      setSelectedRule((prev) => (prev ? { ...prev } : undefined));
      toast({
        title: "刪除成功",
        description: "組織綁定已刪除",
      });
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    }
  };

  const handleToggleOrgRuleEnable = async (
    orgRule: OrgTxnRoutingRule,
    enabled: boolean
  ) => {
    if (!accessToken) return;

    try {
      await updateOrgTxnRoutingRule({
        accessToken,
        id: orgRule.id,
        data: { enable: enabled },
      });
      toast({
        title: "更新成功",
        description: `組織綁定已${enabled ? "啟用" : "停用"}`,
      });
    } catch (error) {
      toast({
        title: "更新失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <TxnRoutingRuleList
        selectedRule={selectedRule}
        onSelectRule={setSelectedRule}
        onCreateRule={handleCreateRule}
        onDeleteRule={handleDeleteRule}
        onToggleRuleEnable={handleToggleRuleEnable}
      />
      <OrganizationBinding
        selectedRule={selectedRule}
        onAddOrganizations={handleAddOrganizations}
        onRemoveOrganizations={handleRemoveOrganizations}
        onToggleOrgRuleEnable={handleToggleOrgRuleEnable}
      />
      <CreateTxnRoutingRuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateRuleSubmit}
      />
      {selectedRule && (
        <OrganizationBindingDialog
          open={bindingDialogOpen}
          onOpenChange={setBindingDialogOpen}
          selectedRule={selectedRule}
          onSubmit={handleCreateOrgBinding}
        />
      )}
    </div>
  );
};
