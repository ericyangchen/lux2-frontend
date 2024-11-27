export interface Transaction {
  id: string;
  type: TransactionType;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  notifyUrl?: string;
  paymentChannel: PaymentChannel;
  percentageFee: string;
  fixedFee: string;
  totalFee: string;
  balanceChanged: string;
  settlementInterval?: string;
  revenueDistributionInfo: any;
  revenueDistributed: boolean;
  operatorInfo: OperatorInfo;
  upstreamNotifiedAt?: string;
  detailedStatus: TransactionDetailedStatus;
  status: TransactionStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // nullable params
  bankName?: string;
  bankBranch?: string;
  bankAccountName?: string;
  senderName?: string;
  receiverName?: string;
}

export interface CreateDepositTransactionRequestBody {
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  notifyUrl?: string;
  sign?: string;
  note?: string;

  /**
   * nullable params
   */
  bankName?: string;
  senderName?: string;
}
export interface CreateDepositTransactionResponseBody {
  id: string;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: string;
  amount: string;
  totalFee: string;
  balanceChanged: string;
  status: string;
  message?: string | undefined;
  createdAt: string;
  /** transformed from TransactionMetadata */
  paymentUrl?: string | undefined;
}

export interface OperatorInfo {
  operatorType: OperatorType;
  operatorIpAddress: string;
  operatorUserId?: string;
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum PaymentMethod {
  THAILAND_SCAN_CODE = "THAILAND_SCAN_CODE",
}

export enum PaymentChannel {
  JD_THAILAND_SCAN_CODE = "JD_THAILAND_SCAN_CODE",
}

export enum TransactionStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TransactionDetailedStatus {
  UNKNOWN = "UNKNOWN", // status: NOT_STARTED

  DEPOSIT_CREATED = "DEPOSIT_CREATED", // status: PENDING
  DEPOSIT_UPSTREAM_CREATED = "DEPOSIT_UPSTREAM_CREATED", // status: PENDING
  DEPOSIT_UPSTREAM_REQUEST_ERROR = "DEPOSIT_UPSTREAM_REQUEST_ERROR", // status: FAILED
  DEPOSIT_UPSTREAM_CREATION_ERROR = "DEPOSIT_UPSTREAM_CREATION_ERROR", // status: FAILED
  DEPOSIT_UPSTREAM_NOTIFY_PROCESSING = "DEPOSIT_UPSTREAM_NOTIFY_PROCESSING", // status: PENDING
  DEPOSIT_UPSTREAM_NOTIFY_COMPLETED = "DEPOSIT_UPSTREAM_NOTIFY_COMPLETED", // status: SUCCESS
  DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH = "DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH", // status: FAILED
  DEPOSIT_UPSTREAM_NOTIFY_ERROR = "DEPOSIT_UPSTREAM_NOTIFY_ERROR", // status: FAILED

  WITHDRAWAL_CREATED = "WITHDRAWAL_CREATED", // status: PENDING
  WITHDRAWAL_UPSTREAM_CREATED = "WITHDRAWAL_UPSTREAM_CREATED", // status: PENDING
  WITHDRAWAL_UPSTREAM_REQUEST_ERROR = "WITHDRAWAL_UPSTREAM_REQUEST_ERROR", // status: FAILED
  WITHDRAWAL_UPSTREAM_CREATION_ERROR = "WITHDRAWAL_UPSTREAM_CREATION_ERROR", // status: FAILED
  WITHDRAWAL_UPSTREAM_NOTIFY_PROCESSING = "WITHDRAWAL_UPSTREAM_NOTIFY_PROCESSING", // status: PENDING
  WITHDRAWAL_UPSTREAM_NOTIFY_COMPLETED = "WITHDRAWAL_UPSTREAM_NOTIFY_COMPLETED", // status: SUCCESS
  WITHDRAWAL_UPSTREAM_NOTIFY_ERROR = "WITHDRAWAL_UPSTREAM_NOTIFY_ERROR", // status: FAILED
}

export enum OperatorType {
  MERCHANT_API = "MERCHANT_API",
  MERCHANT_WEB = "MERCHANT_WEB",
  GENERAL_AGENT_API = "GENERAL_AGENT_API",
  GENERAL_AGENT_WEB = "GENERAL_AGENT_WEB",
}

/** constants */
export const TransactionTypeDisplayNames = {
  [TransactionType.DEPOSIT]: "代收",
  [TransactionType.WITHDRAWAL]: "代付",
};

export const PaymentChannelCategories = {
  [PaymentMethod.THAILAND_SCAN_CODE]: [PaymentChannel.JD_THAILAND_SCAN_CODE],
};

export const PaymentMethodDisplayNames = {
  [PaymentMethod.THAILAND_SCAN_CODE]: "泰國掃碼",
};
export const PaymentChannelDisplayNames = {
  [PaymentChannel.JD_THAILAND_SCAN_CODE]: "JD 泰國掃碼",
};

export const TransactionStatusDisplayNames = {
  [TransactionStatus.NOT_STARTED]: "未開始",
  [TransactionStatus.PENDING]: "處理中",
  [TransactionStatus.SUCCESS]: "成功",
  [TransactionStatus.FAILED]: "失敗",
};
