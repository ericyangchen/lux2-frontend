import { OrgType } from "../enums/organizations/org-type.enum";
import { Permission } from "../enums/permissions/permission.enum";
import { useUser } from "./swr/user";
import { getApplicationCookies } from "../utils/cookie";
import { getUserPermissionsFromToken } from "../utils/jwt";
import {
  hasDeveloperPermission,
  hasPermission,
  hasAnyPermission,
} from "../utils/permissions";
import { useMemo } from "react";

export const useUserPermission = ({
  accessingOrganizationId,
}: {
  accessingOrganizationId?: string;
}) => {
  const { user } = useUser();
  const { accessToken } = getApplicationCookies();

  // Get permissions from JWT token or user object
  const userPermissions = useMemo(() => {
    if (user?.permissions && user.permissions.length > 0) {
      return user.permissions;
    }
    if (accessToken) {
      return getUserPermissionsFromToken(accessToken);
    }
    return [];
  }, [user?.permissions, accessToken]);

  // Even if user/org not loaded, we can still check permissions from token
  const isDeveloper = hasDeveloperPermission(userPermissions);

  // Get org type directly from user
  const userOrgType = user?.orgType;
  const isAdminOrg = userOrgType === OrgType.ADMIN;
  const isMerchantOrg = userOrgType === OrgType.MERCHANT;

  const accessingSelfOrg = user
    ? accessingOrganizationId === user.organizationId
    : false;

  return {
    isAdminOrg,
    isMerchantOrg,
    isDeveloper,
    accessingSelfOrg,
    userPermissions,
    hasPermission: (permission: Permission) =>
      hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(userPermissions, permissions),
  };
};
