export interface DailyBalanceSnapshotItem {
  date: string; // YYYY-MM-DD
  totalBalance: string;
  availableBalance: string;
  frozenBalance: string;
  unsettledBalance: string;
  withdrawalPendingBalance?: string;
  paymentMethod?: string;
}

export interface SystemDailyBalanceSnapshots {
  organizationId: "system";
  startDate: string;
  endDate: string;
  paymentMethod: string;
  balanceSnapshots: DailyBalanceSnapshotItem[];
}

export interface OrganizationDailyBalanceSnapshots {
  organizationId: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  balanceSnapshots: DailyBalanceSnapshotItem[];
}
