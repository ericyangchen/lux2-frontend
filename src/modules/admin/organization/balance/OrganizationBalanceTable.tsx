import { Balance } from "@/lib/types/balance";
import { Calculator } from "@/lib/calculator";
import { PaymentMethodDisplayNames } from "@/lib/types/transaction";
import { formatNumber } from "@/lib/number";

export default function OrganizationBalanceTable({
  balances,
}: {
  balances: Balance[];
}) {
  return (
    <div className="flow-root">
      <div className="px-0 sm:px-4">
        <div className="py-2 pb-4">
          <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-2 overflow-x-scroll">
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
                {balances?.length ? (
                  balances.map((balance) => (
                    <tr key={balance.id}>
                      <td className="text-left whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 pl-4 sm:pl-6">
                        {PaymentMethodDisplayNames[balance.paymentMethod]}
                      </td>
                      <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {formatNumber(
                          Calculator.plus(
                            balance.availableAmount,
                            balance.depositUnsettledAmount
                          )
                        )}
                      </td>
                      <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatNumber(balance.availableAmount)}
                      </td>
                      <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatNumber(balance.depositUnsettledAmount)}
                      </td>
                      <td className="font-mono whitespace-nowrap px-3 py-4 text-sm text-rose-600 pr-4 sm:pr-6">
                        {formatNumber(balance.frozenAmount)}
                      </td>
                    </tr>
                  ))
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
