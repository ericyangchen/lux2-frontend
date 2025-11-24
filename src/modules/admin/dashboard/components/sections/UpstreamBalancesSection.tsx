import { formatNumber } from "@/lib/utils/number";
import { convertDatabaseTimeToReadablePhilippinesTime } from "@/lib/utils/timezone";
import { UpstreamBalance } from "@/lib/hooks/swr/upstream-balances";

interface UpstreamBalancesSectionProps {
  upstreamBalances: Record<string, UpstreamBalance>;
}

export const UpstreamBalancesSection = ({
  upstreamBalances,
}: UpstreamBalancesSectionProps) => {
  const entries = Object.entries(upstreamBalances);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">上游餘額</h2>
        <p className="text-gray-600">即時查看上游餘額狀況</p>
      </div>

      <div className="border border-gray-200 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  名稱
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  餘額
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  最後更新
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                >
                  錯誤
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length > 0 ? (
                entries.map(([name, balance]) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                      {balance.balance !== null
                        ? formatNumber(balance.balance.toString())
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {convertDatabaseTimeToReadablePhilippinesTime(
                        balance.lastUpdated
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {balance.error || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    暫無上游餘額資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
