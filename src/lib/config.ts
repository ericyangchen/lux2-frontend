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

const CONFIG_STORAGE_KEY = "app_config";

/**
 * Get config from localStorage
 */
function getConfigFromStorage(): AppConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppConfig;
    }
  } catch (error) {
    console.error("Failed to read config from localStorage:", error);
  }

  return null;
}

/**
 * Save config to localStorage
 */
function saveConfigToStorage(config: AppConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config to localStorage:", error);
  }
}

/**
 * Get configuration values
 * - Server-side: Returns environment variables directly
 * - Client-side: Returns cached config, falls back to localStorage, then throws if neither available
 */
export function getCachedConfig(): AppConfig {
  // On server, use environment variables directly
  if (typeof window === "undefined") {
    return serverConfig;
  }

  // On client, use cached config if available
  if (clientConfigCache) {
    return clientConfigCache;
  }

  // Fall back to localStorage
  const storedConfig = getConfigFromStorage();
  if (storedConfig) {
    // Restore cache from localStorage
    clientConfigCache = storedConfig;
    return storedConfig;
  }

  throw new Error(
    "Config not initialized. Initialize config in _app.tsx first."
  );
}

/**
 * Initialize client-side config cache with server-provided values
 * Called once in _app.tsx with values from getInitialProps
 */
export function initializeConfigWithValues(config: AppConfig): void {
  clientConfigCache = config;
  saveConfigToStorage(config);
}

/**
 * Clear config cache - useful for testing
 */
export function clearConfigCache(): void {
  clientConfigCache = null;
}
