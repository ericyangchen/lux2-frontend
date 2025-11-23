// Currency symbol mapping
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    PHP: "₱",
    USD: "$",
    CNY: "¥",
    TWD: "NT$",
    HKD: "HK$",
    SGD: "S$",
    MYR: "RM",
    IDR: "Rp",
    THB: "฿",
    VND: "₫",
  };
  return symbols[currency] || currency;
};
