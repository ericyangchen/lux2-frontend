export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const companyName =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
    ? "匯發 Pay 測試版"
    : "匯發 Pay";

export const currencySymbol = "₱";
