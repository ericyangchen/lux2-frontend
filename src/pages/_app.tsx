import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { AppProps } from "next/app";
import ApplicationLayout from "@/modules/common/layout/ApplicationLayout";
import Head from "next/head";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/shadcn/ui/toaster";
import { routesWithoutLayout } from "@/lib/utils/routes";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/router";

const swrConfig = {
  refreshInterval: 0,
};

const FaviconConfig = () => {
  return (
    <>
      {/* Primary favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Additional favicons */}
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />

      {/* Apple Touch Icon */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />

      {/* Manifest for web apps */}
      <link rel="manifest" href="/site.webmanifest" />
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useAuthGuard();

  if (routesWithoutLayout.includes(router.pathname)) {
    return (
      <>
        <Head>
          <FaviconConfig />
        </Head>
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
      <Head>
        <FaviconConfig />
      </Head>
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
