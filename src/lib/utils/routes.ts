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
    name: "用戶",
    href: "/merchant/users",
    icon: UserCircleIcon,
  },
  {
    name: "訂單查詢",
    href: "/merchant/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: "申請下發",
    href: "/merchant/merchant-requested-withdrawals",
    icon: WalletIcon,
  },
  {
    name: "交易報表",
    href: "/merchant/reports/balance",
    icon: ChartBarSquareIcon,
  },
  {
    name: "餘額異動紀錄",
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
    name: "系統主頁",
    href: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    name: "交易統計",
    href: "/admin/transaction-statistics",
    icon: ChartPieIcon,
  },
  {
    name: "上游渠道",
    href: "/admin/channel-controls",
    icon: CurrencyDollarIcon,
  },
  {
    name: "單位列表",
    href: "/admin/organizations",
    icon: BuildingOffice2Icon,
  },
  {
    name: "訂單查詢",
    href: "/admin/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: "待處理交易",
    href: "/admin/problem-transactions",
    icon: ExclamationTriangleIcon,
  },
  {
    name: "批量重送回調",
    href: "/admin/batch-resend-notifications",
    icon: DocumentDuplicateIcon,
  },
  {
    name: "強制修改訂單",
    href: "/admin/force-modify-transaction",
    icon: HandRaisedIcon,
  },
  {
    name: "商戶下發請求",
    href: "/admin/merchant-requested-withdrawals",
    icon: CheckCircleIcon,
  },
  {
    name: "代收開單",
    href: "/admin/deposit-create",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Telegram 群發",
    href: "/admin/telegram-broadcast",
    icon: InboxArrowDownIcon,
  },
  {
    name: "餘額操作",
    href: "/admin/balance-modifications",
    icon: WalletIcon,
  },
  {
    name: "餘額異動紀錄",
    href: "/admin/balance-modification-history",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "操作紀錄",
    href: "/admin/user-activity-logs",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "交易報表",
    href: "/admin/reports/balance",
    icon: ChartBarSquareIcon,
  },
  {
    name: "路由規則",
    href: "/admin/txn-routing-rules",
    icon: AdjustmentsHorizontalIcon,
  },
];

export const developerNavigation = [
  {
    name: "開發者主頁",
    href: "/admin/developer/dashboard",
    icon: HomeIcon,
  },
];

export const allNavigation = [
  ...merchantNavigation,
  ...adminNavigation,
  ...developerNavigation,
];

export const routesWithoutLayout = [
  "/login",
  "/",
  "/cashier",
  "/gcash-cashier",
  "/test-signature",
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

const publicRoutes = ["/", "/cashier", "/gcash-cashier", "/test-signature"];

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
