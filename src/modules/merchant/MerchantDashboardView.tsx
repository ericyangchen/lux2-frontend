import { formatNumber, formatNumberInInteger } from "@/lib/number";

import { Calculator } from "@/lib/calculator";
import { Label } from "@/components/shadcn/ui/label";
import MerchantPaymentMethodInfo from "./MerchantPaymentMethodInfo";
import OrganizationBalanceTable from "../admin/organization/balance/OrganizationBalanceTable";
import OrganizationPaymentMethodTable from "../admin/organization/paymentMethod/OrganizationPaymentMethodTable";
import { classNames } from "@/lib/utils";
import { currencySymbol } from "@/lib/constants";
import { getApplicationCookies } from "@/lib/cookie";
import { useBalances } from "@/lib/hooks/swr/balance";
import { useDailyTransactionCountByOrganizationId } from "@/lib/hooks/swr/transaction";

const Stat = ({
  name,
  value,
  textClassNames = "text-gray-700",
}: {
  name: string;
  value: string;
  textClassNames?: string;
}) => {
  return (
    <div className="flex flex-wrap items-baseline justify-between p-4">
      <dt className="text-sm font-medium leading-6 text-gray-500">{name}</dt>
      <dd
        className={classNames(
          textClassNames,
          "w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900"
        )}
      >
        {currencySymbol} {formatNumber(value)}
      </dd>
    </div>
  );
};

export default function MerchantDashboardView() {
  const { organizationId } = getApplicationCookies();

  const { balances } = useBalances({ organizationId });

  const totalBalance = balances?.reduce((acc, balance) => {
    const totalBalance = Calculator.plus(
      balance.availableAmount,
      balance.depositUnsettledAmount
    );

    return Calculator.plus(acc, totalBalance);
  }, "0");
  const totalAvailableAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.availableAmount),
    "0"
  );
  const totalDepositUnsettledAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.depositUnsettledAmount),
    "0"
  );
  const totalFrozenAmount = balances?.reduce(
    (acc, balance) => Calculator.plus(acc, balance.frozenAmount),
    "0"
  );

  const { dailyTransactionCountByOrganizationId } =
    useDailyTransactionCountByOrganizationId({ organizationId });

  return (
    <div className="p-4 border rounded-md">
      <div className="py-8">
        <Label className="text-xl font-bold">餘額</Label>
        <dl className="flex flex-wrap">
          <Stat name={"餘額"} value={totalBalance} textClassNames="font-mono" />
          <Stat
            name={"可用餘額"}
            value={totalAvailableAmount}
            textClassNames="font-mono"
          />
          <Stat
            name={"未結算額度"}
            value={totalDepositUnsettledAmount}
            textClassNames="font-mono"
          />
          <Stat
            name={"凍結額度"}
            value={totalFrozenAmount}
            textClassNames={"text-rose-600 font-mono"}
          />
        </dl>
      </div>

      <div className="py-8">
        <Label className="text-xl font-bold">訂單數</Label>

        <dl className="flex flex-wrap">
          <div className="flex flex-wrap items-baseline justify-between p-4">
            <dt className="text-sm font-medium leading-6 text-gray-500">
              今日訂單總數
            </dt>
            <dd
              className={
                "w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 font-mono"
              }
            >
              {formatNumberInInteger(
                dailyTransactionCountByOrganizationId?.dailyTotal || "0"
              )}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-between p-4">
            <dt className="text-sm font-medium leading-6 text-gray-500">
              今日代收訂單數 (成功/失敗)
            </dt>
            <dd
              className={
                "w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 font-mono"
              }
            >
              {formatNumberInInteger(
                dailyTransactionCountByOrganizationId?.dailyDepositSuccessTotal ||
                  "0"
              )}{" "}
              /{" "}
              {formatNumberInInteger(
                dailyTransactionCountByOrganizationId?.dailyDepositFailedTotal ||
                  "0"
              )}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-between p-4">
            <dt className="text-sm font-medium leading-6 text-gray-500">
              今日代付訂單數 (成功/失敗)
            </dt>
            <dd
              className={
                "w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 font-mono"
              }
            >
              {formatNumberInInteger(
                dailyTransactionCountByOrganizationId?.dailyWithdrawalSuccessTotal ||
                  "0"
              )}{" "}
              /{" "}
              {formatNumberInInteger(
                dailyTransactionCountByOrganizationId?.dailyWithdrawalFailedTotal ||
                  "0"
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="py-8">
        <Label className="text-xl font-bold">通道</Label>
        <MerchantPaymentMethodInfo organizationId={organizationId} />
      </div>
    </div>
  );
}
