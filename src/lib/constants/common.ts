const getEnvVar = (key: string) => {
  const value = process.env[key];

  return value;
};

export const getEnvironment = () => {
  return "development";
  return getEnvVar("NEXT_PUBLIC_ENVIRONMENT");
};

export const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
    return "http://localhost:8080";
  }

  return "https://api.dev.sm-pay.org";
  return getEnvVar("NEXT_PUBLIC_BACKEND_URL");
};

export const getCompanyName = () => {
  const environment = getEnvironment();

  if (environment === "development") {
    return "SM-Pay (Dev)";
  }

  if (environment === "staging") {
    return "SM-Pay (Staging)";
  }

  return "SM-Pay";
};

export const currencySymbol = "₱";
