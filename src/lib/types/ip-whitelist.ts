import { CreatorType } from "../enums/transactions/creator-type.enum";
import { IpWhitelistType } from "../enums/ip-whitelists/ip-whitelist-type.enum";

export interface IpWhitelist {
  id: string;
  type: IpWhitelistType;
  organizationId: string;
  ipAddress: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  creatorType: CreatorType;
  creatorIdentifier?: string;
  creatorIp?: string;
}
