import { FeeSettingList } from "../interfaces/txn-fee-settings.interface";
import { OrgType } from "../enums/organizations/org-type.enum";
import { PaymentChannel } from "../enums/transactions/payment-channel.enum";
import { PaymentMethod } from "../enums/transactions/payment-method.enum";
import { TransactionType } from "../enums/transactions/transaction-type.enum";

export interface OrganizationTransactionFeeSetting {
  id: string;
  organizationId: string;
  orgType: OrgType;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  feeSettingList: FeeSettingList;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
