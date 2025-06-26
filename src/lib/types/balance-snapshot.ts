export interface BalanceHistoryItem {
  date: string; // YYYY-MM-DD
  totalBalance: string;
  availableBalance: string;
  frozenBalance: string;
  unsettledBalance: string;
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
