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

  [TransactionInternalStatus.DEPOSIT_UPSTREAM_SUCCESS_RESPONSE]: "代收-成功",
  [TransactionInternalStatus.DEPOSIT_UPSTREAM_FAILED_RESPONSE]: "代收-失敗",

  [TransactionInternalStatus.DEPOSIT_UPSTREAM_SUCCESS_MANUALLY_SET_TO_SUCCESS]:
    "代收-成功(手動設定)",
  [TransactionInternalStatus.DEPOSIT_UPSTREAM_FAILED_MANUALLY_SET_TO_FAILED]:
    "代收-失敗(手動設定)",

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
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_SUCCESS_RESPONSE]: "代付-成功",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_FAILED_RESPONSE]: "代付-失敗",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_SUCCESS_MANUALLY_SET_TO_SUCCESS]:
    "代付-成功(手動設定)",
  [TransactionInternalStatus.WITHDRAWAL_UPSTREAM_FAILED_MANUALLY_SET_TO_FAILED]:
    "代付-失敗(手動設定)",

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
    // // BIFU
    // PaymentChannel.NATIVE_GCASH_DIRECT_BIFU,
    // PaymentChannel.NATIVE_GCASH_QR_BIFU,
    // PaymentChannel.NATIVE_GCASH_AWAKEN_BIFU,
    // PaymentChannel.NATIVE_GCASH_AWAKEN_CASHIER_BIFU,
    // PaymentChannel.NATIVE_GCASH_AWAKEN_REVISION_BIFU,

    // // IPay
    // PaymentChannel.NATIVE_GCASH_IPAY_DEPOSIT,
    // PaymentChannel.NATIVE_GCASH_IPAY_CASHIER_DEPOSIT,

    // // DaliPay
    // PaymentChannel.NATIVE_GCASH_DALIPAY_DEPOSIT,

    // HFPay
    PaymentChannel.NATIVE_GCASH_HFPAY_DEPOSIT,

    // // QRPAY
    // PaymentChannel.NATIVE_GCASH_QRPAY_DEPOSIT,
    // PaymentChannel.NATIVE_GCASH_QRPAY_C1_DEPOSIT,

    // // APAY
    // PaymentChannel.NATIVE_GCASH_APAY_DEPOSIT,

    // H88PAY
    // PaymentChannel.NATIVE_GCASH_H88PAY_DEPOSIT,

    // SMPAY
    PaymentChannel.NATIVE_GCASH_SMPAY_DEPOSIT,
  ] as PaymentChannel[],
  [PaymentMethod.MAYA]: [
    // // BIFU
    // PaymentChannel.MAYA_BIFU_DEPOSIT,
  ] as PaymentChannel[],
  [PaymentMethod.QRPH]: [
    // // BIFU
    // PaymentChannel.QRPH_BIFU_DEPOSIT,
    // // IPay
    // PaymentChannel.QRPH_IPAY_DEPOSIT,
  ] as PaymentChannel[],
};

export const WithdrawalPaymentChannelCategories = {
  [PaymentMethod.NATIVE_GCASH]: [
    // // BIFU
    // PaymentChannel.NATIVE_GCASH_BIFU_BANK,

    // // IPay
    // PaymentChannel.NATIVE_GCASH_IPAY_WITHDRAWAL,

    // // WorldPay
    // PaymentChannel.NATIVE_GCASH_WORLDPAY_WITHDRAWAL,

    // // DaliPay
    // PaymentChannel.NATIVE_GCASH_DALIPAY_WITHDRAWAL,

    // // OdPay
    // PaymentChannel.NATIVE_GCASH_ODPAY_WITHDRAWAL,

    // HFPay
    PaymentChannel.NATIVE_GCASH_HFPAY_WITHDRAWAL,

    // // QRPAY
    // PaymentChannel.NATIVE_GCASH_QRPAY_WITHDRAWAL,
    // PaymentChannel.NATIVE_GCASH_QRPAY_C1_WITHDRAWAL,

    // // APAY
    // PaymentChannel.NATIVE_GCASH_APAY_WITHDRAWAL,

    // // TKINGPAY
    // PaymentChannel.NATIVE_GCASH_TKINGPAY_WITHDRAWAL,

    // H88PAY
    // PaymentChannel.NATIVE_GCASH_H88PAY_WITHDRAWAL,

    // SMPAY
    PaymentChannel.NATIVE_GCASH_SMPAY_WITHDRAWAL,
  ] as PaymentChannel[],
  [PaymentMethod.MAYA]: [
    // // BIFU
    // PaymentChannel.MAYA_BIFU_BANK_WITHDRAWAL,
    // // WorldPay
    // PaymentChannel.MAYA_WORLDPAY_WITHDRAWAL,
  ] as PaymentChannel[],
  [PaymentMethod.QRPH]: [
    // // BIFU
    // PaymentChannel.QRPH_BIFU_BANK_WITHDRAWAL,
    // // IPay
    // PaymentChannel.QRPH_IPAY_WITHDRAWAL,
    // // WorldPay
    // PaymentChannel.QRPH_WORLDPAY_WITHDRAWAL,
  ] as PaymentChannel[],
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
  [PaymentMethod.NATIVE_GCASH]: "GCash",
  [PaymentMethod.MAYA]: "Maya",
  [PaymentMethod.QRPH]: "QRPH",
};

export const PaymentChannelDisplayNames = {
  // /**
  //  * BIFU
  //  */
  // /* NATIVE_GCASH Deposit */
  // [PaymentChannel.NATIVE_GCASH_DIRECT_BIFU]:
  //   "N-GCash: Bifu 110 Direct (deposit)",
  // [PaymentChannel.NATIVE_GCASH_QR_BIFU]: "N-GCash: Bifu 111 QR (deposit)",
  // [PaymentChannel.NATIVE_GCASH_AWAKEN_BIFU]: "N-GCash: Bifu 113 (deposit)",
  // [PaymentChannel.NATIVE_GCASH_AWAKEN_CASHIER_BIFU]:
  //   "N-GCash: Bifu 113 包收銀台 (deposit)",
  // [PaymentChannel.NATIVE_GCASH_AWAKEN_REVISION_BIFU]:
  //   "N-GCash: Bifu 114 (deposit)",
  // /* NATIVE_GCASH Withdrawal */
  // [PaymentChannel.NATIVE_GCASH_BIFU_BANK]:
  //   "N-GCash: Bifu 100 Bank (withdrawal)",

  // /* MAYA Deposit */
  // [PaymentChannel.MAYA_BIFU_DEPOSIT]: "Maya: Bifu 107 (deposit)",
  // /* MAYA Withdrawal */
  // [PaymentChannel.MAYA_BIFU_BANK_WITHDRAWAL]:
  //   "Maya: Bifu 100 Bank (withdrawal)",

  // /* QRPH Deposit */
  // [PaymentChannel.QRPH_BIFU_DEPOSIT]: "QRPH: Bifu 112 (deposit)",
  // /* QRPH Withdrawal */
  // [PaymentChannel.QRPH_BIFU_BANK_WITHDRAWAL]:
  //   "QRPH: Bifu 100 Bank (withdrawal)",

  // /**
  //  * IPay
  //  */
  // /* NATIVE_GCASH Deposit */
  // [PaymentChannel.NATIVE_GCASH_IPAY_DEPOSIT]: "N-GCash: IPay (deposit)",
  // [PaymentChannel.NATIVE_GCASH_IPAY_CASHIER_DEPOSIT]:
  //   "N-GCash: IPay 包收銀台 (deposit)",
  // /* NATIVE_GCASH Withdrawal */
  // [PaymentChannel.NATIVE_GCASH_IPAY_WITHDRAWAL]: "N-GCash: IPay (withdrawal)",

  // /* QRPH Deposit */
  // [PaymentChannel.QRPH_IPAY_DEPOSIT]: "QRPH: IPay (deposit)",
  // /* QRPH Withdrawal */
  // [PaymentChannel.QRPH_IPAY_WITHDRAWAL]: "QRPH: IPay (withdrawal)",

  // /* WorldPay */
  // [PaymentChannel.NATIVE_GCASH_WORLDPAY_WITHDRAWAL]:
  //   "N-GCash: WorldPay (withdrawal)",
  // [PaymentChannel.QRPH_WORLDPAY_WITHDRAWAL]: "QRPH: WorldPay (withdrawal)",
  // [PaymentChannel.MAYA_WORLDPAY_WITHDRAWAL]: "Maya: WorldPay (withdrawal)",

  // /* DaliPay */
  // [PaymentChannel.NATIVE_GCASH_DALIPAY_DEPOSIT]: "N-GCash: DaliPay (deposit)",
  // [PaymentChannel.NATIVE_GCASH_DALIPAY_WITHDRAWAL]:
  //   "N-GCash: DaliPay (withdrawal)",

  // /* OdPay */
  // [PaymentChannel.NATIVE_GCASH_ODPAY_WITHDRAWAL]: "N-GCash: OdPay (withdrawal)",

  // /* HFPay */
  [PaymentChannel.NATIVE_GCASH_HFPAY_DEPOSIT]: "N-GCash: HFPay (deposit)",
  [PaymentChannel.NATIVE_GCASH_HFPAY_WITHDRAWAL]: "N-GCash: HFPay (withdrawal)",

  // /* QRPAY */
  // [PaymentChannel.NATIVE_GCASH_QRPAY_C1_DEPOSIT]:
  //   "N-GCash: QRPAY 通道1 (deposit)",
  // [PaymentChannel.NATIVE_GCASH_QRPAY_DEPOSIT]: "N-GCash: QRPAY 通道2 (deposit)",
  // [PaymentChannel.NATIVE_GCASH_QRPAY_C1_WITHDRAWAL]:
  //   "N-GCash: QRPAY 通道1 (withdrawal)",
  // [PaymentChannel.NATIVE_GCASH_QRPAY_WITHDRAWAL]:
  //   "N-GCash: QRPAY 通道2 (withdrawal)",

  // /* APAY */
  // [PaymentChannel.NATIVE_GCASH_APAY_DEPOSIT]: "N-GCash: APay (deposit)",
  // [PaymentChannel.NATIVE_GCASH_APAY_WITHDRAWAL]: "N-GCash: APay (withdrawal)",

  // /* TKINGPAY */
  // [PaymentChannel.NATIVE_GCASH_TKINGPAY_WITHDRAWAL]:
  //   "N-GCash: TKINGPAY (withdrawal)",

  // /* H88PAY */
  // [PaymentChannel.NATIVE_GCASH_H88PAY_DEPOSIT]: "N-GCash: H88PAY (deposit)",
  // [PaymentChannel.NATIVE_GCASH_H88PAY_WITHDRAWAL]:
  //   "N-GCash: H88PAY (withdrawal)",

  // /* SMPAY */
  [PaymentChannel.NATIVE_GCASH_SMPAY_DEPOSIT]: "N-GCash: SMPay (deposit)",
  [PaymentChannel.NATIVE_GCASH_SMPAY_WITHDRAWAL]: "N-GCash: SMPay (withdrawal)",
};

export const DepositAccountTypeDisplayNames = {
  [DepositToAccountType.DEFAULT]: "預設",
};

export const WithdrawalAccountTypeDisplayNames = {
  [WithdrawalToAccountType.BANK_ACCOUNT]: "銀行帳戶",
  [WithdrawalToAccountType.GCASH_ACCOUNT]: "GCash帳戶",
  [WithdrawalToAccountType.MAYA_ACCOUNT]: "Maya帳戶",
};
