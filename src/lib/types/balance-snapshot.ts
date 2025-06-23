export interface BalanceHistoryItem {
  date: string; // YYYY-MM-DD
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  unsettledBalance: number;
}

export interface SystemBalanceHistory {
  organizationId: "system";
  startDate: string;
  endDate: string;
  balanceHistory: BalanceHistoryItem[];
}

export interface OrganizationBalanceHistory {
  organizationId: string;
  startDate: string;
  endDate: string;
  balanceHistory: BalanceHistoryItem[];
}
