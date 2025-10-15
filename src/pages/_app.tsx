import "@/styles/globals.css";

import App, { AppContext } from "next/app";
import { initializeConfigWithValues, serverConfig } from "@/lib/config";

import { Analytics } from "@vercel/analytics/next";
import type { AppProps } from "next/app";
import ApplicationLayout from "@/modules/common/layout/ApplicationLayout";
import Head from "next/head";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/shadcn/ui/toaster";
import { routesWithoutLayout } from "@/lib/utils/routes";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useRouter } from "next/router";
import { useTokenRefresh } from "@/lib/hooks/useTokenRefresh";

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

interface MyAppProps extends AppProps {
  config?: {
    backendUrl: string;
    environment: string;
  };
}

// Track if we've already initialized config to avoid re-fetching
let configInitialized = false;

export default function MyApp({ Component, pageProps, config }: MyAppProps) {
  const router = useRouter();

  // Initialize config cache immediately (only if we have config and haven't initialized yet)
  if (typeof window !== "undefined" && config && !configInitialized) {
    initializeConfigWithValues(config);
    configInitialized = true;
  }

  useAuthGuard();
  useTokenRefresh(); // Auto-refresh tokens in background

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

// Get config server-side ONLY if not already initialized
MyApp.getInitialProps = async (appContext: AppContext) => {
  // Call default App.getInitialProps
  const appProps = await App.getInitialProps(appContext);

  // Only fetch config on initial load (server-side) or if not already cached
  const isServerSide = typeof window === "undefined";
  const needsConfig = isServerSide || !configInitialized;

  if (needsConfig) {
    return {
      ...appProps,
      config: serverConfig,
    };
  }

  // Skip config on subsequent client-side navigations
  return appProps;
};
