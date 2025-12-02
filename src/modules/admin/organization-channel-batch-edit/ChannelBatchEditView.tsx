import { useState, useMemo, useEffect, useCallback } from "react";

import { useRouter } from "next/router";

import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import {
  ApiGetBatchEditData,
  ApiCheckWarnings,
  ApiBatchUpdateChannels,
  OrganizationChannelStatus,
} from "@/lib/apis/organization-available-channels/batch-edit";

import {
  PaymentChannelDisplayNames,
  PaymentMethodDisplayNames,
  TransactionTypeDisplayNames,
  DepositPaymentChannelCategories,
  WithdrawalPaymentChannelCategories,
} from "@/lib/constants/transaction";

import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";

import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";

import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";

import { formatNumber, formatNumberInPercentage } from "@/lib/utils/number";

import { getApplicationCookies } from "@/lib/utils/cookie";

import { ApplicationError } from "@/lib/error/applicationError";

import { toast } from "@/components/shadcn/ui/use-toast";

import { Button } from "@/components/shadcn/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

import { Label } from "@/components/shadcn/ui/label";

import { OrganizationChannelRow } from "./OrganizationChannelRow";

export default function ChannelBatchEditView() {
  const router = useRouter();
  const { accessToken } = getApplicationCookies();

  const [transactionType, setTransactionType] = useState<TransactionType | "">(
    (router.query.transactionType as TransactionType) || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    (router.query.paymentMethod as PaymentMethod) || ""
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel | "">(
    (router.query.paymentChannel as PaymentChannel) || ""
  );

  const [orgData, setOrgData] = useState<OrganizationChannelStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [warnings, setWarnings] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<
    Map<string, "enable" | "disable">
  >(new Map());
  const [expandedOrganizations, setExpandedOrganizations] = useState<
    Set<string>
  >(new Set());
  // Track original states to reset children when needed
  const [originalStates] = useState<Map<string, "enable" | "disable" | null>>(
    new Map()
  );

  const getDescendants = useCallback(
    (parentId: string): string[] => {
      const result: string[] = [];
      const traverse = (currentId: string) => {
        const children = orgData.filter((o) => o.parentId === currentId);
        for (const child of children) {
          result.push(child.organizationId);
          traverse(child.organizationId);
        }
      };
      traverse(parentId);
      return result;
    },
    [orgData]
  );

  const paymentChannelCategories = useMemo<
    Partial<Record<PaymentMethod, PaymentChannel[]>>
  >(() => {
    if (!transactionType) return {};

    return transactionType === TransactionType.API_DEPOSIT
      ? DepositPaymentChannelCategories
      : WithdrawalPaymentChannelCategories;
  }, [transactionType]);

  const availableChannels = useMemo(() => {
    if (!paymentMethod) {
      return [];
    }
    const channels = paymentChannelCategories[paymentMethod as PaymentMethod];
    return channels || [];
  }, [paymentMethod, paymentChannelCategories]);

  const loadData = useCallback(async () => {
    if (!transactionType || !paymentMethod || !paymentChannel || !accessToken) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiGetBatchEditData({
        transactionType: transactionType as TransactionType,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentChannel: paymentChannel as PaymentChannel,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const data: OrganizationChannelStatus[] = await response.json();
      setOrgData(data);
      setPendingUpdates(new Map());
      setWarnings(new Set());
      // Store original states
      data.forEach((org) => {
        if (org.channelStatus === "enabled") {
          originalStates.set(org.organizationId, "enable");
        } else if (org.channelStatus === "disabled") {
          originalStates.set(org.organizationId, "disable");
        } else {
          originalStates.set(org.organizationId, null);
        }
      });
      // Expand all organizations initially
      const allOrgIds = new Set(data.map((org) => org.organizationId));
      setExpandedOrganizations(allOrgIds);
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: "載入失敗",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    accessToken,
    originalStates,
    paymentChannel,
    paymentMethod,
    transactionType,
  ]);

  useEffect(() => {
    if (transactionType && paymentMethod && paymentChannel) {
      loadData();
    }
  }, [loadData, paymentChannel, paymentMethod, transactionType]);

  const handleToggleChange = (orgId: string, enabled: boolean) => {
    const newUpdates = new Map(pendingUpdates);
    const action = enabled ? "enable" : "disable";
    const originalAction = originalStates.get(orgId);

    // If returning to original state, remove from pending updates
    if (action === originalAction) {
      newUpdates.delete(orgId);
    } else {
      newUpdates.set(orgId, action);
    }

    setPendingUpdates(newUpdates);
  };

  const handleEnableAllChildren = (orgId: string) => {
    const newUpdates = new Map(pendingUpdates);

    // Enable this org
    newUpdates.set(orgId, "enable");

    // Enable all descendants
    const descendants = getDescendants(orgId);
    for (const childId of descendants) {
      const orgItem = orgData.find((o) => o.organizationId === childId);
      if (orgItem && orgItem.channelStatus !== "not_created") {
        newUpdates.set(childId, "enable");
      }
    }

    setPendingUpdates(newUpdates);
  };

  const handleDisableAllChildren = (orgId: string) => {
    const newUpdates = new Map(pendingUpdates);

    // Disable this org
    newUpdates.set(orgId, "disable");

    // Disable all descendants
    const descendants = getDescendants(orgId);
    for (const childId of descendants) {
      const orgItem = orgData.find((o) => o.organizationId === childId);
      if (orgItem && orgItem.channelStatus !== "not_created") {
        newUpdates.set(childId, "disable");
      }
    }

    setPendingUpdates(newUpdates);
  };

  const handleToggleExpand = useCallback(
    (orgId: string) => {
      setExpandedOrganizations((prev) => {
        const next = new Set(prev);
        if (next.has(orgId)) {
          next.delete(orgId);
          const descendants = getDescendants(orgId);
          descendants.forEach((descId) => next.delete(descId));
        } else {
          next.add(orgId);
        }
        return next;
      });
    },
    [getDescendants]
  );

  const visibleOrgs = useMemo(() => {
    const orgMap = new Map(orgData.map((org) => [org.organizationId, org]));

    const result = orgData.filter((org) => {
      if (!org.parentId) {
        return true;
      }

      const parentIsExpanded = (parentId: string): boolean => {
        if (!expandedOrganizations.has(parentId)) {
          return false;
        }
        const parent = orgMap.get(parentId);
        if (parent?.parentId) {
          return parentIsExpanded(parent.parentId);
        }
        return true;
      };

      return parentIsExpanded(org.parentId);
    });

    return result;
  }, [expandedOrganizations, orgData]);

  const checkWarnings = useCallback(async () => {
    if (!transactionType || !paymentMethod || !paymentChannel || !accessToken) {
      return;
    }

    const updates = Array.from(pendingUpdates.entries()).map(
      ([orgId, action]) => ({
        organizationId: orgId,
        action,
      })
    );

    if (updates.length === 0) {
      setWarnings(new Set());
      return;
    }

    try {
      const response = await ApiCheckWarnings({
        transactionType: transactionType as TransactionType,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentChannel: paymentChannel as PaymentChannel,
        updates,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      const { warnings: warningOrgs } = await response.json();
      setWarnings(new Set(warningOrgs));
    } catch (error) {
      console.error("Failed to check warnings:", error);
    }
  }, [
    accessToken,
    paymentChannel,
    paymentMethod,
    pendingUpdates,
    transactionType,
  ]);

  useEffect(() => {
    checkWarnings();
  }, [checkWarnings]);

  const resetChanges = () => {
    setPendingUpdates(new Map());
    setWarnings(new Set());
  };

  const expandAllOrgs = () => {
    setExpandedOrganizations(new Set(orgData.map((org) => org.organizationId)));
  };

  const collapseAllOrgs = () => {
    setExpandedOrganizations(new Set());
  };

  const handleBatchUpdate = async () => {
    if (!transactionType || !paymentMethod || !paymentChannel || !accessToken) {
      return;
    }

    const updates = Array.from(pendingUpdates.entries()).map(
      ([orgId, action]) => ({
        organizationId: orgId,
        action,
      })
    );

    if (updates.length === 0) {
      toast({
        title: "沒有變更",
        description: "請先選擇要更新的組織",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiBatchUpdateChannels({
        transactionType: transactionType as TransactionType,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentChannel: paymentChannel as PaymentChannel,
        updates,
        accessToken,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApplicationError(errorData);
      }

      toast({
        title: "更新成功",
        variant: "success",
      });

      // Reload data
      await loadData();
    } catch (error) {
      if (error instanceof ApplicationError) {
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>交易類型</Label>
            <Select
              value={transactionType}
              onValueChange={(value) => {
                setTransactionType(value as TransactionType);
                setPaymentMethod("");
                setPaymentChannel("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇交易類型" />
              </SelectTrigger>
              <SelectContent>
                {[
                  TransactionType.API_DEPOSIT,
                  TransactionType.API_WITHDRAWAL,
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {TransactionTypeDisplayNames[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>支付方式</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => {
                setPaymentMethod(value as PaymentMethod);
                setPaymentChannel("");
              }}
              disabled={!transactionType}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇支付方式" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PaymentMethodDisplayNames[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>支付渠道</Label>
            <Select
              value={paymentChannel}
              onValueChange={(value) =>
                setPaymentChannel(value as PaymentChannel)
              }
              disabled={!paymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇支付渠道" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {PaymentChannelDisplayNames[channel] || channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {transactionType && paymentMethod && paymentChannel && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {TransactionTypeDisplayNames[transactionType]} -{" "}
                  {PaymentMethodDisplayNames[paymentMethod]} -{" "}
                  {PaymentChannelDisplayNames[paymentChannel]}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={resetChanges}
                  disabled={pendingUpdates.size === 0}
                >
                  還原變更
                </Button>
                <Button
                  onClick={handleBatchUpdate}
                  disabled={isLoading || pendingUpdates.size === 0}
                >
                  批量更新
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Button
                variant="outline"
                onClick={expandAllOrgs}
                disabled={orgData.length === 0}
              >
                展開全部
              </Button>
              <Button
                variant="outline"
                onClick={collapseAllOrgs}
                disabled={orgData.length === 0}
              >
                收合全部
              </Button>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-500">載入中...</div>
            ) : (
              <div className="p-4 space-y-2">
                {visibleOrgs.map((org) => {
                  const pendingAction = pendingUpdates.get(org.organizationId);
                  const originalEnabled = org.channelStatus === "enabled";
                  const originalAction = originalStates.get(org.organizationId);
                  const isEnabled = pendingAction
                    ? pendingAction === "enable"
                    : originalEnabled;
                  const isModified =
                    pendingAction !== undefined &&
                    pendingAction !== originalAction;

                  const hasChildren = orgData.some(
                    (o) => o.parentId === org.organizationId
                  );
                  const isExpanded = expandedOrganizations.has(
                    org.organizationId
                  );

                  return (
                    <OrganizationChannelRow
                      key={org.organizationId}
                      org={org}
                      isEnabled={isEnabled}
                      isModified={isModified}
                      hasWarning={warnings.has(org.organizationId)}
                      hasChildren={hasChildren}
                      isExpanded={isExpanded}
                      onToggleExpand={() =>
                        handleToggleExpand(org.organizationId)
                      }
                      onToggleChange={(enabled) =>
                        handleToggleChange(org.organizationId, enabled)
                      }
                      onEnableAllChildren={() =>
                        handleEnableAllChildren(org.organizationId)
                      }
                      onDisableAllChildren={() =>
                        handleDisableAllChildren(org.organizationId)
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

