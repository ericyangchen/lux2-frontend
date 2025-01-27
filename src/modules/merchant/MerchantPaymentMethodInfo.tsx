import {
  PaymentMethodDisplayNames,
  TransactionType,
} from "@/lib/types/transaction";
import {
  formatNumber,
  formatNumberInPercentage,
  formatNumberWithoutMinFraction,
} from "@/lib/number";

import { Calculator } from "@/lib/calculator";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useOrganizationPaymentMethodInfo } from "@/lib/hooks/swr/transaction-fee-config";

export default function MerchantPaymentMethodInfo({
  organizationId,
}: {
  organizationId?: string;
}) {
  const { balances } = useBalances({ organizationId });

  const { paymentMethodInfos } = useOrganizationPaymentMethodInfo({
    organizationId,
  });

  const depositPaymentMethodInfos = paymentMethodInfos?.filter(
    (paymentMethodInfo) => paymentMethodInfo.type === TransactionType.DEPOSIT
  );
  const withdrawalPaymentMethodInfos = paymentMethodInfos?.filter(
    (paymentMethodInfo) => paymentMethodInfo.type === TransactionType.WITHDRAWAL
  );

  return (
    <div className="flow-root">
      <div className="px-0 sm:px-4">
        <div className="py-2">
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
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-center"
                  >
                    代收手續費
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-center"
                  >
                    代收金額區間
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-center"
                  >
                    代付手續費
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-center"
                  >
                    代付金額區間
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
                  balances.map((balance) => {
                    const depositPaymentInfo = depositPaymentMethodInfos?.find(
                      (paymentMethodInfo) =>
                        paymentMethodInfo.paymentMethod ===
                        balance.paymentMethod
                    );
                    const withdrawalPaymentInfo =
                      withdrawalPaymentMethodInfos?.find(
                        (paymentMethodInfo) =>
                          paymentMethodInfo.paymentMethod ===
                          balance.paymentMethod
                      );

                    const depositPercentageFee =
                      depositPaymentInfo?.percentageFee;
                    const depositFixedFee = depositPaymentInfo?.fixedFee;

                    const withdrawalPercentageFee =
                      withdrawalPaymentInfo?.percentageFee;
                    const withdrawalFixedFee = withdrawalPaymentInfo?.fixedFee;

                    let depositFeeString = "";
                    if (depositPercentageFee) {
                      depositFeeString =
                        formatNumberInPercentage(depositPercentageFee);

                      if (depositFixedFee && depositFixedFee !== "0") {
                        depositFeeString += ` + ${formatNumberWithoutMinFraction(
                          depositFixedFee
                        )}`;
                      }
                    } else if (depositFixedFee) {
                      depositFeeString =
                        formatNumberWithoutMinFraction(depositFixedFee);
                    }

                    let withdrawalFeeString = "";
                    if (withdrawalPercentageFee) {
                      withdrawalFeeString = formatNumberInPercentage(
                        withdrawalPercentageFee
                      );

                      if (withdrawalFixedFee && withdrawalFixedFee !== "0") {
                        withdrawalFeeString += ` + ${formatNumberWithoutMinFraction(
                          withdrawalFixedFee
                        )}`;
                      }
                    } else if (withdrawalFixedFee) {
                      withdrawalFeeString =
                        formatNumberWithoutMinFraction(withdrawalFixedFee);
                    }

                    const depositMinAmount = depositPaymentInfo?.totalMinAmount;
                    const depositMaxAmount = depositPaymentInfo?.totalMaxAmount;

                    const withdrawalMinAmount =
                      withdrawalPaymentInfo?.totalMinAmount;
                    const withdrawalMaxAmount =
                      withdrawalPaymentInfo?.totalMaxAmount;

                    const depositAmountRange =
                      !depositMinAmount && !depositMaxAmount
                        ? "無限制"
                        : `${depositMinAmount ?? "--"} ~ ${
                            depositMaxAmount ?? "--"
                          }`;

                    const withdrawalAmountRange =
                      !withdrawalMinAmount && !withdrawalMaxAmount
                        ? "無限制"
                        : `${withdrawalMinAmount ?? "--"} ~ ${
                            withdrawalMaxAmount ?? "--"
                          }`;

                    return (
                      <tr key={balance.id}>
                        <td className="text-left whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 pl-4 sm:pl-6">
                          {PaymentMethodDisplayNames[balance.paymentMethod]}
                        </td>
                        <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-700 text-center">
                          {depositFeeString}
                        </td>
                        <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-700 text-center">
                          {depositAmountRange}
                        </td>
                        <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-700 text-center">
                          {withdrawalFeeString}
                        </td>
                        <td className="font-mono whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-700 text-center">
                          {withdrawalAmountRange}
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
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={9}
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
