import { PaymentChannel, TransactionType } from "./transaction";

export interface TransactionMetadata {
  id: string;
  type: TransactionType;
  paymentChannel: PaymentChannel;
  upstreamReceiveResponse?: any;
  upstreamNotifyResponse?: any;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
