import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  TxnRoutingRule,
  OrgTxnRoutingRule,
  CreateTxnRoutingRuleRequest,
  CreateOrgTxnRoutingRuleRequest,
} from "@/lib/types/txn-routing-rule";
import { Organization } from "@/lib/types/organization";
import { TxnRoutingRuleList } from "./TxnRoutingRuleList";
import { OrganizationBinding } from "./OrganizationBinding";
import { OrganizationList } from "./OrganizationList";
import { OrganizationRoutingRules } from "./OrganizationRoutingRules";
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
import { classNames } from "@/lib/utils/classname-utils";
import { Button } from "@/components/shadcn/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";

enum Tab {
  RuleToOrganization = "RuleToOrganization",
  OrganizationToRule = "OrganizationToRule",
}

const tabDisplayNames = {
  [Tab.RuleToOrganization]: "路由對應組織",
  [Tab.OrganizationToRule]: "組織對應路由",
};

export const TxnRoutingRulesView = () => {
  const router = useRouter();
  const { query } = router;
  const [mounted, setMounted] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TxnRoutingRule>();
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const { toast } = useToast();
  const { accessToken } = getApplicationCookies();
  const { txnRoutingRules, mutate: mutateTxnRoutingRules } =
    useTxnRoutingRules();

  const [selectedTab, setSelectedTab] = useState<string>(
    (query.tab as Tab) || Tab.RuleToOrganization
  );

  const handleSelectTab = useCallback(
    (tab: string) => {
      setSelectedTab(tab);

      router.push(
        {
          query: { tab },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  useEffect(() => {
    if (query.tab && Object.values(Tab).includes(query.tab as Tab)) {
      setSelectedTab(query.tab as Tab);
    } else {
      handleSelectTab(selectedTab);
    }
  }, [handleSelectTab, query.tab, selectedTab]);

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

      // 檢查是否為上游驗證錯誤
      if (
        errorMessage.includes("payment channels") ||
        errorMessage.includes("PaymentChannel")
      ) {
        toast({
          title: "創建失敗",
          description: "上游與帳戶類型不匹配，請檢查設置",
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
        description: `路由規則已刪除${
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
        description: "請先選擇一個路由規則",
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

  // 組織對應路由模式下的處理函數
  const handleAddRuleToOrganization = (organizationId: string) => {
    // 這裡可以打開一個對話框來選擇要綁定的規則
    // 暫時顯示一個 toast 提示
    toast({
      title: "功能開發中",
      description: "添加規則到組織的功能正在開發中",
    });
  };

  const handleRemoveRulesFromOrganization = async (orgRuleIds: string[]) => {
    if (!accessToken) return;

    try {
      await deleteOrgTxnRoutingRules({
        accessToken,
        data: { ids: orgRuleIds },
      });
      // 觸發重新渲染，讓 OrganizationRoutingRules 組件重新獲取綁定列表
      setSelectedOrganization((prev) => (prev ? { ...prev } : undefined));
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

  const handleToggleRuleEnableForOrganization = async (
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
      // 觸發重新渲染，讓 OrganizationRoutingRules 組件重新獲取綁定列表
      setSelectedOrganization((prev) => (prev ? { ...prev } : undefined));
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
    <div className="p-6">
      {/* tab */}
      <div className="flex gap-4 pb-4 sm:pb-0">
        <div className="px-0 py-4 flex-1">
          <div className="sm:hidden">
            <label className="sr-only">Select a tab</label>
            <select
              id="settings-tabs"
              name="tabs"
              defaultValue={selectedTab}
              onChange={(e) => handleSelectTab(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-4 py-2"
            >
              {Object.values(Tab).map((tab) => (
                <option key={tab} value={tab}>
                  {tabDisplayNames[tab]}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4">
              {Object.values(Tab).map((tab) => (
                <button
                  key={tab}
                  className={classNames(
                    tab === selectedTab
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500 hover:text-gray-700",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                  onClick={() => handleSelectTab(tab)}
                >
                  {tabDisplayNames[tab]}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="px-0 py-4 flex items-center">
          <Button onClick={handleCreateRule} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            新增規則
          </Button>
        </div>
      </div>

      {selectedTab === Tab.RuleToOrganization && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <TxnRoutingRuleList
              selectedRule={selectedRule}
              onSelectRule={setSelectedRule}
              onDeleteRule={handleDeleteRule}
              onToggleRuleEnable={handleToggleRuleEnable}
            />
          </div>
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <OrganizationBinding
              selectedRule={selectedRule}
              onAddOrganizations={handleAddOrganizations}
              onRemoveOrganizations={handleRemoveOrganizations}
              onToggleOrgRuleEnable={handleToggleOrgRuleEnable}
            />
          </div>
        </div>
      )}

      {selectedTab === Tab.OrganizationToRule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <OrganizationList
              selectedOrganization={selectedOrganization}
              onSelectOrganization={setSelectedOrganization}
            />
          </div>
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <OrganizationRoutingRules
              selectedOrganization={selectedOrganization}
              onAddRule={handleAddRuleToOrganization}
              onRemoveRule={handleRemoveRulesFromOrganization}
              onToggleRuleEnable={handleToggleRuleEnableForOrganization}
            />
          </div>
        </div>
      )}

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
