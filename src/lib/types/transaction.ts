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
  REQUIRE_ACTION = "REQUIRE_ACTION",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TransactionDetailedStatus {
  // status: NOT_STARTED
  UNKNOWN = "UNKNOWN",

  // DEPOSIT status: PENDING
  DEPOSIT_CREATED = "DEPOSIT_CREATED",
  DEPOSIT_UPSTREAM_CREATED = "DEPOSIT_UPSTREAM_CREATED",
  DEPOSIT_UPSTREAM_NOTIFY_PROCESSING = "DEPOSIT_UPSTREAM_NOTIFY_PROCESSING",
  // DEPOSIT status: PENDING, need processing
  DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH = "DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH",
  // DEPOSIT status: SUCCESS
  DEPOSIT_UPSTREAM_NOTIFY_SUCCESS = "DEPOSIT_UPSTREAM_NOTIFY_SUCCESS",
  // DEPOSIT status: FAILED
  DEPOSIT_UPSTREAM_REQUEST_ERROR = "DEPOSIT_UPSTREAM_REQUEST_ERROR",
  DEPOSIT_UPSTREAM_CREATION_ERROR = "DEPOSIT_UPSTREAM_CREATION_ERROR",
  DEPOSIT_UPSTREAM_NOTIFY_FAILED = "DEPOSIT_UPSTREAM_NOTIFY_FAILED",

  // WITHDRAWAL status: PENDING
  WITHDRAWAL_CREATED = "WITHDRAWAL_CREATED",
  WITHDRAWAL_UPSTREAM_CREATED = "WITHDRAWAL_UPSTREAM_CREATED",
  WITHDRAWAL_UPSTREAM_NOTIFY_PROCESSING = "WITHDRAWAL_UPSTREAM_NOTIFY_PROCESSING",
  // WITHDRAWAL status: PENDING, need processing
  WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE = "WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE",
  WITHDRAWAL_UPSTREAM_REQUEST_ERROR = "WITHDRAWAL_UPSTREAM_REQUEST_ERROR",
  WITHDRAWAL_UPSTREAM_CREATION_ERROR = "WITHDRAWAL_UPSTREAM_CREATION_ERROR",
  WITHDRAWAL_UPSTREAM_NOTIFY_ERROR = "WITHDRAWAL_UPSTREAM_NOTIFY_ERROR",
  // WITHDRAWAL status: SUCCESS
  WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS = "WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS",

  // WITHDRAWAL status: FAILED
}

export const TransactionDetailedStatusDisplayNames = {
  // status: NOT_STARTED
  [TransactionDetailedStatus.UNKNOWN]: "未知",

  // DEPOSIT status: PENDING
  [TransactionDetailedStatus.DEPOSIT_CREATED]: "代收創建成功",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_CREATED]: "上游代收創建成功",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_PROCESSING]:
    "上游代收通知處理中",
  // DEPOSIT status: PENDING, need processing
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH]:
    "上游代收金額不符",
  // DEPOSIT status: SUCCESS
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_SUCCESS]: "上游代收成功",
  // DEPOSIT status: FAILED
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_REQUEST_ERROR]:
    "上游代收請求錯誤",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_CREATION_ERROR]:
    "上游代收創建失敗",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_FAILED]: "上游代收失敗",

  // WITHDRAWAL status: PENDING
  [TransactionDetailedStatus.WITHDRAWAL_CREATED]: "代付創建成功",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_CREATED]: "上游代付創建成功",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_PROCESSING]:
    "上游代付通知處理中",
  // WITHDRAWAL status: PENDING, need processing
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE]:
    "上游代付餘額不足",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_REQUEST_ERROR]:
    "上游代付請求錯誤",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_CREATION_ERROR]:
    "上游代付創建失敗",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_ERROR]: "上游代付失敗",
  // WITHDRAWAL status: SUCCESS
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS]:
    "上游代付成功",

  // WITHDRAWAL status: FAILED
};
export const TransactionDetailedStatusRequireProcessing = [
  // DEPOSIT status: PENDING, need processing
  TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_COMPLETED_AMOUNT_MISMATCH,

  // WITHDRAWAL status: PENDING, need processing
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE,
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_REQUEST_ERROR,
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_CREATION_ERROR,
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_ERROR,
];

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
  [PaymentChannel.JD_THAILAND_SCAN_CODE]: "JD泰國掃碼",
};

export const TransactionStatusDisplayNames = {
  [TransactionStatus.NOT_STARTED]: "未開始",
  [TransactionStatus.PENDING]: "處理中",
  [TransactionStatus.REQUIRE_ACTION]: "需人工處理",
  [TransactionStatus.SUCCESS]: "成功",
  [TransactionStatus.FAILED]: "失敗",
};

export interface SystemDailyTransactionCount {
  dailyTotal: string;
  dailyDepositSuccessTotal: string;
  dailyDepositFailedTotal: string;
  dailyWithdrawalSuccessTotal: string;
  dailyWithdrawalFailedTotal: string;
}

export interface DailyTransactionCountByOrganizationId {
  dailyTotal: string;
  dailyDepositSuccessTotal: string;
  dailyDepositFailedTotal: string;
  dailyWithdrawalSuccessTotal: string;
  dailyWithdrawalFailedTotal: string;
}
