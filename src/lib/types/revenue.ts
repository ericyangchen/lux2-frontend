import { PaymentMethod } from "./transaction";

export interface Revenue {
  id: string;
  transactionId: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  revenue: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
