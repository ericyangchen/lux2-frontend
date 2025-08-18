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
  // balance calculation fields (for balance reports)
  beforeBalance?: string;
  afterBalance?: string;
  // nullable params
  accountType?: DepositToAccountType | WithdrawalToAccountType;
  senderName?: string;
  senderEmail?: string;
  senderPhoneNumber?: string;
  bankName?: string;
  bankAccount?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverPhoneNumber?: string;
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
  period: string;
  referenceDate: string;
  total: string;
  depositSuccessTotal: string;
  depositFailedTotal: string;
  depositPendingTotal: string;
  withdrawalSuccessTotal: string;
  withdrawalFailedTotal: string;
  withdrawalPendingTotal: string;
  withdrawalFailedRefundedTotal: string;
}

export interface DailyTransactionCountByOrganizationId {
  organizationId: string;
  period: string;
  referenceDate: string;
  total: string;
  depositSuccessTotal: string;
  depositFailedTotal: string;
  depositPendingTotal: string;
  withdrawalSuccessTotal: string;
  withdrawalFailedTotal: string;
  withdrawalPendingTotal: string;
  withdrawalFailedRefundedTotal: string;
}

export interface WeeklyTransactionTrendDay {
  name: string; // Day name (e.g., "Monday", "Tuesday")
  date: string; // Date in YYYY-MM-DD format
  total: number;
  deposit: number;
  withdrawal: number;
  success: number;
  failed: number;
}

export interface SystemWeeklyTransactionTrends {
  referenceDate: string;
  weeklyData: WeeklyTransactionTrendDay[];
}

export interface WeeklyTransactionTrendsByOrganizationId {
  organizationId: string;
  referenceDate: string;
  weeklyData: WeeklyTransactionTrendDay[];
}

export interface PaymentMethodDistributionItem {
  paymentMethod: PaymentMethod;
  total: number;
  totalAmount: number;
}

export interface SystemPaymentMethodDistribution {
  referenceDate: string;
  paymentMethodData: PaymentMethodDistributionItem[];
}

export interface ChannelPerformanceItem {
  channel: string; // Payment channel name
  total: number; // Total transactions
  success: number; // Successful transactions
  failed: number; // Failed transactions
  successRate: number; // Success rate percentage
  successVolume: number; // Total volume of successful transactions
  totalFees: number; // Total fees collected
}

export interface SystemChannelPerformance {
  referenceDate: string;
  channelPerformanceData: ChannelPerformanceItem[];
}

export interface TransactionStatisticsCounts {
  data: Array<{
    paymentChannel: PaymentChannel;
    total: number;
    success: number;
    pending: number;
    fail: number;
    amountSum: number;
  }>;
}
