import { Calculator } from "@/lib/calculator";
import { Label } from "@/components/shadcn/ui/label";
import OrganizationBalanceTable from "./OrganizationBalanceTable";
import { classNames } from "@/lib/utils";
import { currencySymbol } from "@/lib/constants";
import { formatNumber } from "@/lib/number";
import { useBalances } from "@/lib/hooks/swr/balance";

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

export default function OrganizationBalance({
  organizationId,
}: {
  organizationId: string;
}) {
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

  return (
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

      <OrganizationBalanceTable balances={balances} />
    </div>
  );
}
