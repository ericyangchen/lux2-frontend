import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { AppProps } from "next/app";
import ApplicationLayout from "@/modules/common/layout/ApplicationLayout";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/shadcn/ui/toaster";
import { routesWithoutLayout } from "@/lib/routes";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/router";

const swrConfig = {
  refreshInterval: 0,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useAuthGuard();

  if (routesWithoutLayout.includes(router.pathname)) {
    return (
      <>
        <SWRConfig value={swrConfig}>
          <Component {...pageProps} />
          <Toaster />
        </SWRConfig>
        <Analytics />
      </>
    );
  }

  return (
    <>
      <SWRConfig value={swrConfig}>
        <ApplicationLayout>
          <Component {...pageProps} />
          <Toaster />
        </ApplicationLayout>
      </SWRConfig>
      <Analytics />
    </>
  );
}
