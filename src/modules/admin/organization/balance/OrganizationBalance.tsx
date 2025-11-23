import { Calculator } from "@/lib/utils/calculator";
import { Label } from "@/components/shadcn/ui/label";
import OrganizationBalanceTable from "./OrganizationBalanceTable";
import { formatNumber } from "@/lib/utils/number";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useBalances } from "@/lib/hooks/swr/balance";
import { PaymentMethodCurrencyMapping } from "@/lib/constants/transaction";
import { PaymentMethod } from "@/lib/enums/transactions/payment-method.enum";
import { Balance } from "@/lib/types/balance";

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

export default function OrganizationBalance({
  organizationId,
}: {
  organizationId: string;
}) {
  const { balances } = useBalances({ organizationId });

  // Group balances by currency
  const balancesByCurrency = groupBalancesByCurrency(balances);

  // Calculate aggregated balances per currency
  const currencyBalances = Array.from(balancesByCurrency.entries()).map(
    ([currency, currencyBalanceList]) => {
      const totalBalance = currencyBalanceList.reduce((acc, balance) => {
        const balanceTotal = Calculator.plus(
          balance.availableAmount,
          balance.depositUnsettledAmount
        );
        return Calculator.plus(acc, balanceTotal);
      }, "0");

      const totalAvailableAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.availableAmount),
        "0"
      );

      const totalDepositUnsettledAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.depositUnsettledAmount),
        "0"
      );

      const totalFrozenAmount = currencyBalanceList.reduce(
        (acc, balance) => Calculator.plus(acc, balance.frozenAmount),
        "0"
      );

      return {
        currency,
        totalBalance,
        totalAvailableAmount,
        totalDepositUnsettledAmount,
        totalFrozenAmount,
      };
    }
  );

  return (
    <div className="py-8">
      <Label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        餘額
      </Label>

      {/* Currency-grouped Balance Summary Table */}
      <div className="border border-gray-200 bg-white mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  貨幣
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  總餘額
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  可用餘額
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  未結算額度
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  凍結額度
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currencyBalances.length > 0 ? (
                currencyBalances.map(({ currency, ...balances }) => {
                  const currencySymbol = getCurrencySymbol(currency);
                  return (
                    <tr
                      key={currency}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {currency}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currencySymbol}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-gray-900">
                          {`${currencySymbol} ${formatNumber(
                            balances.totalBalance
                          )}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-gray-900">
                          {`${currencySymbol} ${formatNumber(
                            balances.totalAvailableAmount
                          )}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-gray-900">
                          {`${currencySymbol} ${formatNumber(
                            balances.totalDepositUnsettledAmount
                          )}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-rose-600">
                          {`${currencySymbol} ${formatNumber(
                            balances.totalFrozenAmount
                          )}`}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                    暫無餘額資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrganizationBalanceTable balances={balances} />
    </div>
  );
}
