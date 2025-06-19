import { BalanceAction } from '../enums/balances/balance-action.enum';

/**
 * Balance modifications that are manually performed by users
 */
export const BALANCE_MODIFICATIONS = [
  BalanceAction.DIRECT_MODIFY_ADD_BALANCE,
  BalanceAction.DIRECT_MODIFY_SUBTRACT_BALANCE,
  BalanceAction.FREEZE_BALANCE,
  BalanceAction.UNFREEZE_BALANCE,
];
