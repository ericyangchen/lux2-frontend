import { DepositToAccountType } from "../enums/transactions/deposit-to-account-type.enum";
import { PaymentChannel } from "../enums/transactions/payment-channel.enum";
import { PaymentMethod } from "../enums/transactions/payment-method.enum";
import { TransactionInternalStatus } from "../enums/transactions/transaction-internal-status.enum";
import { TransactionStatus } from "../enums/transactions/transaction-status.enum";
import { TransactionType } from "../enums/transactions/transaction-type.enum";
import { WithdrawalToAccountType } from "../enums/transactions/withdrawal-to-account-type.enum";

export const TransactionTypeDisplayNames = {
  [TransactionType.API_DEPOSIT]: "代收",
  [TransactionType.API_WITHDRAWAL]: "代付",
  [TransactionType.MERCHANT_REQUESTED_WITHDRAWAL]: "商戶下發",
};

export const TransactionStatusDisplayNames = {
  // Intermediate statuses
  [TransactionStatus.NOT_STARTED]: "未開始",
  [TransactionStatus.PENDING]: "處理中",
  [TransactionStatus.MERCHANT_REQUESTED_WITHDRAWAL_PENDING]: "待審核",

  // Final statuses
  [TransactionStatus.SUCCESS]: "成功",
  [TransactionStatus.FAILED]: "失敗",
  [TransactionStatus.FAILED_WITHDRAWAL_REFUNDED]: "失敗(沖回)",
  [TransactionStatus.FAILED_MERCHANT_REQUESTED_WITHDRAWAL_REJECTED]: "拒絕",
};

export const TransactionInternalStatusDisplayNames = {
  // status: NOT_STARTED
  [TransactionInternalStatus.UNKNOWN]: "未知",

  // DEPOSIT
  [TransactionInternalStatus.DEPOSIT_CREATED]: "代收-創建成功",

  [TransactionInternalStatus.DEPOSIT_SUBMITTED_TO_UPSTREAM]: "代收-已提交上游",
  [TransactionInternalStatus.DEPOSIT_SUBMIT_TO_UPSTREAM_ERROR]:
    "代收-提交上游錯誤",
  [TransactionInternalStatus.DEPOSIT_UPSTREAM_CONNECTION_ERROR]:
    "代收-上游連接錯誤",

  [TransactionInternalStatus.DEPOSIT_UPSTREAM_SUCCESS_RESPONSE]:
    "代收-上游成功",
  [TransactionInternalStatus.DEPOSIT_UPSTREAM_FAILED_RESPONSE]: "代收-上游失敗",

  // WITHDRAWAL
  [TransactionInternalStatus.WITHDRAWAL_CREATED]: "代付-創建成功",

  [TransactionInternalStatus.WITHDRAWAL_SUBMITTED_TO_UPSTREAM]:
    "代付-已提交上游",
  [TransactionInternalStatus.WITHDRAWAL_SUBMIT_TO_UPSTREAM_ERROR]:
    "代付-提交上游錯誤",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_CONNECTION_ERROR]:
    "代付-上游連接錯誤",

  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_INSUFFICIENT_BALANCE]:
    "代付-上游餘額不足",
  [TransactionInternalStatus.WITHDRAWAL_RESUBMISSION_IN_PROGRESS]:
    "代付-重新提交中",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_SUCCESS_RESPONSE]:
    "代付-上游成功",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_FAILED_RESPONSE]:
    "代付-上游失敗",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_FAILED_MANUALLY_SET_TO_FAILED]:
    "代付-上游失敗(手動設定)",

  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_FAILED_REFUNDED_RESPONSE]:
    "代付-上游失敗(沖回)",
  [TransactionInternalStatus.WITHDRAWAL_REFUNDED_TO_MERCHANT]:
    "代付-失敗(已沖回)",

  // MERCHANT_REQUESTED_WITHDRAWAL
  [TransactionInternalStatus.MERCHANT_REQUESTED_WITHDRAWAL_CREATED]:
    "商戶下發-創建成功",
  [TransactionInternalStatus.MERCHANT_REQUESTED_WITHDRAWAL_SUBMISSION_IN_PROGRESS]:
    "商戶下發-提交中",
  [TransactionInternalStatus.MERCHANT_REQUESTED_WITHDRAWAL_REJECTED]:
    "商戶下發-拒絕",
};

export const DepositPaymentChannelCategories = {
  [PaymentMethod.NATIVE_GCASH]: [
    // BIFU
    PaymentChannel.NATIVE_GCASH_DIRECT_BIFU,
    PaymentChannel.NATIVE_GCASH_QR_BIFU,
    PaymentChannel.NATIVE_GCASH_AWAKEN_BIFU,
    PaymentChannel.NATIVE_GCASH_AWAKEN_REVISION_BIFU,
    // SMX
    PaymentChannel.NATIVE_GCASH_SMX_DEPOSIT,
  ],
  [PaymentMethod.MAYA]: [
    // BIFU
    PaymentChannel.MAYA_BIFU_DEPOSIT,
  ],
  [PaymentMethod.QRPH]: [
    // BIFU
    PaymentChannel.QRPH_BIFU_DEPOSIT,
  ],
};

export const WithdrawalPaymentChannelCategories = {
  [PaymentMethod.NATIVE_GCASH]: [
    // BIFU
    PaymentChannel.NATIVE_GCASH_BIFU_BANK,
    // SMX
    PaymentChannel.NATIVE_GCASH_SMX_WITHDRAWAL,
  ],
  [PaymentMethod.MAYA]: [
    // BIFU
    PaymentChannel.MAYA_BIFU_BANK_WITHDRAWAL,
  ],
  [PaymentMethod.QRPH]: [
    // BIFU
    PaymentChannel.QRPH_BIFU_BANK_WITHDRAWAL,
  ],
};

export const AllPaymentChannelCategories = {
  [PaymentMethod.NATIVE_GCASH]: [
    ...DepositPaymentChannelCategories[PaymentMethod.NATIVE_GCASH],
    ...WithdrawalPaymentChannelCategories[PaymentMethod.NATIVE_GCASH],
  ],
  [PaymentMethod.MAYA]: [
    ...DepositPaymentChannelCategories[PaymentMethod.MAYA],
    ...WithdrawalPaymentChannelCategories[PaymentMethod.MAYA],
  ],
  [PaymentMethod.QRPH]: [
    ...DepositPaymentChannelCategories[PaymentMethod.QRPH],
    ...WithdrawalPaymentChannelCategories[PaymentMethod.QRPH],
  ],
};

export const PaymentMethodDisplayNames = {
  [PaymentMethod.NATIVE_GCASH]: "原生GCash",
  [PaymentMethod.MAYA]: "Maya",
  [PaymentMethod.QRPH]: "QRPH",
};

export const PaymentChannelDisplayNames = {
  /**
   * BIFU
   */
  /* NATIVE_GCASH Deposit */
  [PaymentChannel.NATIVE_GCASH_DIRECT_BIFU]:
    "Native GCash: Bifu Direct (deposit)",
  [PaymentChannel.NATIVE_GCASH_QR_BIFU]: "Native GCash: Bifu QR (deposit)",
  [PaymentChannel.NATIVE_GCASH_AWAKEN_BIFU]:
    "Native GCash: Bifu Awaken (deposit)",
  [PaymentChannel.NATIVE_GCASH_AWAKEN_REVISION_BIFU]:
    "Native GCash: Bifu Awaken Revision (deposit)",
  /* NATIVE_GCASH Withdrawal */
  [PaymentChannel.NATIVE_GCASH_BIFU_BANK]:
    "Native GCash: Bifu Bank (withdrawal)",

  /* MAYA Deposit */
  [PaymentChannel.MAYA_BIFU_DEPOSIT]: "Maya: Bifu (deposit)",
  /* MAYA Withdrawal */
  [PaymentChannel.MAYA_BIFU_BANK_WITHDRAWAL]: "Maya: Bifu Bank (withdrawal)",

  /* QRPH Deposit */
  [PaymentChannel.QRPH_BIFU_DEPOSIT]: "QRPH: Bifu (deposit)",
  /* QRPH Withdrawal */
  [PaymentChannel.QRPH_BIFU_BANK_WITHDRAWAL]: "QRPH: Bifu Bank (withdrawal)",

  /**
   * SMX
   */
  /* NATIVE_GCASH Deposit */
  [PaymentChannel.NATIVE_GCASH_SMX_DEPOSIT]: "Native GCash: SMX (deposit)",
  /* NATIVE_GCASH Withdrawal */
  [PaymentChannel.NATIVE_GCASH_SMX_WITHDRAWAL]:
    "Native GCash: SMX (withdrawal)",
};

export const DepositAccountTypeDisplayNames = {
  [DepositToAccountType.DEFAULT]: "預設",
};

export const WithdrawalAccountTypeDisplayNames = {
  [WithdrawalToAccountType.BANK_ACCOUNT]: "銀行帳戶",
  [WithdrawalToAccountType.GCASH_ACCOUNT]: "GCash帳戶",
  [WithdrawalToAccountType.MAYA_ACCOUNT]: "Maya帳戶",
};
