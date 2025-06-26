interface AppConfig {
  backendUrl: string;
  environment: string;
}

// Server-side config - direct access to environment variables
export const serverConfig: AppConfig = {
  backendUrl: process.env.BACKEND_URL || "http://localhost:8080",
  environment: process.env.ENVIRONMENT || "development",
};

// Client-side config cache
let clientConfigCache: AppConfig | null = null;

/**
 * Get configuration values
 * - Server-side: Returns environment variables directly
 * - Client-side: Returns cached config (must be initialized first)
 */
export function getCachedConfig(): AppConfig {
  // On server, use environment variables directly
  if (typeof window === "undefined") {
    return serverConfig;
  }

  // On client, use cached config
  if (!clientConfigCache) {
    throw new Error(
      "Config not initialized. Initialize config in _app.tsx first."
    );
  }

  return clientConfigCache;
}

/**
 * Initialize client-side config cache with server-provided values
 * Called once in _app.tsx with values from getInitialProps
 */
export function initializeConfigWithValues(config: AppConfig): void {
  clientConfigCache = config;
}

/**
 * Clear config cache - useful for testing
 */
export function clearConfigCache(): void {
  clientConfigCache = null;
}
