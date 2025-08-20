import {
  ApiGetMerchantRequestedWithdrawals,
  ApiGetMerchantRequestedWithdrawalsSummary,
} from "@/lib/apis/txn-merchant-requested-withdrawals/get";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { MerchantRequestedWithdrawalCreate } from "./MerchantRequestedWithdrawalCreate";
import { MerchantRequestedWithdrawalList } from "./MerchantRequestedWithdrawalList";
import { TransactionStatusDisplayNames } from "@/lib/constants/transaction";
import { cn } from "@/lib/utils/classname-utils";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { formatNumber } from "@/lib/utils/number";
import { getApplicationCookies } from "@/lib/utils/cookie";
import moment from "moment-timezone";
import { useToast } from "@/components/shadcn/ui/use-toast";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "default",
  trend,
}: StatsCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "border-emerald-200 bg-emerald-50";
      case "warning":
        return "border-amber-200 bg-amber-50";
      case "danger":
        return "border-red-200 bg-red-50";
      default:
        return "border-slate-200 bg-white";
    }
  };

  const getIconColor = () => {
    switch (color) {
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-amber-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        getColorClasses()
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg bg-white", getIconColor())}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {title}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              {subtitle && (
                <div className="text-sm text-slate-500">{subtitle}</div>
              )}
              {trend && (
                <div
                  className={cn(
                    "text-sm flex items-center gap-1",
                    trend.type === "up"
                      ? "text-emerald-600"
                      : trend.type === "down"
                      ? "text-red-600"
                      : "text-slate-500"
                  )}
                >
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  action,
  variant = "default",
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  variant?: "default" | "primary";
}) => (
  <Card
    className={cn(
      "group cursor-pointer transition-all duration-200 hover:shadow-md border-slate-200",
      variant === "primary" && "border-slate-900 bg-slate-50"
    )}
    onClick={action}
  >
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-lg transition-colors",
            variant === "primary"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 mb-3">{description}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">
            <span>開始</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProcessSteps = () => {
  const steps = [
    {
      number: 1,
      title: "填寫申請",
      description: "輸入提領金額和收款資訊",
      icon: CurrencyDollarIcon,
    },
    {
      number: 2,
      title: "系統審核",
      description: "客服手動審核資料",
      icon: CheckCircleIcon,
    },
    {
      number: 3,
      title: "處理中",
      description: "正在進行資金轉移",
      icon: ClockIcon,
    },
    {
      number: 4,
      title: "完成",
      description: "資金已成功轉移",
      icon: BanknotesIcon,
    },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          申請流程
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
                  <step.icon className="h-6 w-6 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900">{step.title}</h4>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full">
                  <div className="w-full h-px bg-slate-200 transform -translate-x-1/2"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export enum MerchantRequestedWithdrawalTab {
  OVERVIEW = "OVERVIEW",
  LIST = "LIST",
  CREATE = "CREATE",
}

export function MerchantRequestedWithdrawalView() {
  const [activeTab, setActiveTab] = useState<MerchantRequestedWithdrawalTab>(
    MerchantRequestedWithdrawalTab.OVERVIEW
  );

  // Real data state
  const [summaryData, setSummaryData] = useState<any>(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { organizationId, accessToken } = getApplicationCookies();

  // Fetch summary data for today
  const fetchSummaryData = async () => {
    if (!organizationId || !accessToken) return;

    try {
      setIsLoading(true);

      // Get current day date range (today only)
      const startOfDay = moment().startOf("day").toISOString();
      const endOfDay = moment().endOf("day").toISOString();

      const response = await ApiGetMerchantRequestedWithdrawalsSummary({
        merchantId: organizationId,
        createdAtStart: startOfDay,
        createdAtEnd: endOfDay,
        accessToken,
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch summary data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent withdrawals
  const fetchRecentWithdrawals = async () => {
    if (!organizationId || !accessToken) return;

    try {
      const response = await ApiGetMerchantRequestedWithdrawals({
        merchantId: organizationId,
        limit: 5, // Get last 5 for recent activity
        accessToken,
      });

      if (response.ok) {
        const data = await response.json();
        setRecentWithdrawals(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent withdrawals:", error);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    fetchRecentWithdrawals();
  }, [organizationId, accessToken]);

  // Refresh data when returning to overview tab
  useEffect(() => {
    if (activeTab === MerchantRequestedWithdrawalTab.OVERVIEW) {
      fetchSummaryData();
      fetchRecentWithdrawals();
    }
  }, [activeTab]);

  const handleCreateNew = () => {
    setActiveTab(MerchantRequestedWithdrawalTab.CREATE);
  };

  const handleViewList = () => {
    setActiveTab(MerchantRequestedWithdrawalTab.LIST);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as MerchantRequestedWithdrawalTab)
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value={MerchantRequestedWithdrawalTab.OVERVIEW}
            className="flex items-center gap-2"
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            總覽
          </TabsTrigger>
          <TabsTrigger
            value={MerchantRequestedWithdrawalTab.LIST}
            className="flex items-center gap-2"
          >
            <ListBulletIcon className="h-4 w-4" />
            申請記錄
          </TabsTrigger>
          <TabsTrigger
            value={MerchantRequestedWithdrawalTab.CREATE}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            建立申請
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value={MerchantRequestedWithdrawalTab.OVERVIEW}
          className="space-y-6"
        >
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-6 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatsCard
                  title="本日申請"
                  value={summaryData?.count || "0"}
                  subtitle="今日申請次數"
                  icon={CurrencyDollarIcon}
                />
                <StatsCard
                  title="總金額"
                  value={
                    summaryData?.amountSum
                      ? `$${formatNumber(summaryData.amountSum)}`
                      : "$0"
                  }
                  subtitle="今日申請總額"
                  icon={BanknotesIcon}
                />
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionCard
              title="建立新申請"
              description="快速建立新的提領申請，填寫必要資訊即可送出"
              icon={PlusIcon}
              action={handleCreateNew}
              variant="primary"
            />
            <QuickActionCard
              title="查看申請記錄"
              description="瀏覽所有提領申請的狀態和詳細資訊"
              icon={ListBulletIcon}
              action={handleViewList}
            />
          </div>

          {/* Process Steps */}
          <ProcessSteps />

          {/* Recent Activity */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                最近活動
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWithdrawals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p>暫無申請記錄</p>
                  </div>
                ) : (
                  recentWithdrawals.map((withdrawal) => {
                    const getStatusColor = (status: string) => {
                      switch (status.toLowerCase()) {
                        case "success":
                          return "border-emerald-200 text-emerald-800";
                        case "pending":
                          return "border-amber-200 text-amber-800";
                        case "failed":
                          return "border-red-200 text-red-800";
                        default:
                          return "border-blue-200 text-blue-800";
                      }
                    };

                    const getStatusDot = (status: string) => {
                      switch (status.toLowerCase()) {
                        case "success":
                          return "bg-emerald-500";
                        case "pending":
                          return "bg-amber-500";
                        case "failed":
                          return "bg-red-500";
                        default:
                          return "bg-blue-500";
                      }
                    };

                    return (
                      <div
                        key={withdrawal.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getStatusDot(withdrawal.status)
                            )}
                          ></div>
                          <div>
                            <div className="font-medium text-slate-900">
                              申請 {withdrawal.merchantOrderId}
                            </div>
                            <div className="text-sm text-slate-600">
                              ${formatNumber(withdrawal.amount)} •{" "}
                              {convertDatabaseTimeToReadablePhilippinesTime(
                                withdrawal.createdAt
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            getStatusColor(withdrawal.status)
                          )}
                        >
                          {TransactionStatusDisplayNames[
                            withdrawal.status as keyof typeof TransactionStatusDisplayNames
                          ] || withdrawal.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleViewList}
                  className="w-full"
                >
                  查看全部記錄
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={MerchantRequestedWithdrawalTab.LIST}>
          <MerchantRequestedWithdrawalList setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value={MerchantRequestedWithdrawalTab.CREATE}>
          <MerchantRequestedWithdrawalCreate setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
