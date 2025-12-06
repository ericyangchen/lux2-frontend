import { Permission } from "../enums/permissions/permission.enum";
import { OrgType } from "../enums/organizations/org-type.enum";

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  userPermissions: string[],
  permission: Permission
): boolean => {
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions (OR logic)
 */
export const hasAnyPermission = (
  userPermissions: string[],
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has any developer permission
 * Users with any developer_* permission can bypass most permission checks
 */
export const hasDeveloperPermission = (userPermissions: string[]): boolean => {
  return userPermissions.some((perm) => perm.startsWith("developer_"));
};
