/**
 * Get display name for system roles
 * @param roleName - The system role name (e.g., "OWNER", "DEVELOPER", "MERCHANT_OWNER")
 * @returns The localized display name for the role
 */
export function getSystemRoleDisplayName(roleName: string): string {
  switch (roleName) {
    case "OWNER":
      return "系統管理員";
    case "DEVELOPER":
      return "開發者";
    case "MERCHANT_OWNER":
      return "管理員";
    default:
      return roleName;
  }
}
