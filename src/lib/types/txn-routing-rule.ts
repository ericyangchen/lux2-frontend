import { PaymentChannel } from "@/lib/enums/transactions/payment-channel.enum";
import { DepositToAccountType } from "@/lib/enums/transactions/deposit-to-account-type.enum";
import { WithdrawalToAccountType } from "@/lib/enums/transactions/withdrawal-to-account-type.enum";
import { TransactionType } from "@/lib/enums/transactions/transaction-type.enum";

export interface RoutingRuleItem {
  priority: number;
  percentage: Record<PaymentChannel, number>;
}

export interface TxnRoutingRule {
  id: string;
  title: string;
  description?: string;
  enable: boolean;
  minValue: number;
  maxValue: number;
  accountType?: DepositToAccountType | WithdrawalToAccountType;
  routingRule: RoutingRuleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTxnRoutingRuleRequest {
  title: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  accountType?: DepositToAccountType | WithdrawalToAccountType;
  routingRule: RoutingRuleItem[];
}

export interface UpdateTxnRoutingRuleRequest {
  enable: boolean;
}

export interface OrgTxnRoutingRule {
  id: string;
  organizationId: string;
  organizationName?: string;
  txnRoutingRuleId: string;
  txnRoutingRule?: TxnRoutingRule;
  enable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrgTxnRoutingRuleRequest {
  organizationIds: string[];
  txnRoutingRuleId: string;
}

export interface UpdateOrgTxnRoutingRuleRequest {
  enable?: boolean;
}

export interface DeleteOrgTxnRoutingRuleRequest {
  ids: string[];
}
