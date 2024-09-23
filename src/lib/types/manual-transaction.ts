import { OperatorInfo, PaymentMethod } from "./transaction";

export interface ManualTransaction {
  id: string;
  type: ManualTransactionType;
  organizationId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  operatorInfo: OperatorInfo;
  additionalInfo: ManualFrozenAdditionalInfo | ManualGeneralAdditionalInfo;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ManualFrozenAdditionalInfo {
  originalTransactionId?: string;
  reason?: string;
  unfrozen: boolean;
}

export interface ManualGeneralAdditionalInfo {
  note?: string;
}

export enum ManualTransactionType {
  MANUAL_DEPOSIT = "MANUAL_DEPOSIT",
  MANUAL_WITHDRAWAL = "MANUAL_WITHDRAWAL",
  MANUAL_FROZEN = "MANUAL_FROZEN",
}

/** constants */
export const ManualTransactionTypeDisplayNames = {
  [ManualTransactionType.MANUAL_DEPOSIT]: "手動充值",
  [ManualTransactionType.MANUAL_WITHDRAWAL]: "手動提款",
  [ManualTransactionType.MANUAL_FROZEN]: "凍結",
};
