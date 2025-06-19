import { DepositToAccountType } from "../enums/transactions/deposit-to-account-type.enum";
import { PaymentChannel } from "../enums/transactions/payment-channel.enum";
import { PaymentMethod } from "../enums/transactions/payment-method.enum";
import { TransactionInternalStatus } from "../enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "../enums/transactions/transaction-status.enum";
import { TransactionType } from "../enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "../enums/transactions/withdrawal-to-account-type.enum";

export interface Transaction {
  id: string;
  type: TransactionType;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  notifyUrl?: string;
  note?: string;
  // generated
  paymentChannel: PaymentChannel;
  feePercentage: string;
  feeFixed: string;
  totalFee: string;
  balanceChanged: string;
  settlementInterval?: string;
  transactionFeeAllocationTable: TransactionFeeAllocationTable;
  revenueDistributed: boolean;
  successAt?: string;
  internalStatus: TransactionInternalStatus;
  status: TransactionStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // nullable params
  accountType?: DepositToAccountType | WithdrawalToAccountType;
  bankName?: string;
  bankAccount?: string;
  senderName?: string;
  receiverName?: string;
}

interface AgentRevenue {
  organizationId: string;
  percentage: string;
  fixed: string;
  // actual allocated amount
  totalRevenue: string;
}

export interface TransactionFeeAllocationTable {
  upstreamFee: {
    percentage: string;
    fixed: string;
    // actual allocated amount
    totalFee: string;
  };
  adminRevenue: {
    organizationId: string;
    percentage: string;
    fixed: string;
    // actual allocated numbers
    totalRevenue: string;
  };
  agentRevenues: AgentRevenue[];
  merchantFee: {
    percentage: string;
    fixed: string;
    // actual allocated amount
    totalFee: string;
  };
}

export interface SystemDailyTransactionCount {
  date: string;
  depositCount: number;
  withdrawalCount: number;
  totalCount: number;
}

export interface DailyTransactionCountByOrganizationId {
  organizationId: string;
  date: string;
  depositCount: number;
  withdrawalCount: number;
  totalCount: number;
}
