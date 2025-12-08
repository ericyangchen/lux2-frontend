import {
  AdjustmentsHorizontalIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  HomeIcon,
  InboxArrowDownIcon,
  KeyIcon,
  ShieldExclamationIcon,
  TrashIcon,
  UserCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

import { OrgType } from "../enums/organizations/org-type.enum";

export const merchantNavigation = [
  {
    name: "主頁",
    href: "/merchant/dashboard",
    icon: HomeIcon,
  },
  {
    name: "用戶管理",
    href: "/merchant/users",
    icon: UserCircleIcon,
  },
  {
    name: "訂單管理",
    href: "/merchant/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: "下發管理",
    href: "/merchant/merchant-requested-withdrawals",
    icon: WalletIcon,
  },
  {
    name: "交易報表",
    href: "/merchant/reports/balance",
    icon: ChartBarSquareIcon,
  },
  {
    name: "餘額異動",
    href: "/merchant/balance-modification-history",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "操作紀錄",
    href: "/merchant/user-activity-logs",
    icon: ClipboardDocumentListIcon,
  },
  // {
  //   name: "歷史紀錄",
  //   href: "/merchant/history",
  //   icon: DocumentChartBarIcon,
  // },
];

export const adminNavigation = [
  {
    type: "category" as const,
    label: "一般",
  },
  {
    type: "item" as const,
    name: "系統主頁",
    href: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    type: "item" as const,
    name: "上游設定",
    href: "/admin/channel-controls",
    icon: CurrencyDollarIcon,
  },
  {
    type: "item" as const,
    name: "交易統計",
    href: "/admin/transaction-statistics",
    icon: ChartPieIcon,
  },
  {
    type: "category" as const,
    label: "商戶管理",
  },
  {
    type: "item" as const,
    name: "單位列表",
    href: "/admin/organizations",
    icon: BuildingOffice2Icon,
  },
  {
    type: "item" as const,
    name: "API Key 管理",
    href: "/admin/organization-api-key",
    icon: KeyIcon,
  },
  {
    type: "item" as const,
    name: "用戶帳號管理",
    href: "/admin/blocked-accounts",
    icon: ShieldExclamationIcon,
  },
  // {
  //   type: "item" as const,
  //   name: "單位可用渠道",
  //   href: "/admin/organization-available-channels",
  //   icon: BuildingOffice2Icon,
  // },
  {
    type: "item" as const,
    name: "批量編輯通道",
    href: "/admin/organization-channel-batch-edit",
    icon: AdjustmentsHorizontalIcon,
  },
  {
    type: "category" as const,
    label: "訂單管理",
  },
  {
    type: "item" as const,
    name: "訂單查詢",
    href: "/admin/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    type: "item" as const,
    name: "待處理交易",
    href: "/admin/problem-transactions",
    icon: ExclamationTriangleIcon,
  },
  {
    type: "item" as const,
    name: "強制修改訂單",
    href: "/admin/force-modify-transaction",
    icon: HandRaisedIcon,
  },
  {
    type: "item" as const,
    name: "批量重送回調",
    href: "/admin/batch-resend-notifications",
    icon: DocumentDuplicateIcon,
  },
  {
    type: "category" as const,
    label: "人工操作",
  },
  {
    type: "item" as const,
    name: "商戶下發請求",
    href: "/admin/merchant-requested-withdrawals",
    icon: CheckCircleIcon,
  },
  {
    type: "item" as const,
    name: "餘額操作",
    href: "/admin/balance-modifications",
    icon: WalletIcon,
  },
  {
    type: "category" as const,
    label: "紀錄",
  },
  {
    type: "item" as const,
    name: "餘額異動紀錄",
    href: "/admin/balance-modification-history",
    icon: ClipboardDocumentListIcon,
  },
  {
    type: "item" as const,
    name: "操作紀錄",
    href: "/admin/user-activity-logs",
    icon: ClipboardDocumentListIcon,
  },
  {
    type: "item" as const,
    name: "交易報表",
    href: "/admin/reports/balance",
    icon: ChartBarSquareIcon,
  },
  {
    type: "category" as const,
    label: "其他",
  },
  {
    type: "item" as const,
    name: "代收開單",
    href: "/admin/deposit-create",
    icon: CurrencyDollarIcon,
  },
  {
    type: "item" as const,
    name: "Telegram 群發",
    href: "/admin/telegram-broadcast",
    icon: InboxArrowDownIcon,
  },
  {
    type: "category" as const,
    label: "開發者",
  },
  {
    type: "item" as const,
    name: "開發者主頁",
    href: "/admin/developer/dashboard",
    icon: HomeIcon,
  },
  {
    type: "item" as const,
    name: "測試帳號清理",
    href: "/admin/developer/testing-account-cleanup",
    icon: TrashIcon,
  },
  // {
  //   type: "item" as const,
  //   name: "路由規則",
  //   href: "/admin/txn-routing-rules",
  //   icon: AdjustmentsHorizontalIcon,
  // },
  // {
  //   type: "item" as const,
  //   name: "API Logging",
  //   href: "/admin/request-logs",
  //   icon: DocumentMagnifyingGlassIcon,
  // },
];

export const allNavigation = [
  ...merchantNavigation,
  ...adminNavigation.filter((item) => item.type === "item"),
];

export const routesWithoutLayout = [
  "/login",
  "/",
  "/cashier",
  "/gcash-cashier",
  "/v2-signature-generator",
  "/testing-deposit",
  "/jazzcash-payment-success",
];

export const merchantRoutes = [
  "/merchant/dashboard",
  "/merchant/users",
  "/merchant/transactions",
  "/merchant/merchant-requested-withdrawals",
  "/merchant/reports/balance",
  "/merchant/balance-modification-history",
  "/merchant/user-activity-logs",
  "/merchant/manual-actions",
];

const publicRoutes = [
  "/",
  "/cashier",
  "/gcash-cashier",
  "/v2-signature-generator",
  "/testing-deposit",
  "/jazzcash-payment-success",
];

const loginRoutes = ["/login"];

export const isPublicRoutes = (pathname: string) => {
  return publicRoutes.includes(pathname);
};

export const isLoginRoutes = (pathname: string) => {
  return loginRoutes.includes(pathname);
};

export const isMerchantRoute = (pathname: string) => {
  return merchantRoutes.includes(pathname) || pathname.startsWith("/merchant/");
};

export const getOrganizationBaseUrl = (organizationType: OrgType) => {
  if (organizationType === OrgType.ADMIN) {
    return "/admin/dashboard";
  } else if (organizationType === OrgType.MERCHANT) {
    return "/merchant/dashboard";
  } else {
    return;
  }
};

export const getOrganizationPrefixUrl = (organizationType: OrgType) => {
  if (organizationType === OrgType.ADMIN) {
    return "/admin";
  } else if (organizationType === OrgType.MERCHANT) {
    return "/merchant";
  } else {
    return;
  }
};
