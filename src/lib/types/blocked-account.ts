export interface BlockedAccount {
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  failedAttempts: number;
  blockedAt?: string;
}
