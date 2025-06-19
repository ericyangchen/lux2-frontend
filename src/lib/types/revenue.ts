import { PaymentMethod } from "../enums/transactions/payment-method.enum";

export interface Revenue {
  id: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  revenue: string;
  fromTransactionId: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
