const getEnvVar = (key: string) => {
  const value = process.env[key];

  return value;
};

export const getEnvironment = () => {
  return getEnvVar("NEXT_PUBLIC_ENVIRONMENT");
};

export const getBackendUrl = () => {
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
