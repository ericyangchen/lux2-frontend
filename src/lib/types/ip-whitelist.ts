export enum IpWhitelistType {
  LOGIN = "LOGIN",
  WITHDRAWAL = "WITHDRAWAL",
}

export interface IpWhitelist {
  id: string;
  organizationId: string;
  creatorId: string;
  type: IpWhitelistType;
  ipAddress: string;
  createdAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
}
