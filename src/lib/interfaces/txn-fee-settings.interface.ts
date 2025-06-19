import { DepositToAccountType } from "../enums/transactions/deposit-to-account-type.enum";
import { WithdrawalToAccountType } from "../enums/transactions/withdrawal-to-account-type.enum";

export interface FeeSetting {
  percentage: string;
  fixed: string;
}

export interface DepositFeeSettingList {
  [DepositToAccountType.DEFAULT]: FeeSetting;
}

export interface WithdrawalFeeSettingList {
  [WithdrawalToAccountType.BANK_ACCOUNT]: FeeSetting;
  [WithdrawalToAccountType.GCASH_ACCOUNT]: FeeSetting;
  [WithdrawalToAccountType.MAYA_ACCOUNT]: FeeSetting;
}

export type FeeSettingList = DepositFeeSettingList | WithdrawalFeeSettingList;
