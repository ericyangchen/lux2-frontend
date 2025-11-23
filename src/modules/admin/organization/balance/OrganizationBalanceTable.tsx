import React from "react";
import { Balance } from "@/lib/types/balance";
import { Calculator } from "@/lib/utils/calculator";
import {
  PaymentMethodDisplayNames,
  PaymentMethodCurrencyMapping,
} from "@/lib/constants/transaction";
import { formatNumber } from "@/lib/utils/number";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Label } from "@/components/shadcn/ui/label";

// Get currency for a payment method
const getCurrencyForPaymentMethod = (
  paymentMethod: PaymentMethod
): string | null => {
  for (const [currency, paymentMethods] of Object.entries(
    PaymentMethodCurrencyMapping
  )) {
    if (paymentMethods.includes(paymentMethod)) {
      return currency;
    }
  }
  return null;
};

// Group balances by currency
const groupBalancesByCurrency = (
  balances: Balance[] | undefined
): Map<string, Balance[]> => {
  const grouped = new Map<string, Balance[]>();

  if (!balances) {
    return grouped;
  }

  for (const balance of balances) {
    const currency = getCurrencyForPaymentMethod(balance.paymentMethod);
    if (currency) {
      if (!grouped.has(currency)) {
        grouped.set(currency, []);
      }
      grouped.get(currency)!.push(balance);
    }
  }

  return grouped;
};

export default function OrganizationBalanceTable({
  balances,
}: {
  balances: Balance[] | undefined;
}) {
  const balancesByCurrency = groupBalancesByCurrency(balances);
  const currencies = Array.from(balancesByCurrency.keys()).sort();

  return (
    <div className="mt-8">
      <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        詳細通道餘額
      </Label>
      <div className="px-0">
        <div className="py-2 pb-4">
          <div className="border border-gray-200 mt-4 overflow-x-scroll">
            <table className="w-full divide-y divide-gray-300 text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="text-left px-3 py-3.5 text-sm font-semibold text-gray-900 pl-4 sm:pl-6"
                  >
                    通道
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                  >
                    餘額
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                  >
                    可用餘額
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900"
                  >
                    未結算額度
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900 pr-4 sm:pr-6"
                  >
                    凍結額度
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currencies.length > 0 ? (
                  currencies.map((currency) => {
                    const currencyBalances = balancesByCurrency.get(currency)!;
                    const currencySymbol = getCurrencySymbol(currency);
                    return (
                      <React.Fragment key={currency}>
                        {/* Currency Label Row */}
                        <tr className="bg-gray-50 text-left">
                          <td
                            colSpan={5}
                            className="px-3 py-2 text-sm font-semibold text-gray-900 pl-4 sm:pl-6"
                          >
                            {currencySymbol} {currency}
                          </td>
                        </tr>
                        {/* Payment Method Rows (indented) */}
                        {currencyBalances.map((balance) => (
                          <tr key={balance.id}>
                            <td className="text-left whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 pl-10 sm:pl-12">
                              {PaymentMethodDisplayNames[balance.paymentMethod]}
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                              {`${currencySymbol} ${formatNumber(
                                Calculator.plus(
                                  balance.availableAmount,
                                  balance.depositUnsettledAmount
                                )
                              )}`}
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {`${currencySymbol} ${formatNumber(
                                balance.availableAmount
                              )}`}
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {`${currencySymbol} ${formatNumber(
                                balance.depositUnsettledAmount
                              )}`}
                            </td>
                            <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-rose-600 pr-4 sm:pr-6">
                              {`${currencySymbol} ${formatNumber(
                                balance.frozenAmount
                              )}`}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
                    >
                      沒有餘額資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
