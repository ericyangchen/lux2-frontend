import {
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  HandRaisedIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { OrganizationType } from "./types/organization";

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
  // {
  //   name: "渠道管理",
  //   href: "/admin/channel-controls",
  //   icon: CurrencyDollarIcon,
  // },
  {
    name: "訂單查詢",
    href: "/admin/transactions",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: "手動作業",
    href: "/admin/manual-actions",
    icon: HandRaisedIcon,
  },
  {
    name: "批量操作",
    href: "/admin/batch-processing",
    icon: DocumentDuplicateIcon,
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
    href: "/developer/dashboard",
    icon: HomeIcon,
  },
];

export const allNavigation = [
  ...merchantNavigation,
  ...adminNavigation,
  ...developerNavigation,
];

export const routesWithoutLayout = ["/login", "/"];

const publicRoutes = ["/"];

const loginRoutes = ["/login"];

export const isPublicRoutes = (pathname: string) => {
  return publicRoutes.includes(pathname);
};

export const isLoginRoutes = (pathname: string) => {
  return loginRoutes.includes(pathname);
};

export const getOrganizationBaseUrl = (organizationType: OrganizationType) => {
  if (organizationType === OrganizationType.GENERAL_AGENT) {
    return "/admin/dashboard";
  } else if (organizationType === OrganizationType.MERCHANT) {
    return "/merchant/dashboard";
  } else {
    return;
  }
};
