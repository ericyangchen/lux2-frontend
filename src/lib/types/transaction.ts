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
  RMB = "RMB",
}
// NATIVE_GCASH_DIRECT = "NATIVE_GCASH_DIRECT",
// SIMULATED_GCASH_DIRECT = "SIMULATED_GCASH_DIRECT",
// SIMULATED_GCASH_QR_DEPOSIT = "SIMULATED_GCASH_QR_DEPOSIT", // only for deposit
// QRPH = "QRPH",
// MAYA = "MAYA",

export enum PaymentChannel {}
// // NATIVE_GCASH_DIRECT
// NATIVE_GCASH_DIRECT_MIKE = "NATIVE_GCASH_DIRECT_MIKE",
// NATIVE_GCASH_DIRECT_YUNA = "NATIVE_GCASH_DIRECT_YUNA",
// // SIMULATED_GCASH_DIRECT
// SIMULATED_GCASH_DIRECT_GOLDPAY = "SIMULATED_GCASH_DIRECT_GOLDPAY",
// // SIMULATED_GCASH_QR
// SIMULATED_GCASH_QR_GOLDPAY = "SIMULATED_GCASH_QR_GOLDPAY",
// // QRPH
// QRPH_MIKE = "QRPH_MIKE",
// QRPH_YUNA = "QRPH_YUNA",
// // MAYA
// MAYA_GOLDPAY = "MAYA_GOLDPAY",

export enum TransactionStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  FAILED_REFUNDED = "FAILED_REFUNDED", // for withdrawal refunds
}

export enum TransactionDetailedStatus {
  // status: NOT_STARTED
  UNKNOWN = "UNKNOWN",

  // DEPOSIT status: PENDING
  DEPOSIT_CREATED = "DEPOSIT_CREATED",
  DEPOSIT_UPSTREAM_CREATED = "DEPOSIT_UPSTREAM_CREATED",
  // DEPOSIT status: SUCCESS
  DEPOSIT_UPSTREAM_NOTIFY_SUCCESS = "DEPOSIT_UPSTREAM_NOTIFY_SUCCESS",
  // DEPOSIT status: FAILED
  DEPOSIT_UPSTREAM_REQUEST_ERROR = "DEPOSIT_UPSTREAM_REQUEST_ERROR",
  DEPOSIT_UPSTREAM_CREATION_ERROR = "DEPOSIT_UPSTREAM_CREATION_ERROR",

  // WITHDRAWAL status: PENDING
  WITHDRAWAL_CREATED = "WITHDRAWAL_CREATED",
  WITHDRAWAL_UPSTREAM_PROCESSING = "WITHDRAWAL_UPSTREAM_PROCESSING",
  // WITHDRAWAL status: PENDING, need processing
  WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE_ERROR = "WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE_ERROR",
  WITHDRAWAL_UPSTREAM_REQUEST_ERROR = "WITHDRAWAL_UPSTREAM_REQUEST_ERROR",
  WITHDRAWAL_UPSTREAM_NOTIFY_ERROR = "WITHDRAWAL_UPSTREAM_NOTIFY_ERROR",
  // WITHDRAWAL status: SUCCESS
  WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS = "WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS",

  // WITHDRAWAL status: FAILED
  WITHDRAWAL_UPSTREAM_CREATION_ERROR = "WITHDRAWAL_UPSTREAM_CREATION_ERROR",
  WITHDRAWAL_UPSTREAM_FAILED_REFUNDED = "WITHDRAWAL_UPSTREAM_FAILED_REFUNDED",
}

export const TransactionDetailedStatusDisplayNames = {
  // status: NOT_STARTED
  [TransactionDetailedStatus.UNKNOWN]: "未知",

  // DEPOSIT status: PENDING
  [TransactionDetailedStatus.DEPOSIT_CREATED]: "代收-創建成功",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_CREATED]: "代收-上游創建成功",

  // DEPOSIT status: SUCCESS
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_NOTIFY_SUCCESS]:
    "代收-上游通知成功",

  // DEPOSIT status: FAILED
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_REQUEST_ERROR]:
    "代收-上游請求錯誤",
  [TransactionDetailedStatus.DEPOSIT_UPSTREAM_CREATION_ERROR]:
    "代收-上游創建失敗",

  // WITHDRAWAL status: PENDING
  [TransactionDetailedStatus.WITHDRAWAL_CREATED]: "代付-創建成功",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_PROCESSING]: "代付-上游處理中",

  // WITHDRAWAL status: PENDING, need processing
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE_ERROR]:
    "代付-上游餘額不足",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_REQUEST_ERROR]:
    "代付-上游請求錯誤",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_ERROR]:
    "代付-上游通知失敗",

  // WITHDRAWAL status: SUCCESS
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_NOTIFY_SUCCESS]:
    "代付-上游通知成功",

  // WITHDRAWAL status: FAILED
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_CREATION_ERROR]:
    "代付-上游創建失敗",
  [TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_FAILED_REFUNDED]:
    "代付-上游通知沖回",
};
export const TransactionDetailedStatusRequireProcessing = [
  // WITHDRAWAL status: PENDING, need processing
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE_ERROR,
  TransactionDetailedStatus.WITHDRAWAL_UPSTREAM_REQUEST_ERROR,
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
  // [PaymentMethod.NATIVE_GCASH_DIRECT]: [
  //   PaymentChannel.NATIVE_GCASH_DIRECT_MIKE,
  //   PaymentChannel.NATIVE_GCASH_DIRECT_YUNA,
  // ],
  // [PaymentMethod.SIMULATED_GCASH_DIRECT]: [
  //   PaymentChannel.SIMULATED_GCASH_DIRECT_GOLDPAY,
  // ],
  // [PaymentMethod.SIMULATED_GCASH_QR_DEPOSIT]: [
  //   PaymentChannel.SIMULATED_GCASH_QR_GOLDPAY,
  // ],
  // [PaymentMethod.QRPH]: [PaymentChannel.QRPH_MIKE, PaymentChannel.QRPH_YUNA],
  // [PaymentMethod.MAYA]: [PaymentChannel.MAYA_GOLDPAY],
};

export const PaymentMethodDisplayNames = {
  // [PaymentMethod.NATIVE_GCASH_DIRECT]: "原生Gcash-直連",
  // [PaymentMethod.SIMULATED_GCASH_DIRECT]: "仿原生Gcash-直連",
  // [PaymentMethod.SIMULATED_GCASH_QR_DEPOSIT]: "仿原生Gcash-QR代收",
  // [PaymentMethod.QRPH]: "QRPH",
  // [PaymentMethod.MAYA]: "Maya",
};
export const PaymentChannelDisplayNames = {
  // [PaymentChannel.NATIVE_GCASH_DIRECT_MIKE]: "原生Gcash-直連: Mike",
  // [PaymentChannel.NATIVE_GCASH_DIRECT_YUNA]: "原生Gcash-直連: Yuna",
  // [PaymentChannel.SIMULATED_GCASH_DIRECT_GOLDPAY]: "仿原生Gcash-直連: Goldpay",
  // [PaymentChannel.SIMULATED_GCASH_QR_GOLDPAY]: "仿原生Gcash-QR代收: Goldpay",
  // [PaymentChannel.QRPH_MIKE]: "QRPH: Mike",
  // [PaymentChannel.QRPH_YUNA]: "QRPH: Yuna",
  // [PaymentChannel.MAYA_GOLDPAY]: "Maya: Goldpay",
};

export const TransactionStatusDisplayNames = {
  [TransactionStatus.NOT_STARTED]: "未開始",
  [TransactionStatus.PENDING]: "處理中",
  [TransactionStatus.SUCCESS]: "成功",
  [TransactionStatus.FAILED]: "失敗",
  [TransactionStatus.FAILED_REFUNDED]: "失敗(沖回)",
};

export interface SystemDailyTransactionCount {
  dailyTotal: string;
  dailyDepositSuccessTotal: string;
  dailyDepositFailedTotal: string;
  dailyWithdrawalSuccessTotal: string;
  dailyWithdrawalFailedTotal: string;
  dailyWithdrawalFailedRefundedTotal: string;
}

export interface DailyTransactionCountByOrganizationId {
  dailyTotal: string;
  dailyDepositSuccessTotal: string;
  dailyDepositFailedTotal: string;
  dailyWithdrawalSuccessTotal: string;
  dailyWithdrawalFailedTotal: string;
  dailyWithdrawalFailedRefundedTotal: string;
}
