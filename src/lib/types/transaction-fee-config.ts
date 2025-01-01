import { PaymentChannel, PaymentMethod, TransactionType } from "./transaction";

export interface TransactionFeeConfig {
  id: string;
  organizationId: string;
  type: TransactionType;
  percentageFee: string;
  fixedFee: string;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  minAmount?: string;
  maxAmount?: string;
  settlementInterval?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface PaymentMethodInfo {
  type: string;
  paymentMethod: string;
  percentageFee: string;
  fixedFee: string;
  totalMinAmount?: string | undefined;
  totalMaxAmount?: string | undefined;
}
