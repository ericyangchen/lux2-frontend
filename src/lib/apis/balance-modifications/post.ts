import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { SMPayWebHeaderWithAccessToken } from "../smpay-web-header";
import { backendUrl } from "@/lib/constants/common";

export interface BalanceModificationRequest {
  organizationId: string;
  paymentMethod: PaymentMethod;
  amount: string;
  notes?: string;
  referenceId?: string;
}

export const ApiDirectModifyAddBalance = async ({
  organizationId,
  paymentMethod,
  amount,
  notes,
  referenceId,
  accessToken,
}: BalanceModificationRequest & { accessToken: string }) => {
  return fetch(`${backendUrl}/balance-modifications/direct-modify/add`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      paymentMethod,
      amount,
      notes,
      referenceId,
    }),
  });
};

export const ApiDirectModifySubtractBalance = async ({
  organizationId,
  paymentMethod,
  amount,
  notes,
  referenceId,
  accessToken,
}: BalanceModificationRequest & { accessToken: string }) => {
  return fetch(`${backendUrl}/balance-modifications/direct-modify/subtract`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      paymentMethod,
      amount,
      notes,
      referenceId,
    }),
  });
};

export const ApiFreezeBalance = async ({
  organizationId,
  paymentMethod,
  amount,
  notes,
  referenceId,
  accessToken,
}: BalanceModificationRequest & { accessToken: string }) => {
  return fetch(`${backendUrl}/balance-modifications/freeze`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      paymentMethod,
      amount,
      notes,
      referenceId,
    }),
  });
};

export const ApiUnfreezeBalance = async ({
  organizationId,
  paymentMethod,
  amount,
  notes,
  referenceId,
  accessToken,
}: BalanceModificationRequest & { accessToken: string }) => {
  return fetch(`${backendUrl}/balance-modifications/unfreeze`, {
    method: "POST",
    headers: SMPayWebHeaderWithAccessToken(accessToken),
    body: JSON.stringify({
      organizationId,
      paymentMethod,
      amount,
      notes,
      referenceId,
    }),
  });
};
