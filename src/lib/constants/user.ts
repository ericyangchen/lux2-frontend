import { UserRole } from "../enums/users/user-role.enum";

export const UserRoleDisplayNames = {
  [UserRole.DEVELOPER]: "開發者",
  [UserRole.ADMIN_OWNER]: "擁有者",
  [UserRole.ADMIN_STAFF]: "操作員",
  [UserRole.MERCHANT_OWNER]: "商戶擁有者",
  [UserRole.MERCHANT_STAFF]: "商戶操作員",
};
