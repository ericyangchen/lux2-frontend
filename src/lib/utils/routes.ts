import {
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  HomeIcon,
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
    name: "提領請求",
    href: "/merchant/merchant-requested-withdrawals",
    icon: WalletIcon,
  },
  {
    name: "操作紀錄",
    href: "/merchant/user-activity-logs",
    icon: ClipboardDocumentListIcon,
  },
  // {
  //   name: "手動提單",
  //   href: "/merchant/manual-actions",
  //   icon: HandRaisedIcon,
  // },
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
    name: "單位列表",
    href: "/admin/organizations",
    icon: BuildingOffice2Icon,
  },
  {
    name: "上游渠道",
    href: "/admin/channel-controls",
    icon: CurrencyDollarIcon,
  },
  {
    name: "訂單查詢",
    href: "/admin/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: "商戶下發請求",
    href: "/admin/merchant-requested-withdrawals",
    icon: CheckCircleIcon,
  },
  {
    name: "餘額操作",
    href: "/admin/balance-modifications",
    icon: WalletIcon,
  },
  {
    name: "待處理交易",
    href: "/admin/problem-transactions",
    icon: ExclamationTriangleIcon,
  },
  {
    name: "操作紀錄",
    href: "/admin/user-activity-logs",
    icon: ClipboardDocumentListIcon,
  },
  // {
  //   name: "報表",
  //   href: "/admin/history",
  //   icon: ChartBarSquareIcon,
  // },
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
];

const publicRoutes = ["/", "/cashier", "/gcash-cashier"];

const loginRoutes = ["/login"];

export const isPublicRoutes = (pathname: string) => {
  return publicRoutes.includes(pathname);
};

export const isLoginRoutes = (pathname: string) => {
  return loginRoutes.includes(pathname);
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
