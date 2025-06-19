import { CreatorType } from "../enums/transactions/creator-type.enum";
import { TransactionLogAction } from "../enums/transactions/transaction-log-action.enum";
import { TransactionType } from "../enums/transactions/transaction-type.enum";

export interface TransactionLog {
  id: string;
  transactionId: string;
  type: TransactionType;
  action: TransactionLogAction;
  data?: any;
  route?: string;
  method?: string;
  triggeredBy?: string;
  creatorType: CreatorType;
  creatorIdentifier?: string;
  creatorIp?: string;
  createdAt: string;
}
