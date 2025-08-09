import { TxnRoutingRule } from "@/lib/types/txn-routing-rule";

/**
 * 檢測兩個交易路由規則之間是否存在衝突
 * @param rule1 第一個規則
 * @param rule2 第二個規則
 * @returns 如果存在衝突返回 true，否則返回 false
 */
export const hasConflict = (
  rule1: TxnRoutingRule,
  rule2: TxnRoutingRule
): boolean => {
  // if isAccountTypeMatch is true, it means that the account types are "related"
  let isAccountTypeMatch = true;
  if (
    rule1.accountType !== null &&
    rule2.accountType !== null &&
    rule1.accountType !== rule2.accountType
  ) {
    // r1 = null, r2 = null -> true
    // r1 = null, r2 = "bank" -> true
    // r1 = "bank", r2 = null -> true
    // r1 = "bank1", r2 = "bank2" -> false
    isAccountTypeMatch = false;
  }

  // Check if transaction types are the same
  let isTransactionTypeMatch = true;
  if (rule1.transactionType !== rule2.transactionType) {
    isTransactionTypeMatch = false;
  }

  // Check if payment methods are the same
  let isPaymentMethodMatch = true;
  if (rule1.paymentMethod !== rule2.paymentMethod) {
    isPaymentMethodMatch = false;
  }

  // Check if value ranges overlap
  let min1 = rule1.minValue ? parseFloat(rule1.minValue.toString()) : 0;
  let max1 = rule1.maxValue
    ? parseFloat(rule1.maxValue.toString())
    : Number.MAX_SAFE_INTEGER;
  let min2 = rule2.minValue ? parseFloat(rule2.minValue.toString()) : 0;
  let max2 = rule2.maxValue
    ? parseFloat(rule2.maxValue.toString())
    : Number.MAX_SAFE_INTEGER;

  // Guarantee [min1, max1] [min2, max2] and min1 <= min2
  if (min1 > min2) {
    let temp = min1;
    min1 = min2;
    min2 = temp;
    temp = max1;
    max1 = max2;
    max2 = temp;
  }

  // Return true if:
  // 1. Ranges overlap
  // 2. Account types are related
  // 3. Transaction types are the same
  // 4. Payment methods are the same
  return (
    min2 <= max1 &&
    isAccountTypeMatch &&
    isTransactionTypeMatch &&
    isPaymentMethodMatch
  );
};

/**
 * 獲取與指定規則衝突的其他規則列表
 * @param currentRule 當前規則
 * @param allRules 所有規則列表
 * @returns 與當前規則衝突的規則列表
 */
export const getConflictingRules = (
  currentRule: TxnRoutingRule,
  allRules: TxnRoutingRule[]
): TxnRoutingRule[] => {
  return allRules.filter(
    (rule) => rule.id !== currentRule.id && hasConflict(currentRule, rule)
  );
};
