// Permission name constants
// Developer permissions are prefixed with "developer_"
// Admin permissions are for ADMIN org type
// Merchant permissions are for MERCHANT org type

export enum Permission {
  /**
   * Developer permissions
   */
  // organization
  DEVELOPER_DELETE_ORGANIZATION = "developer_delete_organization",
  // testing account conversion
  DEVELOPER_MANAGE_TESTING_ACCOUNT = "developer_manage_testing_account",
  // DEVELOPER_CLEANUP_TESTING_ACCOUNT = 'developer_cleanup_testing_account',
  DEVELOPER_CLEANUP_TRANSACTIONS = "developer_cleanup_transactions",
  // user
  DEVELOPER_MANAGE_USER = "developer_manage_user",
  // transactions
  DEVELOPER_DELETE_TRANSACTIONS = "developer_delete_transactions",
  // revenues
  DEVELOPER_DELETE_REVENUES = "developer_delete_revenues",
  // available channels
  DEVELOPER_INITIALIZE_ORGANIZATION_AVAILABLE_CHANNELS = "developer_initialize_organization_available_channels",

  /**
   * Admin permissions
   */
  // organization
  ADMIN_MANAGE_ORGANIZATION = "admin_manage_organization",
  // api key
  ADMIN_GET_ORGANIZATION_API_KEY = "admin_get_organization_api_key",
  ADMIN_UPDATE_ORGANIZATION_API_KEY = "admin_update_organization_api_key",
  // txn fee settings
  ADMIN_MANAGE_TXN_FEE_SETTINGS = "admin_manage_txn_fee_settings",
  // balance modification
  ADMIN_MANAGE_BALANCE_MODIFICATIONS = "admin_manage_balance_modifications",
  // merchant requested withdrawal
  ADMIN_MANAGE_MERCHANT_REQUESTED_WITHDRAWALS = "admin_manage_merchant_requested_withdrawals",
  // txn routing rules
  ADMIN_MANAGE_TXN_ROUTING_RULES = "admin_manage_txn_routing_rules",
  // ip whitelists
  ADMIN_MANAGE_IP_WHITELISTS = "admin_manage_ip_whitelists",
  // blocked accounts
  ADMIN_MANAGE_BLOCKED_ACCOUNTS = "admin_manage_blocked_accounts",
  // roles
  ADMIN_MANAGE_ROLES = "admin_manage_roles",
  // user
  ADMIN_MANAGE_USER = "admin_manage_user",
  // telegram broadcast
  ADMIN_BROADCAST_TO_TELEGRAM = "admin_broadcast_to_telegram",
  // force modify transactions
  ADMIN_FORCE_MODIFY_TRANSACTIONS = "admin_force_modify_transactions",
  // bypass ip whitelist
  ADMIN_BYPASS_IP_WHITELIST = "admin_bypass_ip_whitelist",

  /**
   * Merchant permissions
   */
  // user
  MERCHANT_CREATE_USER = "merchant_create_user",
  MERCHANT_UPDATE_USER = "merchant_update_user",
  MERCHANT_DELETE_USER = "merchant_delete_user",
  // roles
  MERCHANT_MANAGE_ROLES = "merchant_manage_roles",
  // merchant requested withdrawal
  MERCHANT_CREATE_MERCHANT_REQUESTED_WITHDRAWAL = "merchant_create_merchant_requested_withdrawal",
}
