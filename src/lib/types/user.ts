export enum UserRole {
  ADMINISTRATOR = "ADMINISTRATOR",
  OPERATOR = "OPERATOR",
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

/** constants */
export const UserRoleDisplayNames = {
  [UserRole.ADMINISTRATOR]: "管理員",
  [UserRole.OPERATOR]: "操作員",
};
