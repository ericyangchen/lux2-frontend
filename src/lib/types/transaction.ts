export interface Transaction {
  id: string;
  type: TransactionType;
  merchantId: string;
  merchantOrderId: string;
  paymentMethod: PaymentMethod;
  paymentData: any;
  notifyUrl: string;
  amount: string;
  paymentChannel: PaymentChannel;
  percentageFee: string;
  fixedFee: string;
  totalFee: string;
  balanceChanged: string;
  settlementInterval?: string;
  revenueDistributionInfo: any;
  revenueDistributed: boolean;
  operatorInfo: OperatorInfo;
  phase: TransactionPhase;
  upstreamResponse?: any;
  upstreamNotifiedAt?: string;
  status: TransactionStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
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
  GCASH = "GCASH",
  MAYA = "MAYA",
  USDT = "USDT",
}

export enum PaymentChannel {
  // GCASH
  CLICK_PAY = "CLICK_PAY",
  WG_PAY = "WG_PAY",
  JS_PAY = "JS_PAY",
  DC_PAY = "DC_PAY",
  // MAYA
  // USDT
}

export enum TransactionStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TransactionPhase {
  /**
   * deposit: should start with DEPOSIT
   */
  DEPOSIT_RECEIVED = "DEPOSIT_RECEIVED",
  DEPOSIT_SENT_TO_UPSTREAM = "DEPOSIT_SENT_TO_UPSTREAM",
  DEPOSIT_UPSTREAM_PROCESSING = "DEPOSIT_UPSTREAM_PROCESSING", // for longer processing
  DEPOSIT_COMPLETED = "DEPOSIT_COMPLETED",
  DEPOSIT_FAILED = "DEPOSIT_FAILED",

  /**
   * withdrawal: should start with WITHDRAWAL
   */
  WITHDRAWAL_RECEIVED = "WITHDRAWAL_RECEIVED",
  WITHDRAWAL_SENT_TO_UPSTREAM = "WITHDRAWAL_SENT_TO_UPSTREAM",
  WITHDRAWAL_UPSTREAM_PROCESSING = "WITHDRAWAL_UPSTREAM_PROCESSING", // for longer processing
  WITHDRAWAL_COMPLETED = "WITHDRAWAL_COMPLETED",
  WITHDRAWAL_REQUIRE_ACTION = "WITHDRAWAL_REQUIRE_ACTION",
  WITHDRAWAL_FAILED = "WITHDRAWAL_FAILED",
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
  [PaymentMethod.GCASH]: [
    PaymentChannel.CLICK_PAY,
    PaymentChannel.WG_PAY,
    PaymentChannel.JS_PAY,
    PaymentChannel.DC_PAY,
  ],
  [PaymentMethod.MAYA]: [],
  [PaymentMethod.USDT]: [],
};

export const PaymentMethodDisplayNames = {
  [PaymentMethod.GCASH]: "GCash",
  [PaymentMethod.MAYA]: "Maya",
  [PaymentMethod.USDT]: "USDT",
};
export const PaymentChannelDisplayNames = {
  // GCASH
  [PaymentChannel.CLICK_PAY]: "Click Pay",
  [PaymentChannel.WG_PAY]: "WG Pay",
  [PaymentChannel.JS_PAY]: "JS Pay",
  [PaymentChannel.DC_PAY]: "DC Pay",
  // MAYA
  // USDT
};

export const TransactionStatusDisplayNames = {
  [TransactionStatus.NOT_STARTED]: "未開始",
  [TransactionStatus.PENDING]: "處理中",
  [TransactionStatus.SUCCESS]: "成功",
  [TransactionStatus.FAILED]: "失敗",
};
