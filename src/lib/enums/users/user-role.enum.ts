export enum UserRole {
  // privileged role
  DEVELOPER = 'DEVELOPER',

  // admin role
  ADMIN_OWNER = 'ADMIN_OWNER',
  ADMIN_STAFF = 'ADMIN_STAFF',

  // merchant role
  MERCHANT_OWNER = 'MERCHANT_OWNER',
  MERCHANT_STAFF = 'MERCHANT_STAFF',
}

// Role groupings for validation
export const MERCHANT_ROLES = [
  UserRole.MERCHANT_OWNER,
  UserRole.MERCHANT_STAFF,
];

export const ADMIN_ROLES = [UserRole.ADMIN_OWNER, UserRole.ADMIN_STAFF];
