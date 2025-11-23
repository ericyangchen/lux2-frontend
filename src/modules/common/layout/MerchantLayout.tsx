import Head from "next/head";
import MerchantNavigationHeader from "./MerchantNavigationHeader";
import { getCompanyName } from "@/lib/constants/common";
import { useNavigation } from "@/lib/hooks/useNavigation";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentNavigation } = useNavigation();

  return (
    <>
      <Head>
        <title>
          {currentNavigation?.name
            ? `${currentNavigation.name} - ${getCompanyName()}`
            : getCompanyName()}
        </title>
      </Head>
      <div className="min-h-screen bg-white">
        <MerchantNavigationHeader />
        <main className="w-full">
          <div className="w-full h-full overflow-x-hidden">{children}</div>
        </main>
      </div>
    </>
  );
}
