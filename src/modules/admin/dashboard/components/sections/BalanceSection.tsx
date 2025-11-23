import { formatNumber } from "@/lib/utils/number";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface BalanceSectionProps {
  currencyBalances: Array<{
    currency: string;
    totalBalance: string;
    totalAvailableAmount: string;
    totalDepositUnsettledAmount: string;
    totalFrozenAmount: string;
  }>;
}

export const BalanceSection = ({ currencyBalances }: BalanceSectionProps) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">系統總餘額</h2>
        <p className="text-gray-600">即時查看系統內所有餘額狀況</p>
      </div>

      {/* Currency-grouped Balance Summary Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {currencyBalances.length > 0 ? (
          currencyBalances.map(({ currency, ...balances }) => {
            const currencySymbol = getCurrencySymbol(currency);
            return (
              <div
                key={currency}
                className="border border-gray-200 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 w-full min-w-0"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900 text-lg">
                      {currency}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {currencySymbol}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 總餘額 */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      總餘額
                    </p>
                    <p className="text-2xl font-bold text-purple-600 break-words">
                      {currencySymbol} {formatNumber(balances.totalBalance)}
                    </p>
                  </div>

                  {/* 可用餘額 */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      可用餘額
                    </p>
                    <p className="text-xl font-bold text-green-600 break-words">
                      {currencySymbol}{" "}
                      {formatNumber(balances.totalAvailableAmount)}
                    </p>
                  </div>

                  {/* 未結算額度 */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      未結算額度
                    </p>
                    <p className="text-xl font-bold text-amber-600 break-words">
                      {currencySymbol}{" "}
                      {formatNumber(balances.totalDepositUnsettledAmount)}
                    </p>
                  </div>

                  {/* 凍結額度 */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      凍結額度
                    </p>
                    <p className="text-xl font-bold text-red-600 break-words">
                      {currencySymbol}{" "}
                      {formatNumber(balances.totalFrozenAmount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full border border-gray-200 bg-white rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">暫無餘額資料</p>
          </div>
        )}
      </div>
    </div>
  );
};
