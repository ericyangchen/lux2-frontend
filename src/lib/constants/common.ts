const getEnvVar = (key: string) => {
  const value = process.env[key];

  return value;
};

export const getEnvironment = () => {
  return "development"; // development, local
  return "production"; // production
  return getEnvVar("NEXT_PUBLIC_ENVIRONMENT");
};

export const getBackendUrl = () => {
  return "http://localhost:8080"; // local
  return "https://api.sm-pay.org"; // production
  return "https://api.dev.sm-pay.org"; // dev
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
