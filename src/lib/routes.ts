import {
  BuildingOffice2Icon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
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
    icon: CreditCardIcon,
  },
  // {
  //   name: "歷史紀錄",
  //   href: "/merchant/history",
  //   icon: DocumentChartBarIcon,
  // },
];

export const adminNavigation = [
  {
    name: "主頁",
    href: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    name: "單位列表",
    href: "/admin/organizations",
    icon: BuildingOffice2Icon,
  },
  {
    name: "訂單查詢",
    href: "/admin/transactions",
    icon: CreditCardIcon,
  },
  {
    name: "手動作業",
    href: "/admin/manual-actions",
    icon: HandRaisedIcon,
  },
  {
    name: "渠道管理",
    href: "/admin/channel-controls",
    icon: CurrencyDollarIcon,
  },
  // {
  //   name: "歷史紀錄",
  //   href: "/admin/history",
  //   icon: DocumentChartBarIcon,
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
