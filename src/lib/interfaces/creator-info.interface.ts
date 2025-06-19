import { CreatorType } from "../enums/transactions/creator-type.enum";

export interface CreatorInfo {
  creatorType: CreatorType;
  creatorIdentifier?: string;
  creatorIp?: string;
}
