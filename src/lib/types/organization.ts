export enum OrganizationType {
  GENERAL_AGENT = "GENERAL_AGENT", // 總代理
  AGENT = "AGENT", // 代理
  MERCHANT = "MERCHANT", // 商戶
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  parent?: Organization;
  children: Organization[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// constants
export const OrganizationTypeDisplayNames = {
  [OrganizationType.GENERAL_AGENT]: "總代理",
  [OrganizationType.AGENT]: "代理",
  [OrganizationType.MERCHANT]: "商戶",
};
