import { Permission } from "@/lib/enums/permissions/permission.enum";

export const PermissionDisplayNames: Record<Permission, string> = {
  // Developer permissions
  [Permission.DEVELOPER_DELETE_ORGANIZATION]: "刪除組織",
  [Permission.DEVELOPER_MANAGE_TESTING_ACCOUNT]: "管理測試帳戶",
  [Permission.DEVELOPER_CLEANUP_TRANSACTIONS]: "清理交易",
  [Permission.DEVELOPER_MANAGE_USER]: "管理用戶",
  [Permission.DEVELOPER_DELETE_TRANSACTIONS]: "刪除交易",
  [Permission.DEVELOPER_DELETE_REVENUES]: "刪除收益",
  [Permission.DEVELOPER_INITIALIZE_ORGANIZATION_AVAILABLE_CHANNELS]:
    "初始化組織可用通道",
  [Permission.DEVELOPER_BYPASS_IP_WHITELIST]: "繞過 IP 白名單",

  // Admin permissions
  [Permission.ADMIN_MANAGE_ORGANIZATION]: "管理商戶",
  [Permission.ADMIN_GET_ORGANIZATION_API_KEY]: "查看商戶 API 金鑰",
  [Permission.ADMIN_UPDATE_ORGANIZATION_API_KEY]: "更新商戶 API 金鑰",
  [Permission.ADMIN_MANAGE_TXN_FEE_SETTINGS]: "管理交易費率設定",
  [Permission.ADMIN_MANAGE_BALANCE_MODIFICATIONS]: "管理餘額調整",
  [Permission.ADMIN_MANAGE_MERCHANT_REQUESTED_WITHDRAWALS]: "管理商戶提現請求",
  [Permission.ADMIN_MANAGE_TXN_ROUTING_RULES]: "管理交易路由規則",
  [Permission.ADMIN_MANAGE_IP_WHITELISTS]: "管理 IP 白名單",
  [Permission.ADMIN_MANAGE_BLOCKED_ACCOUNTS]: "管理封鎖帳戶",
  [Permission.ADMIN_MANAGE_ROLES]: "管理角色",
  [Permission.ADMIN_MANAGE_USER]: "管理用戶",
  [Permission.ADMIN_BROADCAST_TO_TELEGRAM]: "發送 Telegram 廣播",
  [Permission.ADMIN_FORCE_MODIFY_TRANSACTIONS]: "強制修改交易",

  // Merchant permissions
  [Permission.MERCHANT_CREATE_USER]: "新增用戶",
  [Permission.MERCHANT_UPDATE_USER]: "更新用戶",
  [Permission.MERCHANT_DELETE_USER]: "刪除用戶",
  [Permission.MERCHANT_MANAGE_ROLES]: "管理角色",
  [Permission.MERCHANT_CREATE_MERCHANT_REQUESTED_WITHDRAWAL]: "建立提現請求",
};
