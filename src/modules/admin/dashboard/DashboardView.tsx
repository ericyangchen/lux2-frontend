import { formatNumber, formatNumberInInteger } from "@/lib/utils/number";

import { Calculator } from "@/lib/utils/calculator";
import { Label } from "@/components/shadcn/ui/label";
import { classNames } from "@/lib/utils/classname-utils";
import { currencySymbol } from "@/lib/constants/common";
import { useSystemBalance } from "@/lib/hooks/swr/balance";
import { useSystemDailyTransactionCount } from "@/lib/hooks/swr/transaction";

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

export default function DashboardView() {
  const { systemBalance } = useSystemBalance();

  const totalBalance = systemBalance
    ? Calculator.plus(
        systemBalance.totalAvailableAmount,
        systemBalance.totalDepositUnsettledAmount
      )
    : "0";

  const { systemDailyTransactionCount } = useSystemDailyTransactionCount();

  return (
    <div className="p-4 border rounded-md flex flex-col gap-4">
      <div>
        <Label className="text-xl font-bold">系統總餘額</Label>
        <dl className="flex flex-wrap">
          <Stat name={"餘額"} value={totalBalance} textClassNames="font-mono" />
          <Stat
            name={"可用餘額"}
            value={systemBalance?.totalAvailableAmount}
            textClassNames="font-mono"
          />
          <Stat
            name={"未結算額度"}
            value={systemBalance?.totalDepositUnsettledAmount}
            textClassNames="font-mono"
          />
          <Stat
            name={"凍結額度"}
            value={systemBalance?.totalFrozenAmount}
            textClassNames={"text-rose-600 font-mono"}
          />
        </dl>
      </div>

      <div>
        <Label className="text-xl font-bold">系統總訂單數</Label>

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
              {formatNumberInInteger(systemDailyTransactionCount?.total || "0")}
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
                systemDailyTransactionCount?.depositSuccessTotal || "0"
              )}{" "}
              /{" "}
              {formatNumberInInteger(
                systemDailyTransactionCount?.depositFailedTotal || "0"
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
                systemDailyTransactionCount?.withdrawalSuccessTotal || "0"
              )}{" "}
              /{" "}
              {formatNumberInInteger(
                systemDailyTransactionCount?.withdrawalFailedTotal || "0"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
